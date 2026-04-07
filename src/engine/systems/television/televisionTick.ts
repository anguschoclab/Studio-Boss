import { GameState, StateImpact, SeriesProject } from '@/engine/types';
import { calculateWeeklyRating } from './ratingsEvaluator';
import { evaluateRenewal } from './renewalEngine';
import { RandomGenerator } from '../../utils/rng';
import { calculateNielsenRatings, buildNielsenProfile, rankShows, assignTimeSlot, NielsenSnapshot } from './nielsenSystem';
import { runUpfronts } from './upfrontsEngine';

const PILOT_MAX_WEEKS = 2;
const PILOT_BURN_RATE = 0.30;

function tickPilots(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  for (const key in state.entities.projects) {
    const project = state.entities.projects[key];
    if (project.type !== 'SERIES' || (project as any).stage !== 'pilot') continue;

    const weeksInPilot = (project.weeksInPhase || 0) + 1;

    if (weeksInPilot < PILOT_MAX_WEEKS) {
      impacts.push({
        type: 'PROJECT_UPDATED',
        payload: {
          projectId: project.id,
          update: {
            weeksInPhase: weeksInPilot,
            weeklyCost: Math.round(project.weeklyCost * PILOT_BURN_RATE),
          }
        }
      });
    } else {
      const quality = ((project as any).scriptHeat ?? 50) * 0.5 + (project.momentum ?? 50) * 0.5;
      const graduated = quality >= 40 || rng.next() < 0.3;

      if (graduated) {
        impacts.push({
          type: 'PILOT_GRADUATED',
          payload: { projectId: project.id, nextState: 'production' as const }
        });
        impacts.push({
          type: 'NEWS_ADDED',
          payload: {
            id: rng.uuid('NWS'),
            headline: `"${project.title}" pilot greenlit to series`,
            description: `The network has ordered a full series pickup.`,
            category: 'development',
            week: state.week
          }
        });
      } else {
        impacts.push({
          type: 'PROJECT_UPDATED',
          payload: {
            projectId: project.id,
            update: { state: 'archived' as const }
          }
        });
        impacts.push({
          type: 'NEWS_ADDED',
          payload: {
            id: rng.uuid('NWS'),
            headline: `"${project.title}" pilot passed on`,
            description: `The network declined to order a full series.`,
            category: 'cancellation',
            week: state.week
          }
        });
      }
    }
  }
  return impacts;
}


export type TVStatus = 'IN_DEVELOPMENT' | 'ON_AIR' | 'ON_BUBBLE' | 'RENEWED' | 'CANCELLED' | 'SYNDICATED';

/**
 * Weekly TV Tick with integrated Nielsen ratings system.
 */
export function tickTelevision(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [
    ...tickPilots(state, rng),
  ];

  // The Upfronts: Week 20
  if (state.week % 52 === 20) {
    impacts.push(...runUpfronts(state, rng));
  }
  
  // Refactored array .find() inside map to a Set/Map lookup, improving performance from O(n^2) to O(n).
  // Loop fusion: We collect allSeries, airingShows, and identify player/rival ownership in a single pass.
  const allSeries: SeriesProject[] = [];
  const airingShows: SeriesProject[] = [];

  // Track ownership to avoid O(N) lookups later
  const isPlayerMap = new Map<string, boolean>();
  const rivalIdMap = new Map<string, string>();

  const playerProjects = state.entities.projects;
  for (const key in playerProjects) {
    if (!Object.prototype.hasOwnProperty.call(playerProjects, key)) continue;
    const p = playerProjects[key];
    if (p.type === 'SERIES' && 'tvDetails' in p) {
      const seriesProject = p as SeriesProject;
      allSeries.push(seriesProject);
      isPlayerMap.set(p.id, true);
      if (seriesProject.tvDetails.status === 'ON_AIR') {
        airingShows.push(seriesProject);
      }
    }
  }

  const rivalsMap = state.entities.rivals || {};
  const rivalsList = Object.values(rivalsMap);

  for (let i = 0; i < rivalsList.length; i++) {
    const rival = rivalsList[i];
    const rivalProjects = rival.projects || {};
    for (const key in rivalProjects) {
      if (!Object.prototype.hasOwnProperty.call(rivalProjects, key)) continue;
      const p = rivalProjects[key];
      if (p.type === 'SERIES' && 'tvDetails' in p) {
        const seriesProject = p as SeriesProject;
        allSeries.push(seriesProject);
        rivalIdMap.set(p.id, rival.id);
        if (seriesProject.tvDetails.status === 'ON_AIR') {
          airingShows.push(seriesProject);
        }
      }
    }
  }

  const weekSnapshots = new Map<string, NielsenSnapshot>();

  // Phase 1: Generate Nielsen snapshots for all airing shows
  for (let i = 0; i < airingShows.length; i++) {
    const project = airingShows[i];
    const aired = (project.tvDetails.episodesAired || 0) + 1;
    const snapshot = calculateNielsenRatings(project, aired, airingShows.length, rng);
    snapshot.week = state.week + 1;
    weekSnapshots.set(project.id, snapshot);
  }

  // Phase 2: Rank all shows by key demo
  const rankedSnapshots = rankShows(weekSnapshots);

  // Phase 3: Process each series
  for (let i = 0; i < allSeries.length; i++) {
    const project = allSeries[i];
    if (project.tvDetails.status !== 'ON_AIR') continue;

    const snapshot = rankedSnapshots.get(project.id);
    if (!snapshot) continue;

    const aired = (project.tvDetails.episodesAired || 0) + 1;

    // Legacy rating (keep backward compat)
    const newRating = calculateWeeklyRating(project, project.buzz || 0, rng);
    const totalRatingSum = (project.tvDetails.averageRating * (project.tvDetails.episodesAired || 0)) + newRating;
    const nextAverageRating = Math.round((totalRatingSum / aired) * 10) / 10;

    // Renewal logic
    let nextStatus: TVStatus = project.tvDetails.status;
    if (aired >= project.tvDetails.episodesOrdered) {
      nextStatus = evaluateRenewal(project, nextAverageRating) as TVStatus;
    }

    // Build updated Nielsen profile
    const existingSnapshots = project.nielsenProfile?.snapshots || [];
    const timeSlot = project.nielsenProfile?.timeSlot || assignTimeSlot(project);
    const updatedSnapshots = [...existingSnapshots, snapshot];
    const nielsenProfile = buildNielsenProfile(updatedSnapshots, timeSlot);

    const isPlayer = isPlayerMap.get(project.id);
    const rivalId = rivalIdMap.get(project.id);
    const rival = rivalId ? rivalsMap[rivalId] : undefined;

    if (isPlayer) {
      impacts.push({
        type: 'PROJECT_UPDATED',
        payload: {
          projectId: project.id,
          update: {
            tvDetails: {
              ...project.tvDetails,
              episodesAired: aired,
              averageRating: nextAverageRating,
              status: nextStatus
            },
            nielsenProfile
          }
        }
      });
    } else if (rival) {
        // Correctly update rival project
        const updatedProject = {
            ...project,
            tvDetails: { ...project.tvDetails, episodesAired: aired, averageRating: nextAverageRating, status: nextStatus },
            nielsenProfile
        };
        impacts.push({
            type: 'RIVAL_UPDATED',
            payload: {
                rivalId: rival.id,
                update: {
                    projects: { ...rival.projects, [project.id]: updatedProject }
                }
            }
        });
    }

    if (nextStatus === 'CANCELLED') {
      const usesDeficit = project.dealModel === 'deficit_financing';
      if (usesDeficit) {
        // Deficit-financed cancelled show (Player or Rival) enters shopping window (4 weeks)
        const update = {
          state: 'shopping' as const,
          shoppingExpiresWeek: state.week + 4,
        };

        if (isPlayer) {
          impacts.push({
            type: 'PROJECT_UPDATED',
            payload: { projectId: project.id, update }
          });
        } else if (rival) {
          impacts.push({
            type: 'RIVAL_UPDATED',
            payload: {
              rivalId: rival.id,
              update: { projects: { ...rival.projects, [project.id]: { ...project, ...update } } }
            }
          });
        }

        impacts.push({
          type: 'NEWS_ADDED',
          payload: {
            id: rng.uuid('NWS'),
            headline: `"${project.title}" cancelled — shopping for new home`,
            description: `The series is now available for pickup by another network.`,
            category: 'cancellation',
            week: state.week
          }
        });
      } else {
        impacts.push({
          type: isPlayer ? 'PROJECT_REMOVED' : 'RIVAL_UPDATED',
          payload: isPlayer
            ? { projectId: project.id }
            : { rivalId: rival?.id, update: { projects: { ...rival?.projects, [project.id]: { ...project, state: 'archived' } } } } as any
        });
      }
    }
  }

  // Phase 4: Handle Shopping Expiration
  // Refactored array spread and .find() inside loop to direct object iteration, improving performance from O(n^2) to O(n).
  const checkShoppingExpiration = (p: any, isPlayer: boolean, rivalId?: string) => {
    if (p.state === 'shopping' && p.shoppingExpiresWeek && state.week >= p.shoppingExpiresWeek) {
      if (isPlayer) {
        impacts.push({
          type: 'PROJECT_UPDATED',
          payload: { projectId: p.id, update: { state: 'archived' as const } }
        });
      } else if (rivalId) {
        const rival = state.entities.rivals[rivalId];
        if (rival) {
          impacts.push({
            type: 'RIVAL_UPDATED',
            payload: { rivalId, update: { projects: { ...rival.projects, [p.id]: { ...p, state: 'archived' as const } } } } as any
          });
        }
      }
    }
  };

  for (const key in playerProjects) {
    if (!Object.prototype.hasOwnProperty.call(playerProjects, key)) continue;
    checkShoppingExpiration(playerProjects[key], true);
  }

  for (let i = 0; i < rivalsList.length; i++) {
    const rival = rivalsList[i];
    const rivalProjects = rival.projects || {};
    for (const key in rivalProjects) {
      if (!Object.prototype.hasOwnProperty.call(rivalProjects, key)) continue;
      checkShoppingExpiration(rivalProjects[key], false, rival.id);
    }
  }

  return impacts;
}
