import { SeriesProject } from '@/engine/types';

/**
 * Pure function to evaluate if a TV show is renewed or cancelled.
 * Compares current season's average rating against network/platform threshold.
 */
export function evaluateRenewal(
  project: SeriesProject, 
  averageRating: number, 
  threshold: number = 5.0
): 'RENEWED' | 'CANCELLED' | 'ON_AIR' | 'ON_BUBBLE' {
  // If we haven't finished the season yet, keep it on air
  if ((project.tvDetails?.episodesAired || 0) < (project.tvDetails?.episodesOrdered || 1)) {
    return 'ON_AIR';
  }

  // Tweaked streaming renewal thresholds: platforms now cancel expensive shows faster
  // if their metrics drop or if they run for many seasons. Season inflation reflects
  // escalating cast and production costs over time.
  const currentSeason = project.tvDetails?.currentSeason || 1;
  let dynamicThreshold = threshold + ((currentSeason - 1) * 0.2);

  // Shield consistently high-quality shows, punish poorly reviewed ones
  if (project.reviewScore) {
    if (project.reviewScore >= 70) {
      dynamicThreshold -= 0.5;
    } else if (project.reviewScore < 50) {
      dynamicThreshold += 0.5;
    }
  }

  // Renewal decision logic
  if (averageRating >= dynamicThreshold) {
    return 'RENEWED';
  }

  // Potential "Bubble" show logic
  if (averageRating >= dynamicThreshold - 0.5) {
    return 'ON_BUBBLE';
  }

  return 'CANCELLED';
}
