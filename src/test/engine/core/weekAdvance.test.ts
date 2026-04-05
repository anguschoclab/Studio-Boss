import { describe, it, expect } from 'vitest';
import { GameState, Talent } from '@/engine/types';
import { advanceWeek } from '@/engine/core/weekAdvance';
import { RandomGenerator } from '@/engine/utils/rng';

describe('Week Advance Pipeline (Target A4)', () => {
  const mockState = {
    week: 1,
    gameSeed: 1,
    tickCount: 0,
    projects: { active: [] },
    game: { currentWeek: 1 },
    finance: { cash: 1_000_000, ledger: [], weeklyHistory: [] },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    studio: {
      name: 'Player Studio',
      archetype: 'major',
      prestige: 50,
      internal: { projects: {}, contracts: [] }
    },
    market: { opportunities: [], buyers: [] },
    industry: {
      rivals: [],
      families: [],
      agencies: [],
      agents: [],
      talentPool: {} as Record<string, Talent>,
      newsHistory: [],
      rumors: []
    },
    culture: { genrePopularity: {} },
    history: [],
    eventHistory: []
  } as unknown as GameState;

  it('should process the week and return a summarized result', () => {
    const rng = new RandomGenerator(mockState.gameSeed);
    const { newState, summary } = advanceWeek(mockState, rng);
    
    expect(newState.week).toBe(2);
    expect(summary.fromWeek).toBe(1);
    expect(summary.toWeek).toBe(2);
    expect(newState).not.toBe(mockState);
  });
});


  describe('Edge Cases', () => {
    it('advances weeks safely with an empty pipeline', () => {
      const emptyState = {
        week: 1,
        tickCount: 0,
        gameSeed: 123,
        finance: { cash: 1000000, ledger: [{ week: 1, revenue: { boxOffice: 0, distribution: 0, other: 0 }, expenses: { production: 0, marketing: 0, overhead: 0, pacts: 0 }, netProfit: 0 }], weeklyHistory: [{ revenue: { theatrical: 0, streaming: 0, merch: 0, passive: 0 }, expenses: { production: 0, burn: 0, marketing: 0, royalties: 0, interest: 0, pacts: 0 }, net: 0, cash: 1000000, week: 1 }] },
        studio: { name: 'Empty', prestige: 50, archetype: 'indie', internal: { projects: {}, contracts: [], firstLookDeals: [] } },
        market: { opportunities: [], buyers: [], trends: [], activeMarketEvents: [] },
        industry: { rivals: [], talentPool: {}, newsHistory: [], families: [], agencies: [], agents: [] },
        ip: { vault: [], franchises: {} },
        news: { headlines: [] },
        game: { currentWeek: 1 },
        culture: { genrePopularity: {} },
        history: [],
        eventHistory: []
      } as any;

      const localRng = new RandomGenerator(123);
const { newState, summary } = advanceWeek(emptyState, localRng);
      expect(newState.week).toBe(2);
      expect(summary.totalRevenue).toBeGreaterThanOrEqual(0); // Should be 0 + interest
      expect(summary.totalCosts).toBeGreaterThanOrEqual(0); // Should just be overhead
    });
  });
