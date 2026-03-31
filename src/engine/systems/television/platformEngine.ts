import { GameState, StateImpact, StreamerPlatform } from '@/engine/types';

/**
 * Pure function to calculate subscriber changes for a single platform.
 * Growth = (LibraryQuality / 100) * (GrowthRate)
 * Churn = CurrentSubs * ChurnRate
 */
function calculateSubChange(platform: StreamerPlatform): number {
  const baseGrowthRate = 0.02; // 2% weekly base potential
  const qualityFactor = platform.contentLibraryQuality / 100;
  const marketingFactor = platform.marketingSpend / 500000; // Normalized to 500k
  
  const growth = (baseGrowthRate * qualityFactor + marketingFactor * 0.01) * platform.subscribers;
  const churn = platform.subscribers * platform.churnRate;
  
  return Math.floor(growth - churn);
}

/**
 * Platform Simulation Engine (Target B1).
 * Processes subscriber dynamics for all Streaming platforms.
 */
export function tickPlatforms(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];

  state.market.buyers.forEach(buyer => {
    if (buyer.archetype === 'streamer') {
      const platform = buyer as StreamerPlatform;
      const subChange = calculateSubChange(platform);
      
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
