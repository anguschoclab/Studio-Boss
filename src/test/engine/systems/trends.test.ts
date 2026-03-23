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
    const updatedTrends = advanceTrends(initialTrends);
    
    expect(updatedTrends.length).toBeGreaterThanOrEqual(initialTrends.length - 1); // might drop if dead
    // Values should fluctuate but remain clamped
    updatedTrends.forEach(trend => {
      expect(trend.heat).toBeGreaterThanOrEqual(0);
      expect(trend.heat).toBeLessThanOrEqual(100);
    });
  });

  it('calculates the trend multiplier for a matching genre', () => {
    const trends = initializeTrends();
    // Force the first genre to have a very high heat
    trends[0].heat = 100;
    const state = { trends } as any;

    const multiplier = getTrendMultiplier(trends[0].genre, state);
    expect(multiplier).toBe(1.5); // 0.8 + 0.7 = 1.5
  });

  it('returns a multiplier of 1.0 for a missing genre', () => {
    const state = { trends: [] } as any;
    const multiplier = getTrendMultiplier('Unknown Genre', state);
    expect(multiplier).toBe(1.0); // Fallback to 1.0
  });

  it('shifts directions properly based on thresholds', () => {
    // Hard to test random tightly, but we can verify it doesn't crash 
    // and returns valid state strings.
    let trends = initializeTrends();
    for (let i = 0; i < 50; i++) {
        trends = advanceTrends(trends);
    }
    
    trends.forEach(trend => {
        expect(['rising', 'cooling', 'stable', 'dead']).toContain(trend.direction);
    });
  });
});
