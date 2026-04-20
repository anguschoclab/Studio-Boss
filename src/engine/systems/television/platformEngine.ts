import { GameState, StateImpact, StreamerPlatform, SeriesProject } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Pure function to calculate subscriber changes for a single platform.
 * Growth = (LibraryQuality / 100) * (GrowthRate)
 * Churn = CurrentSubs * ChurnRate
 */
function calculateSubChange(platform: StreamerPlatform, rng: RandomGenerator, seasonOverSeasonQuality: number = 0, syndicationHits: number = 0, avgAudienceRetention: number = 60): number {
  const baseGrowthRate = 0.02; // 2% weekly base potential
  const qualityFactor = platform.contentLibraryQuality / 100;
  // Use a fallback for marketingSpend if not defined
  const marketingFactor = (platform.marketingSpend || 0) / 500000; // Normalized to 500k
  
  // Add 1% stochastic variance
  const variance = 1 + (rng.next() - 0.5) * 0.01;
  const growth = (baseGrowthRate * qualityFactor + marketingFactor * 0.01) * platform.subscribers * variance;

  // 📺 The Syndication Baron: Streaming wars subscriber churn penalty for flatlining growth.
  // Tweaked streaming subscriber churn rates to be more aggressive in the cutthroat environment.
  let dynamicChurnRate = platform.churnRate;
  const historyLen = platform.subscriberHistory?.length || 0;
  if (historyLen >= 4) {
    const currentSubs = platform.subscribers;
    const pastSubs = platform.subscriberHistory[historyLen - 4].count;
    const growthPercent = pastSubs > 0 ? (currentSubs - pastSubs) / pastSubs : 0;
    // 📺 The Syndication Baron: Tweaked streaming subscriber churn rates. Aggressively penalizing platforms that fail to retain subscribers or flatline in the cutthroat streaming wars.
    if (growthPercent < 0.0) {
      dynamicChurnRate = Math.min(0.95, dynamicChurnRate * 12.0); // 📺 The Syndication Baron: Devastating Penalty for negative growth (cutthroat)
    } else if (growthPercent < 0.01) {
      dynamicChurnRate = Math.min(0.85, dynamicChurnRate * 9.0); // 📺 The Syndication Baron: Extreme Penalty for flatlining
    } else if (growthPercent < 0.02) {
      dynamicChurnRate = Math.min(0.60, dynamicChurnRate * 6.0); // Aggressive Penalty
    } else if (growthPercent > 0.15) {
      dynamicChurnRate = Math.max(0.002, dynamicChurnRate * 0.2); // Massive Bonus for hyper growth
    } else if (growthPercent > 0.08) {
      dynamicChurnRate = Math.max(0.008, dynamicChurnRate * 0.4); // Strong Bonus
    }
  }

  // 📺 The Syndication Baron: Reward consistent season-over-season quality and mega-hit library quality (sticky subscribers).
  if (qualityFactor > 0.90) {
    dynamicChurnRate = Math.max(0.001, dynamicChurnRate * 0.2); // Sticky subscribers for mega-hit library
  } else if (qualityFactor > 0.85) {
    dynamicChurnRate = Math.max(0.005, dynamicChurnRate * 0.5);
  }

  // 📺 The Syndication Baron: Reward consistent season-over-season quality for active shows.
  if (seasonOverSeasonQuality > 90) {
    dynamicChurnRate = Math.max(0.003, dynamicChurnRate * 0.3); // Extreme loyalty for highly rated ongoing shows
  } else if (seasonOverSeasonQuality > 80) {
    dynamicChurnRate = Math.max(0.008, dynamicChurnRate * 0.5); // Strong loyalty for good ongoing shows
  }

  // 📺 The Syndication Baron: Reward platforms with sticky syndication hits (100+ episodes gold tier).
  if (syndicationHits > 0) {
    const syndicationShield = Math.max(0.1, 1.0 - (syndicationHits * 0.25));
    dynamicChurnRate *= syndicationShield;
  }

  // 📺 The Syndication Baron: Adjust streaming subscriber churn rates based on audience retention.
  if (avgAudienceRetention < 40) {
    dynamicChurnRate = Math.max(dynamicChurnRate, Math.min(0.95, dynamicChurnRate * 2.0)); // Punish platforms keeping shows that hemorrhage viewers
  } else if (avgAudienceRetention < 60) {
    dynamicChurnRate = Math.max(dynamicChurnRate, Math.min(0.90, dynamicChurnRate * 1.2)); // Punish platforms with dropping viewers
  } else if (avgAudienceRetention > 90) {
    dynamicChurnRate = Math.min(dynamicChurnRate, Math.max(0.005, dynamicChurnRate * 0.6)); // Reward platforms with sticky viewers that return episode after episode
  } else if (avgAudienceRetention > 80) {
    dynamicChurnRate = Math.min(dynamicChurnRate, Math.max(0.008, dynamicChurnRate * 0.8));
  }

  const churn = platform.subscribers * dynamicChurnRate;
  
  return Math.floor(growth - churn);
}

/**
 * Platform Simulation Engine.
 * Processes subscriber dynamics and historical tracking for all Streaming platforms.
 */
export function tickPlatforms(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  const currWeek = state.week;

  state.market.buyers.forEach(buyer => {
    if (buyer.archetype === 'streamer') {
      const platform = buyer as StreamerPlatform;

      let seasonOverSeasonQuality = 0;
      let syndicationHits = 0;
      let totalRetention = 0;
      let retentionCount = 0;

      if (platform.activeLicenses && platform.activeLicenses.length > 0) {
        let totalScore = 0;
        let count = 0;
        for (let i = 0; i < platform.activeLicenses.length; i++) {
          const license = platform.activeLicenses[i];
          const project = state.entities.projects[license.projectId];
          if (project && project.type === 'SERIES' && 'tvDetails' in project) {
            const seriesProject = project as SeriesProject;
            if (seriesProject.tvDetails.currentSeason > 1 && seriesProject.reviewScore != null) {
              totalScore += seriesProject.reviewScore;
              count++;
            }
            if (seriesProject.tvDetails.episodesAired >= 100) { // 📺 The Syndication Baron: 100-episode syndication deals
              syndicationHits++;
            }

            if (seriesProject.nielsenProfile && typeof seriesProject.nielsenProfile.audienceRetention === 'number') {
              totalRetention += seriesProject.nielsenProfile.audienceRetention;
              retentionCount++;
            }
          }
        }
        if (count > 0) {
          seasonOverSeasonQuality = totalScore / count;
        }
      }

      const avgAudienceRetention = retentionCount > 0 ? totalRetention / retentionCount : 60;

      const subChange = calculateSubChange(platform, rng, seasonOverSeasonQuality, syndicationHits, avgAudienceRetention);
      const newSubCount = Math.max(0, platform.subscribers + subChange);
      
      // Update subscribers and history
      const history = [...(platform.subscriberHistory || [])];
      history.push({ week: currWeek, count: newSubCount });
      
      // Keep only 52 weeks of history
      const trimmedHistory = history.slice(-52);

      impacts.push({
        type: 'BUYER_UPDATED',
        payload: {
          buyerId: platform.id,
          update: {
            subscribers: newSubCount,
            subscriberHistory: trimmedHistory
          }
        }
      });
    }
  });

  return impacts;
}
