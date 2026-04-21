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

  // 📺 The Syndication Baron: Tweaked streaming renewal thresholds: platforms now cancel expensive shows faster if subscriber growth flatlines.
  let dynamicThreshold = threshold;

  if (project.budgetTier === 'blockbuster') dynamicThreshold += 1.0;
  else if (project.budgetTier === 'high') dynamicThreshold += 0.5;
  else if (project.budgetTier === 'low') dynamicThreshold -= 0.5;

  const audienceRetention = project.nielsenProfile?.audienceRetention;
  if (audienceRetention !== undefined) {
    if (audienceRetention >= 90) dynamicThreshold -= 0.5;
    else if (audienceRetention <= 50) dynamicThreshold += 0.5;
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
