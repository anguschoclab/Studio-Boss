
import { describe, it, expect, beforeEach } from 'vitest';
import { AIFilter } from '@/engine/services/filters/AIFilter';
import { GameState } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';
import { TickContext } from '@/engine/services/filters/types';

describe('AIFilter', () => {
  let filter: AIFilter;
  let mockState: GameState;
  let mockContext: TickContext;
  let mockRng: RandomGenerator;

  beforeEach(() => {
    filter = new AIFilter();
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
      } as unknown as unknown as any,
      entities: {
        projects: {},
        rivals: {
          'rival-1': {
            id: 'rival-1',
            name: 'Test Rival',
            archetype: 'major',
            cash: 50000000,
            prestige: 60,
            strength: 70,
            currentMotivation: 'STABILITY',
            motivationProfile: {
              financial: 50,
              prestige: 50,
              legacy: 50,
              aggression: 50,
            },
          },
        },
        talents: {},
        contracts: {},
      } as unknown as unknown as any,
      market: {
        trends: [],
        buyers: [],
        opportunities: [],
      } as unknown as unknown as any,
      industry: {
        agencies: [],
      } as unknown as unknown as any,
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
      game: {} as unknown as unknown as any,
      news: { headlines: [], events: [] } as unknown as unknown as any,
      deals: { activeDeals: [], expiredDeals: [], pendingOffers: [] } as unknown as unknown as any,
      talentAgentRelationships: {} as unknown as unknown as any,
      eventHistory: [] as unknown as unknown as any,
      ip: { vault: [], franchises: {} } as unknown as unknown as any,
      relationships: {} as unknown as unknown as any,
      history: [] as unknown as unknown as any,
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
    expect(filter.name).toBe('AIFilter');
  });

  it('should execute without errors', () => {
    expect(() => filter.execute(mockState, mockContext)).not.toThrow();
  });

  it('should generate impacts', () => {
    filter.execute(mockState, mockContext);
    expect(mockContext.impacts.length).toBeGreaterThan(0);
  });

  it('should update rival motivations', () => {
    filter.execute(mockState, mockContext);
    const rivalUpdates = mockContext.impacts.filter(i => i.type === 'RIVAL_UPDATED');
    expect(rivalUpdates.length).toBeGreaterThan(0);
  });
});
