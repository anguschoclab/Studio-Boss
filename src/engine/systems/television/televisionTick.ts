import { GameState, StateImpact, SeriesProject } from '@/engine/types';
import { calculateWeeklyRating } from './ratingsEvaluator';
import { evaluateRenewal } from './renewalEngine';
import { RandomGenerator } from '../../utils/rng';
import { calculateNielsenRatings, buildNielsenProfile, rankShows, assignTimeSlot, NielsenSnapshot } from './nielsenSystem';
import { runUpfronts } from './upfrontsEngine';
import { tickPilots } from './pilotEvaluator';



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

  // Use unified storage for rival projects
  const rivalProjects: SeriesProject[] = [];
  const projectsDict = state.entities.projects;
  const rivalIds = new Set(rivalsList.map(r => r.id));

  for (const key in projectsDict) {
    if (!Object.prototype.hasOwnProperty.call(projectsDict, key)) continue;
    const p = projectsDict[key];
    if (p.ownerId && rivalIds.has(p.ownerId)) {
      rivalProjects.push(p as SeriesProject);
    }
  }

  for (const p of rivalProjects) {
    if (p.type === 'SERIES' && 'tvDetails' in p) {
      const seriesProject = p as SeriesProject;
      allSeries.push(seriesProject);
      rivalIdMap.set(p.id, p.ownerId || '');
      if (seriesProject.tvDetails.status === 'ON_AIR') {
        airingShows.push(seriesProject);
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

    if (isPlayer || rival) {
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
    }

    if (nextStatus === 'CANCELLED') {
      const usesDeficit = project.dealModel === 'deficit_financing';
      if (usesDeficit) {
        // Deficit-financed cancelled show (Player or Rival) enters shopping window (4 weeks)
        const update = {
          shoppingWindow: 4
        };
        impacts.push({
          type: 'PROJECT_UPDATED',
          payload: { projectId: project.id, update }
        });
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
          type: 'PROJECT_UPDATED',
          payload: { 
            projectId: project.id, 
            update: { state: 'archived' as const } 
          }
        });
      }
    }
  }

  for (const key in state.entities.projects) {
    const p = state.entities.projects[key];
    if (p.state === 'shopping' && p.shoppingExpiresWeek && state.week >= p.shoppingExpiresWeek) {
      impacts.push({
        type: 'PROJECT_UPDATED',
        payload: { projectId: p.id, update: { state: 'archived' as const } }
      });
    }
  }

  return impacts;
}
