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

  // 📺 The Syndication Baron: Tweaked streaming renewal thresholds: platforms now cancel expensive shows faster if subscriber growth flatlines. Added further rewards for consistent season-over-season quality.

  // 📺 The Syndication Baron: Add dynamic renewal leniency based on nielsenProfile.audienceRetention
  const retention = project.nielsenProfile?.audienceRetention;
  if (typeof retention === 'number') {
    if (retention < 40) {
      dynamicThreshold += 2.5; // Huge penalty for hemorrhaging viewers
    } else if (retention < 60) {
      dynamicThreshold += 1.0; // Penalty for dropping off
    } else if (retention >= 90) {
      dynamicThreshold -= 1.5; // Big leniency for sticky shows that retain audience week-to-week
    } else if (retention >= 80) {
      dynamicThreshold -= 0.5; // Leniency for good retention
    }
  }

  if (project.budgetTier === 'blockbuster') {
    dynamicThreshold += 10.5; // 📺 The Syndication Baron: Cancel expensive shows faster (streaming wars penalty)
  } else if (project.budgetTier === 'high') {
    dynamicThreshold += 8.0; // 📺 The Syndication Baron: Cancel expensive shows faster
  } else if (project.budgetTier === 'indie') {
    dynamicThreshold -= 2.0; // Give leniency to cheap shows
  } else if (project.budgetTier === 'low') {
    dynamicThreshold -= 1.0;
  }

  // 📺 The Syndication Baron: Reward consistent season-over-season quality and syndication potential.
  if (project.tvDetails && project.tvDetails.episodesAired >= 100) {
    dynamicThreshold -= 4.0; // 📺 The Syndication Baron: Unstoppable momentum for syndication hits (100+ episodes gold tier)
    if (project.reviewScore && project.reviewScore >= 80) {
      dynamicThreshold -= 2.0;
    }
  } else if (project.tvDetails && project.tvDetails.episodesAired >= 88) {
    dynamicThreshold -= 3.0; // 📺 The Syndication Baron: Momentum for syndication hits (88+ episodes silver tier)
    if (project.reviewScore && project.reviewScore >= 80) {
      dynamicThreshold -= 1.5;
    }
  } else if (project.tvDetails && project.tvDetails.currentSeason >= 4) {
    dynamicThreshold -= 2.5; // Massive reward for reaching syndication milestone
    if (project.reviewScore && project.reviewScore >= 80) {
      dynamicThreshold -= 1.0;
    }
  } else if (project.tvDetails && project.tvDetails.currentSeason > 1) {
    dynamicThreshold -= 1.5; // Reward season-over-season quality
    if (project.reviewScore && project.reviewScore >= 80) {
      dynamicThreshold -= 1.5; // Extra leniency for high quality established shows
    }
    if (project.reviewScore && project.reviewScore >= 90) {
      dynamicThreshold -= 0.5; // Additional reward for top tier shows
    }
  } else if (project.tvDetails && project.tvDetails.currentSeason === 1) {
    if (project.reviewScore && project.reviewScore < 60) {
      dynamicThreshold += 3.0; // Penalize freshman shows heavily if their review score is too low
    } else if (project.reviewScore && project.reviewScore >= 85) {
      dynamicThreshold -= 0.5; // Give a chance to promising new shows
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
