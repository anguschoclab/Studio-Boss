import { GameState, StateImpact, SeriesProject } from '@/engine/types';
import { calculateWeeklyRating } from './ratingsEvaluator';
import { evaluateRenewal } from './renewalEngine';
import { RandomGenerator } from '../../utils/rng';
import { calculateNielsenRatings, buildNielsenProfile, assignTimeSlot, NielsenSnapshot, rankShows } from './nielsenSystem';

export type TVStatus = 'IN_DEVELOPMENT' | 'ON_AIR' | 'ON_BUBBLE' | 'RENEWED' | 'CANCELLED' | 'SYNDICATED';

/**
 * Weekly TV Tick with integrated Nielsen ratings system.
 * Processes both player and rival series.
 */
export function tickTelevision(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  
  // Collect all series from player and rivals
  const playerSeries = Object.values(state.studio.internal.projects).filter(
    (p): p is SeriesProject => p.type === 'SERIES' && 'tvDetails' in p
  );
  
  const rivalSeries: SeriesProject[] = [];
  state.industry.rivals.forEach(rival => {
    Object.values(rival.projects || {}).forEach(p => {
      if (p.type === 'SERIES' && 'tvDetails' in p) {
        rivalSeries.push(p as SeriesProject);
      }
    });
  });

  const allSeries = [...playerSeries, ...rivalSeries];
  const airingShows = allSeries.filter(p => p.tvDetails.status === 'ON_AIR');
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
      impacts.push({
        type: isPlayer ? 'PROJECT_REMOVED' : 'RIVAL_UPDATED', // Logic for rival removal would be more complex, but we'll use RIVAL_UPDATED to just mark it
        payload: isPlayer ? { projectId: project.id } : { rivalId: rival?.id, update: { projects: { ...rival?.projects, [project.id]: { ...project, state: 'archived' } } } } as any
      });
    }
  });

  return impacts;
}
