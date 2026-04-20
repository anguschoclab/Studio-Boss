import { describe, it, expect } from 'vitest';
import { GameState, Talent } from '@/engine/types';
import { advanceWeek } from '@/engine/core/weekAdvance';
import { RandomGenerator } from '@/engine/utils/rng';

describe('Week Advance Pipeline (Target A4)', () => {
  const mockState = {
    week: 1,
    gameSeed: 1,
    tickCount: 0,
    game: { currentWeek: 1 },
    entities: {
      projects: {},
      talents: {},
      contracts: {},
      rivals: {}
    },
    finance: { cash: 1_000_000, ledger: [], weeklyHistory: [], marketState: { baseRate: 0.05, savingsYield: 0.02, debtRate: 0.1, loanRate: 0.08, rateHistory: [], sentiment: 50, cycle: 'STABLE' } },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    studio: {
      name: 'Player Studio',
      archetype: 'major',
      prestige: 50,
      ownedPlatforms: [],
      internal: { projectHistory: [] }
    },
    market: { opportunities: [], buyers: [] },
    industry: {
      rivals: [],
      families: [],
      agencies: [],
      agents: [],
      talentPool: {} as Record<string, Talent>,
      newsHistory: [],
    },
    relationships: {
      discovery: {
        hiddenTalentPool: {},
        guestStarBookings: {}
      }
    },
    culture: { genrePopularity: {} },
    deals: { activeDeals: [], pendingOffers: [], expiredDeals: [] },
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
        entities: {
          projects: {},
          talents: {},
          contracts: {},
          rivals: {}
        },
        finance: { 
          cash: 1000000, 
          ledger: [], 
          weeklyHistory: [],
          marketState: { baseRate: 0.05, savingsYield: 0.02, debtRate: 0.1, loanRate: 0.08, rateHistory: [], sentiment: 50, cycle: 'STABLE' }
        },
        studio: { name: 'Empty', prestige: 50, archetype: 'indie', ownedPlatforms: [], internal: { projectHistory: [] } },
        deals: { activeDeals: [], pendingOffers: [], expiredDeals: [] },
        market: { opportunities: [], buyers: [] },
        industry: { rivals: [], talentPool: {}, newsHistory: [], families: [], agencies: [], agents: [] },
        relationships: { discovery: { hiddenTalentPool: {}, guestStarBookings: {} } },
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
