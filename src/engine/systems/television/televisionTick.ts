import { GameState, StateImpact, SeriesProject } from '@/engine/types';
import { calculateWeeklyRating } from './ratingsEvaluator';
import { evaluateRenewal } from './renewalEngine';
import { RandomGenerator } from '../../utils/rng';
import { calculateNielsenRatings, buildNielsenProfile, assignTimeSlot, NielsenSnapshot, rankShows } from './nielsenSystem';

const PILOT_MAX_WEEKS = 2;
const PILOT_BURN_RATE = 0.30; // pilot costs 30% of full production weeklyCost

/**
 * Processes projects in pilot stage: caps production at 2 weeks,
 * then graduates or cancels based on script quality and momentum.
 */
function tickPilots(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  for (const key in state.studio.internal.projects) {
    const project = state.studio.internal.projects[key];
    if (project.type !== 'SERIES' || (project as any).stage !== 'pilot') continue;

    const weeksInPilot = (project.weeksInPhase || 0) + 1;

    if (weeksInPilot < PILOT_MAX_WEEKS) {
      // Tick pilot week — reduced burn only (cost handled by finance tick via weeklyCost)
      impacts.push({
        type: 'PROJECT_UPDATED',
        payload: {
          projectId: project.id,
          update: {
            weeksInPhase: weeksInPilot,
            // Pilot costs are suppressed to 30% via weeklyCost override
            weeklyCost: Math.round(project.weeklyCost * PILOT_BURN_RATE),
          }
        }
      });
    } else {
      // Pilot complete — evaluate graduation
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
            id: `pilot-grad-${project.id}`,
            headline: `"${project.title}" pilot greenlit to series`,
            description: `The network has ordered a full series pickup.`,
            category: 'development'
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
            id: `pilot-pass-${project.id}`,
            headline: `"${project.title}" pilot passed on`,
            description: `The network declined to order a full series.`,
            category: 'cancellation'
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
 * Processes both player and rival series.
 */
export function tickTelevision(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [
    ...tickPilots(state, rng),
  ];
  
  // Collect all series from player and rivals
  const allSeries: SeriesProject[] = [];
  const airingShows: SeriesProject[] = [];

  const playerProjects = Object.values(state.studio.internal.projects);
  for (let i = 0; i < playerProjects.length; i++) {
    const p = playerProjects[i];
    if (p.type === 'SERIES' && 'tvDetails' in p) {
      const seriesProject = p as SeriesProject;
      allSeries.push(seriesProject);
      if (seriesProject.tvDetails.status === 'ON_AIR') {
        airingShows.push(seriesProject);
      }
    }
  }

  const rivals = state.industry.rivals;
  for (let i = 0; i < rivals.length; i++) {
    const rivalProjects = Object.values(rivals[i].projects || {});
    for (let j = 0; j < rivalProjects.length; j++) {
      const p = rivalProjects[j];
      if (p.type === 'SERIES' && 'tvDetails' in p) {
        const seriesProject = p as SeriesProject;
        allSeries.push(seriesProject);
        if (seriesProject.tvDetails.status === 'ON_AIR') {
          airingShows.push(seriesProject);
        }
      }
    }
  }
  const weekSnapshots = new Map<string, NielsenSnapshot>();

  // Phase 1: Generate Nielsen snapshots for all airing shows
  airingShows.forEach(project => {
    const aired = (project.tvDetails.episodesAired || 0) + 1;
    const snapshot = calculateNielsenRatings(project, aired, airingShows.length, rng);
    snapshot.week = state.week + 1;
    weekSnapshots.set(project.id, snapshot);
  });

  // Phase 2: Rank all shows by key demo
  const rankedSnapshots = rankShows(weekSnapshots);

  // Phase 3: Process each series
  allSeries.forEach(project => {
    if (project.tvDetails.status !== 'ON_AIR') return;

    const snapshot = rankedSnapshots.get(project.id);
    if (!snapshot) return;

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

    // Identify owner for impact
    const isPlayer = !!state.studio.internal.projects[project.id];
    const rival = state.industry.rivals.find(r => !!(r.projects || {})[project.id]);

    if (isPlayer) {
      impacts.push({
        type: 'PROJECT_UPDATED',
        payload: {
          projectId: project.id,
          update: {
            tvDetails: { ...project.tvDetails, episodesAired: aired, averageRating: nextAverageRating, status: nextStatus },
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
      if (isPlayer && project.dealModel === 'deficit_financing') {
        // Deficit-financed cancelled show enters shopping window (4 weeks)
        impacts.push({
          type: 'PROJECT_UPDATED',
          payload: {
            projectId: project.id,
            update: {
              state: 'shopping' as const,
              shoppingExpiresWeek: state.week + 4,
            }
          }
        });
        impacts.push({
          type: 'NEWS_ADDED',
          payload: {
            id: `shopping-${project.id}`,
            headline: `"${project.title}" cancelled — shopping for new home`,
            description: `The show is now available for pickup by another network.`,
            category: 'cancellation'
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
  });

  return impacts;
}
