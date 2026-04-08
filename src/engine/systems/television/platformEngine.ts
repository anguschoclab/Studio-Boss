import { GameState, StateImpact, StreamerPlatform } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Pure function to calculate subscriber changes for a single platform.
 * Growth = (LibraryQuality / 100) * (GrowthRate)
 * Churn = CurrentSubs * ChurnRate
 */
function calculateSubChange(platform: StreamerPlatform, rng: RandomGenerator): number {
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
    if (growthPercent < 0.01) {
      dynamicChurnRate = Math.min(0.60, dynamicChurnRate * 6.0); // Extreme Penalty
    } else if (growthPercent < 0.02) {
      dynamicChurnRate = Math.min(0.45, dynamicChurnRate * 4.5); // Aggressive Penalty
    } else if (growthPercent > 0.08) {
      dynamicChurnRate = Math.max(0.01, dynamicChurnRate * 0.7); // Strong Bonus
    }
  }

  // Reward consistent season-over-season quality (high library quality)
  if (qualityFactor > 0.85) {
    dynamicChurnRate = Math.max(0.01, dynamicChurnRate * 0.7);
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
      const subChange = calculateSubChange(platform, rng);
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
