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
  const marketingFactor = (platform.marketingSpend || 0) / 500000; // Normalized to 500k
  
  // Add 1% stochastic variance
  const variance = 1 + (rng.next() - 0.5) * 0.01;
  const growth = (baseGrowthRate * qualityFactor + marketingFactor * 0.01) * platform.subscribers * variance;
  const churn = platform.subscribers * platform.churnRate;
  
  return Math.floor(growth - churn);
}

/**
 * Platform Simulation Engine (Target B1).
 * Processes subscriber dynamics for all Streaming platforms.
 */
export function tickPlatforms(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];

  state.market.buyers.forEach(buyer => {
    if (buyer.archetype === 'streamer') {
      const platform = buyer as StreamerPlatform;
      const subChange = calculateSubChange(platform, rng);
      
      impacts.push({
        type: 'BUYER_UPDATED',
        payload: {
          buyerId: platform.id,
          update: {
            subscribers: Math.max(0, platform.subscribers + subChange)
          }
        }
      });
    }
  });

  return impacts;
}
