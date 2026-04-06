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

  // 🏆 The Prestige Effect: Successful award recognition now significantly lowers the cancellation threshold,
  // acknowledging that critical acclaim (Emmys/Globes) can justify continuing a lower-rated series.
  // ⚡ The Framerate Fanatic: Refactored .filter().length into a direct counter loop to prevent unnecessary array allocations.
  let awardWins = 0;
  if (project.awards) {
    for (let i = 0; i < project.awards.length; i++) {
      if (project.awards[i].status === 'won') {
        awardWins++;
      }
    }
  }
  let dynamicThreshold = threshold;
  
  // Each major award win lowers the required rating threshold by 1.5 points (limit to 3.0 total reduction)
  const awardLeniency = Math.min(3.0, awardWins * 1.5);
  dynamicThreshold -= awardLeniency;

  // 📺 The Syndication Baron: Tweaked streaming renewal thresholds: platforms now cancel expensive shows faster if subscriber growth flatlines.
  if (project.budgetTier === 'blockbuster') {
    dynamicThreshold += 4.0; // Cancel expensive shows faster
  } else if (project.budgetTier === 'high') {
    dynamicThreshold += 2.0;
  }

  // Reward consistent season-over-season quality
  if (project.tvDetails && project.tvDetails.currentSeason > 2) {
    dynamicThreshold -= 0.5;
    if (project.reviewScore && project.reviewScore >= 80) {
      dynamicThreshold -= 1.0; // Extra leniency for high quality established shows
    }
    if (project.reviewScore && project.reviewScore >= 90) {
      dynamicThreshold -= 0.5; // Additional reward for top tier shows
    }
  } else if (project.reviewScore && project.reviewScore >= 85) {
    dynamicThreshold -= 0.5; // Give a chance to promising new shows
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
