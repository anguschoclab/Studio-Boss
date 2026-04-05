import { GameState, StateImpact, SeriesProject } from '@/engine/types';
import { calculateWeeklyRating } from './ratingsEvaluator';
import { evaluateRenewal } from './renewalEngine';
import { RandomGenerator } from '../../utils/rng';
import { calculateNielsenRatings, buildNielsenProfile, rankShows, assignTimeSlot, NielsenSnapshot } from './nielsenSystem';

export type TVStatus = 'IN_DEVELOPMENT' | 'ON_AIR' | 'ON_BUBBLE' | 'RENEWED' | 'CANCELLED' | 'SYNDICATED';

/**
 * Weekly TV Tick with integrated Nielsen ratings system.
 */
export function tickTelevision(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [
    ...tickPilots(state),
  ];

  // The Upfronts: Week 20
  if (state.week % 52 === 20) {
    impacts.push(...processUpfronts(state, rng));
  }
  
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

  const airingShows = series.filter(p => p.tvDetails.status === 'ON_AIR');
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
  series.forEach(project => {
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
            id: `shopping-${project.id}`,
            headline: `"${project.title}" cancelled — shopping for new home`,
            description: `The series is now available for pickup by another network.`,
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

  // Phase 4: Handle Shopping Expiration
  const allProjects = [
    ...Object.values(state.studio.internal.projects),
    ...state.industry.rivals.flatMap(r => Object.values(r.projects || {}))
  ];

  allProjects.forEach(p => {
    if (p.state === 'shopping' && p.shoppingExpiresWeek && state.week >= p.shoppingExpiresWeek) {
      const isPlayer = !!state.studio.internal.projects[p.id];
      const rival = state.industry.rivals.find(r => !!(r.projects || {})[p.id]);

      impacts.push({
        type: isPlayer ? 'PROJECT_UPDATED' : 'RIVAL_UPDATED',
        payload: isPlayer
          ? { projectId: p.id, update: { state: 'archived' as const } }
          : { rivalId: rival?.id, update: { projects: { ...rival?.projects, [p.id]: { ...p, state: 'archived' as const } } } } as any
      });
    }
  });

  return impacts;
}
