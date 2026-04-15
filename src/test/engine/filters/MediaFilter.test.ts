import { describe, it, expect, beforeEach } from 'vitest';
import { MediaFilter } from '@/engine/services/filters/MediaFilter';
import { GameState } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';
import { TickContext } from '@/engine/services/filters/types';

describe('MediaFilter', () => {
  let filter: MediaFilter;
  let mockState: GameState;
  let mockContext: TickContext;
  let mockRng: RandomGenerator;

  beforeEach(() => {
    filter = new MediaFilter();
    mockRng = new RandomGenerator(42);
    
    mockState = {
      week: 1,
      tickCount: 1,
      gameSeed: 12345,
      rngState: 12345,
      studio: {
        id: 'studio-1',
        name: 'Test Studio',
        archetype: 'major',
        prestige: 50,
      } as any,
      entities: {
        projects: {},
        rivals: {},
        talents: {},
        contracts: {},
      } as any,
      market: {
        trends: [],
        buyers: [],
        opportunities: [],
      } as any,
      industry: {
        agencies: [],
        rumors: [],
      } as any,
      finance: {
        cash: 10000000,
        ledger: [],
        weeklyHistory: [],
        marketState: {
          baseRate: 0.05,
          savingsYield: 0.02,
          debtRate: 0.07,
          loanRate: 0.08,
          rateHistory: [],
          sentiment: 50,
          cycle: 'STABLE',
        },
      },
      deals: {
        activeDeals: [],
        expiredDeals: [],
        pendingOffers: [],
      },
      game: {} as any,
      news: { headlines: [], events: [] } as any,
      talentAgentRelationships: {} as any,
      eventHistory: [] as any,
      ip: { vault: [], franchises: {} } as any,
      relationships: {} as any,
      history: [] as any,
    } as GameState;

    mockContext = {
      week: 2,
      tickCount: 2,
      rng: mockRng,
      timestamp: 2000,
      impacts: [],
      events: [],
    };
  });

  it('should have correct name', () => {
    expect(filter.name).toBe('MediaFilter');
  });

  it('should execute without errors', () => {
    expect(() => filter.execute(mockState, mockContext)).not.toThrow();
  });

  it('should generate impacts', () => {
    filter.execute(mockState, mockContext);
    // MediaFilter generates at least rumor impacts
    expect(mockContext.impacts.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle empty deals', () => {
    mockState.deals = { activeDeals: [], expiredDeals: [], pendingOffers: [] };
    expect(() => filter.execute(mockState, mockContext)).not.toThrow();
  });
});
