import { describe, it, expect, beforeEach } from 'vitest';
import { TalentFilter } from '@/engine/services/filters/TalentFilter';
import { GameState } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';
import { TickContext } from '@/engine/services/filters/types';

describe('TalentFilter', () => {
  let filter: TalentFilter;
  let mockState: GameState;
  let mockContext: TickContext;
  let mockRng: RandomGenerator;

  beforeEach(() => {
    filter = new TalentFilter();
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
        talents: {
          'talent-1': {
            id: 'talent-1',
            name: 'Test Talent',
            prestige: 70,
            demographics: {
              age: 35,
              gender: 'female',
              ethnicity: 'white',
            },
            psychology: {
              mood: 50,
              ambition: 50,
            },
          },
        },
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
      game: {} as any,
      news: { headlines: [], events: [] } as any,
      deals: { activeDeals: [], expiredDeals: [], pendingOffers: [], failedDeals: [] } as any,
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
    expect(filter.name).toBe('TalentFilter');
  });

  it('should generate impacts', () => {
    filter.execute(mockState, mockContext);
    expect(mockContext.impacts.length).toBeGreaterThan(0);
  });

  it('should handle empty talent pool', () => {
    mockState.entities.talents = {};
    expect(() => filter.execute(mockState, mockContext)).not.toThrow();
  });
});
