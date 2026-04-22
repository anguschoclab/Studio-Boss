import { GameState, StateImpact, StreamerPlatform, SeriesProject } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Pure function to calculate subscriber changes for a single platform.
 * Growth = (LibraryQuality / 100) * (GrowthRate)
 * Churn = CurrentSubs * ChurnRate
 */
function calculateSubChange(platform: StreamerPlatform, rng: RandomGenerator, averageRetention: number): number {
  // 📺 The Syndication Baron: Streaming wars saturated market - lower base growth, higher marketing costs.
  const baseGrowthRate = 0.015; // 1.5% weekly base potential
  const qualityFactor = platform.contentLibraryQuality / 100;
  // Reduced marketing effectiveness (normalized to 1M, lower multiplier)
  const marketingFactor = (platform.marketingSpend || 0) / 1000000;
  
  // Add 1% stochastic variance
  const variance = 1 + (rng.next() - 0.5) * 0.01;
  const growth = (baseGrowthRate * qualityFactor + marketingFactor * 0.005) * platform.subscribers * variance;

  // 📺 The Syndication Baron: Harsher churn penalties for platforms with poor audience retention.
  const retentionFactor = (100 - averageRetention) / 30; // 30 divisor makes bad retention hurt more
  const adjustedChurnRate = platform.churnRate * (0.5 + retentionFactor * 0.5);
  const churn = platform.subscribers * adjustedChurnRate;
  
  return Math.floor(growth - churn);
}

/**
 * Platform Simulation Engine.
 * Processes subscriber dynamics and historical tracking for all Streaming platforms.
 */
export function tickPlatforms(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  const currWeek = state.week;

  const allProjects = [
    ...Object.values(state.studio.internal.projects),
    ...state.industry.rivals.flatMap(rival => Object.values(rival.projects))
  ];

  state.market.buyers.forEach(buyer => {
    if (buyer.archetype === 'streamer') {
      const platform = buyer as StreamerPlatform;

      const platformSeries = allProjects.filter(p => p.type === 'SERIES' && p.buyerId === platform.id && (p as SeriesProject).nielsenProfile?.audienceRetention !== undefined) as SeriesProject[];
      let averageRetention = 60;
      if (platformSeries.length > 0) {
        const retentionSum = platformSeries.reduce((sum, p) => sum + p.nielsenProfile!.audienceRetention, 0);
        averageRetention = retentionSum / platformSeries.length;
      }

      const subChange = calculateSubChange(platform, rng, averageRetention);
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
