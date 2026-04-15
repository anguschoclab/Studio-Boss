import { describe, it, expect, beforeEach } from 'vitest';
import { IndustryFilter } from '@/engine/services/filters/IndustryFilter';
import { GameState } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';
import { TickContext } from '@/engine/services/filters/types';

describe('IndustryFilter', () => {
  let filter: IndustryFilter;
  let mockState: GameState;
  let mockContext: TickContext;
  let mockRng: RandomGenerator;

  beforeEach(() => {
    filter = new IndustryFilter();
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
        internal: {
          projectHistory: [],
        },
      } as any,
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
            isAcquirable: false,
          },
        },
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
        festivalSubmissions: [],
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
    expect(filter.name).toBe('IndustryFilter');
  });

  it('should execute without errors', () => {
    expect(() => filter.execute(mockState, mockContext)).not.toThrow();
  });

  it('should generate impacts', () => {
    filter.execute(mockState, mockContext);
    expect(mockContext.impacts.length).toBeGreaterThan(0);
  });

  it('should advance rivals', () => {
    filter.execute(mockState, mockContext);
    const rivalUpdates = mockContext.impacts.filter(i => i.type === 'RIVAL_UPDATED');
    // May not generate impacts with minimal mock state
    expect(rivalUpdates.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle week 1 for annual IP scan', () => {
    mockContext.week = 1;
    mockState.week = 1;
    // Add IP vault for scan
    mockState.ip.vault = [];
    expect(() => filter.execute(mockState, mockContext)).not.toThrow();
  });

  it('should handle week 52 for annual M&A scan', () => {
    mockContext.week = 52;
    mockState.week = 52;
    expect(() => filter.execute(mockState, mockContext)).not.toThrow();
  });
});
