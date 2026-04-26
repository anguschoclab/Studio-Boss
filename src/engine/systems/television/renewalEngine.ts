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

  // 📺 The Syndication Baron: reward consistent season-over-season quality. The longer it runs, the stickier the syndication value.
  const currentSeason = project.tvDetails?.currentSeason || 1;
  if (currentSeason >= 3 && currentSeason < 5) threshold -= 0.5;
  else if (currentSeason >= 5) threshold -= 2.0; // Deep syndication reward

  // 📺 The Syndication Baron: Adjusted budget tier penalties to be more cutthroat for blockbusters.
  let dynamicThreshold = threshold;

  if (project.budgetTier === 'blockbuster') dynamicThreshold += 3.0; // More ruthless
  else if (project.budgetTier === 'high') dynamicThreshold += 1.5;
  else if (project.budgetTier === 'low') dynamicThreshold -= 0.5;
  else if (project.budgetTier === 'indie') dynamicThreshold -= 0.25;

  const audienceRetention = project.nielsenProfile?.audienceRetention;
  if (audienceRetention !== undefined) {
    if (audienceRetention >= 90) dynamicThreshold -= 1.0; // Huge reward for sticky shows
    else if (audienceRetention <= 60) dynamicThreshold += 2.0; // Immediate cancellation risk for poor retention
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
