import { GameState, StateImpact, SeriesProject } from '@/engine/types';
import { calculateWeeklyRating } from './ratingsEvaluator';
import { evaluateRenewal } from './renewalEngine';

export type TVStatus = 'IN_DEVELOPMENT' | 'ON_AIR' | 'ON_BUBBLE' | 'RENEWED' | 'CANCELLED' | 'SYNDICATED';

/**
 * Weekly TV Tick (Target B2/C).
 * Processes airing loops and renewal logic for episodic content.
 * Returns discrete StateImpacts instead of modifying state directly.
 */
export function tickTelevision(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  const series = state.projects.active.filter(p => p.type === 'SERIES' && p.tvDetails) as SeriesProject[];

  series.forEach(project => {
    // Only process shows actively airing
    if (project.tvDetails.status !== 'ON_AIR') return;

    // 1. Ratings Logic
    const newRating = calculateWeeklyRating(project, project.buzz);
    const aired = (project.tvDetails.episodesAired || 0) + 1;
    const totalRatingSum = (project.tvDetails.averageRating * (project.tvDetails.episodesAired || 0)) + newRating;
    const nextAverageRating = Math.round((totalRatingSum / aired) * 10) / 10;

    // 2. Renewal & Status Logic
    let nextStatus: TVStatus = project.tvDetails.status;
    if (aired >= project.tvDetails.episodesOrdered) {
      nextStatus = evaluateRenewal(project, nextAverageRating) as TVStatus;
    }

    // 3. Generate Impact
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
          }
        }
      }
    });

    // 4. Archive Logic
    if (nextStatus === 'CANCELLED') {
      impacts.push({
        type: 'PROJECT_REMOVED',
        payload: { projectId: project.id, reason: 'CANCELLED' }
      });
    }
  });

  return impacts;
}
