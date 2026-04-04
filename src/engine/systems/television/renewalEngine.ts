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

  // 📺 The Syndication Baron: Tweaked streaming renewal thresholds: platforms now cancel expensive shows faster,
  // but reward consistent multi-season hits and exceptionally high review scores (season-over-season quality).
  let dynamicThreshold = threshold;
  if (project.budgetTier === 'blockbuster') {
    dynamicThreshold += 2.0; // Cancel expensive shows faster
  } else if (project.budgetTier === 'high') {
    dynamicThreshold += 1.0;
  }

  // Reward consistent season-over-season quality
  if (project.tvDetails && project.tvDetails.currentSeason > 2) {
    dynamicThreshold -= 0.5;
    if (project.reviewScore && project.reviewScore >= 80) {
      dynamicThreshold -= 0.5; // Extra leniency for high quality established shows
    }
  } else if (project.reviewScore && project.reviewScore >= 85) {
    dynamicThreshold -= 0.3; // Give a chance to promising new shows
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
