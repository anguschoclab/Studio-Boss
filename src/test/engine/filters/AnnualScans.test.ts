import { describe, it, expect, beforeEach } from 'vitest';
import { AnnualScans } from '@/engine/services/filters/AnnualScans';
import { GameState } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';
import { TickContext } from '@/engine/services/filters/types';

describe('AnnualScans', () => {
  let mockState: GameState;
  let mockContext: TickContext;
  let mockRng: RandomGenerator;

  beforeEach(() => {
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

  it('should execute without errors', () => {
    expect(() => AnnualScans.execute(mockState, mockContext)).not.toThrow();
  });

  it('should preserve RNG state', () => {
    const stateBefore = mockRng.getState();
    AnnualScans.execute(mockState, mockContext);
    const stateAfter = mockRng.getState();
    expect(stateAfter).toEqual(stateBefore);
  });

  it('should handle week 1 for annual IP scan', () => {
    mockContext.week = 1;
    mockState.week = 1;
    expect(() => AnnualScans.execute(mockState, mockContext)).not.toThrow();
  });

  it('should handle week 52 for annual M&A scan', () => {
    mockContext.week = 52;
    mockState.week = 52;
    expect(() => AnnualScans.execute(mockState, mockContext)).not.toThrow();
  });

  it('should handle empty vault', () => {
    mockState.ip.vault = [];
    mockContext.week = 1;
    mockState.week = 1;
    expect(() => AnnualScans.execute(mockState, mockContext)).not.toThrow();
  });

  it('should handle empty rivals', () => {
    mockState.entities.rivals = {};
    mockContext.week = 52;
    mockState.week = 52;
    expect(() => AnnualScans.execute(mockState, mockContext)).not.toThrow();
  });
});
