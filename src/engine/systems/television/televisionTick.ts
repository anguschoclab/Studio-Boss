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
  const impacts: StateImpact[] = [];
  const series = Object.values(state.studio.internal.projects).filter(
    (p): p is SeriesProject => p.type === 'SERIES' && 'tvDetails' in p
  );

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
      }
    });

    if (nextStatus === 'CANCELLED') {
      impacts.push({
        type: 'PROJECT_REMOVED',
        payload: { projectId: project.id }
      });
    }
  });

  return impacts;
}
