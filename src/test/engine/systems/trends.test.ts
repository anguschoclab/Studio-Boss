import { describe, it, expect } from 'vitest';
import { initializeTrends, advanceTrends, getTrendMultiplier } from '../../../engine/systems/trends';

describe('Trends System', () => {
  it('initializes with a set of default genre trends', () => {
    const trends = initializeTrends();
    expect(trends.length).toBeGreaterThan(0);
    
    // Check structure
    expect(trends[0].genre).toBeDefined();
    expect(trends[0].heat).toBeGreaterThanOrEqual(10);
    expect(trends[0].heat).toBeLessThanOrEqual(100);
  });

  it('advances trends correctly over a week', () => {
    const initialTrends = initializeTrends();
    const impacts = advanceTrends(initialTrends);
    const trendImpact = impacts.find(i => i.type === 'TRENDS_UPDATED');
    const newTrends = trendImpact?.payload.trends;
    
    expect(newTrends?.length).toBeGreaterThanOrEqual(initialTrends.length - 1); // might drop if dead
    // Values should fluctuate but remain clamped
    newTrends?.forEach((trend: any) => {
      expect(trend.heat).toBeGreaterThanOrEqual(0);
      expect(trend.heat).toBeLessThanOrEqual(100);
    });
  });

  it('calculates the trend multiplier for a matching genre', () => {
    const trends = initializeTrends();
    // Force the first genre to have a very high heat
    trends[0].heat = 100;
    const state = { market: { trends } } as any;

    const multiplier = getTrendMultiplier({ genre: trends[0].genre, targetAudience: 'Any' }, state);
    expect(multiplier).toBe(1.3); // 1.0 + 0.3 = 1.3
  });

  it('returns a multiplier of 1.0 for a missing genre', () => {
    const state = { market: { trends: [] } } as any;
    const multiplier = getTrendMultiplier({ genre: 'Unknown Genre', targetAudience: 'Any' }, state);
    expect(multiplier).toBe(1.0); // Fallback to 1.0
  });

  it('shifts directions properly based on thresholds', () => {
    let trends = initializeTrends();
    for (let i = 0; i < 50; i++) {
        const impacts = advanceTrends(trends);
        const trendImpact = impacts.find(i => i.type === 'TRENDS_UPDATED');
        trends = trendImpact?.payload.trends || [];
    }
    
    trends.forEach(trend => {
        expect(['rising', 'cooling', 'stable', 'dead']).toContain(trend.direction);
    });
  });
});
