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

  // 📺 The Syndication Baron: Cutthroat streaming wars - platforms cancel expensive shows faster.
  let dynamicThreshold = threshold;

  // Harsher penalties for expensive shows to reflect tightening budgets
  if (project.budgetTier === 'blockbuster') dynamicThreshold += 1.5;
  else if (project.budgetTier === 'high') dynamicThreshold += 1.0;
  else if (project.budgetTier === 'low') dynamicThreshold -= 0.5;

  const audienceRetention = project.nielsenProfile?.audienceRetention;
  if (audienceRetention !== undefined) {
    if (audienceRetention >= 90) dynamicThreshold -= 0.5;
    else if (audienceRetention <= 50) dynamicThreshold += 1.0; // Harsher penalty for low retention
  }

  // 📺 The Syndication Baron: Reward consistent season-over-season quality.
  // Lower the threshold slightly for established, critically acclaimed shows.
  const currentSeason = project.tvDetails?.currentSeason || 1;
  const reviewScore = project.reviewScore || 50;
  if (currentSeason > 1 && reviewScore >= 80) {
      // Up to 1.0 point reduction for long-running prestige shows
      const seasonBonus = Math.min(0.5, (currentSeason - 1) * 0.1);
      const qualityBonus = Math.min(0.5, (reviewScore - 80) / 40);
      dynamicThreshold -= (seasonBonus + qualityBonus);
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
