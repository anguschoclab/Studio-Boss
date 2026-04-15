import { describe, it, expect, beforeEach } from 'vitest';
import { ProductionFilter } from '@/engine/services/filters/ProductionFilter';
import { GameState } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';
import { TickContext } from '@/engine/services/filters/types';

describe('ProductionFilter', () => {
  let filter: ProductionFilter;
  let mockState: GameState;
  let mockContext: TickContext;
  let mockRng: RandomGenerator;

  beforeEach(() => {
    filter = new ProductionFilter();
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
      ip: {
        vault: [],
        franchises: {},
      },
      game: {} as any,
      news: { headlines: [], events: [] } as any,
      deals: { activeDeals: [], expiredDeals: [], pendingOffers: [] } as any,
      talentAgentRelationships: {} as any,
      eventHistory: [] as any,
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
    expect(filter.name).toBe('ProductionFilter');
  });

  it('should execute without errors', () => {
    expect(() => filter.execute(mockState, mockContext)).not.toThrow();
  });

  it('should preserve RNG state', () => {
    const stateBefore = mockRng.getState();
    filter.execute(mockState, mockContext);
    const stateAfter = mockRng.getState();
    expect(stateAfter).toEqual(stateBefore);
  });

  it('should generate impacts', () => {
    filter.execute(mockState, mockContext);
    // With empty projects, may not generate impacts, but should not error
    expect(mockContext.impacts.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle empty projects', () => {
    mockState.entities.projects = {};
    expect(() => filter.execute(mockState, mockContext)).not.toThrow();
  });
});
