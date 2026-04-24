import { GameState, StateImpact, StreamerPlatform, SeriesProject } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Pure function to calculate subscriber changes for a single platform.
 * Growth = (LibraryQuality / 100) * (GrowthRate)
 * Churn = CurrentSubs * ChurnRate
 */
function calculateSubChange(platform: StreamerPlatform, rng: RandomGenerator, averageRetention: number): number {
  const baseGrowthRate = 0.02; // 2% weekly base potential
  const qualityFactor = platform.contentLibraryQuality / 100;
  // Use a fallback for marketingSpend if not defined
  const marketingFactor = (platform.marketingSpend || 0) / 500000; // Normalized to 500k
  
  // Add 1% stochastic variance
  const variance = 1 + (rng.next() - 0.5) * 0.01;
  const growth = (baseGrowthRate * qualityFactor + marketingFactor * 0.01) * platform.subscribers * variance;

  // 📺 The Syndication Baron: Tweaked streaming renewal thresholds: platforms now cancel expensive shows faster if subscriber growth flatlines.
  const retentionFactor = (100 - averageRetention) / 40;
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

  // ⚡ The Framerate Fanatic: Optimize project iteration using for...in loops and single pass to prevent O(N^2) complexity and GC pressure from Object.values/flatMap
  const platformRetentionStats: Record<string, { count: number, sum: number }> = {};

  for (const pid in state.entities?.projects || {}) {
    const p = state.entities.projects[pid];
    if (p.type === 'SERIES' && p.buyerId && (p as SeriesProject).nielsenProfile?.audienceRetention !== undefined) {
      if (!platformRetentionStats[p.buyerId]) platformRetentionStats[p.buyerId] = { count: 0, sum: 0 };
      platformRetentionStats[p.buyerId].count++;
      platformRetentionStats[p.buyerId].sum += (p as SeriesProject).nielsenProfile!.audienceRetention;
    }
  }

  for (const rivalId in state.entities?.rivals || {}) {
    const rival = state.entities.rivals[rivalId];
    for (const pid in rival.projects || {}) {
      const p = rival.projects[pid];
      if (p.type === 'SERIES' && p.buyerId && (p as SeriesProject).nielsenProfile?.audienceRetention !== undefined) {
        if (!platformRetentionStats[p.buyerId]) platformRetentionStats[p.buyerId] = { count: 0, sum: 0 };
        platformRetentionStats[p.buyerId].count++;
        platformRetentionStats[p.buyerId].sum += (p as SeriesProject).nielsenProfile!.audienceRetention;
      }
    }
  }

  state.market.buyers.forEach(buyer => {
    if (buyer.archetype === 'streamer') {
      const platform = buyer as StreamerPlatform;

      const stats = platformRetentionStats[platform.id];
      let averageRetention = 60;
      if (stats && stats.count > 0) {
        averageRetention = stats.sum / stats.count;
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
