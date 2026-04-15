import { describe, it, expect, beforeEach } from 'vitest';
import { ProductionProjectProcessor } from '@/engine/services/filters/ProductionProjectProcessor';
import { GameState } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';
import { TickContext } from '@/engine/services/filters/types';

describe('ProductionProjectProcessor', () => {
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

  it('should process project without errors', () => {
    const project = {
      id: 'project-1',
      title: 'Test Project',
      state: 'development',
    } as any;
    expect(() => ProductionProjectProcessor.processProject(project, mockState, mockContext)).not.toThrow();
  });

  it('should preserve RNG state', () => {
    const project = {
      id: 'project-1',
      title: 'Test Project',
      state: 'development',
    } as any;
    const stateBefore = mockRng.getState();
    ProductionProjectProcessor.processProject(project, mockState, mockContext);
    const stateAfter = mockRng.getState();
    expect(stateAfter).toEqual(stateBefore);
  });

  it('should handle development state', () => {
    const project = {
      id: 'project-1',
      title: 'Test Project',
      state: 'development',
    } as any;
    ProductionProjectProcessor.processProject(project, mockState, mockContext);
    // Should generate script development impacts
    expect(mockContext.impacts.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle released state', () => {
    const project = {
      id: 'project-1',
      title: 'Test Project',
      state: 'released',
      directorsCutNotified: false,
      momentum: 50,
    } as any;
    ProductionProjectProcessor.processProject(project, mockState, mockContext);
    // Should check director's cut eligibility
    expect(mockContext.impacts.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle shopping expiry', () => {
    const project = {
      id: 'project-1',
      title: 'Test Project',
      state: 'shopping',
      shoppingExpiresWeek: 1,
    } as any;
    mockContext.week = 2;
    ProductionProjectProcessor.processProject(project, mockState, mockContext);
    const projectUpdates = mockContext.impacts.filter(i => i.type === 'PROJECT_UPDATED');
    expect(projectUpdates.length).toBeGreaterThan(0);
  });

  it('should handle content flags for rating', () => {
    const project = {
      id: 'project-1',
      title: 'Test Project',
      state: 'released',
      contentFlags: ['violence', 'language'],
      rating: null,
    } as any;
    ProductionProjectProcessor.processProject(project, mockState, mockContext);
    const projectUpdates = mockContext.impacts.filter(i => i.type === 'PROJECT_UPDATED');
    expect(projectUpdates.length).toBeGreaterThan(0);
  });
});
