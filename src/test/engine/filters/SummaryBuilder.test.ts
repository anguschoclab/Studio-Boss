import { describe, it, expect, beforeEach } from 'vitest';
import { SummaryBuilder } from '@/engine/services/filters/SummaryBuilder';
import { GameState } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';
import { TickContext } from '@/engine/services/filters/types';

describe('SummaryBuilder', () => {
  let mockBeforeState: GameState;
  let mockAfterState: GameState;
  let mockContext: TickContext;
  let mockRng: RandomGenerator;

  beforeEach(() => {
    mockRng = new RandomGenerator(42);
    
    mockBeforeState = {
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
      game: {} as any,
      news: { headlines: [], events: [] } as any,
      deals: { activeDeals: [], expiredDeals: [], pendingOffers: [] } as any,
      talentAgentRelationships: {} as any,
      eventHistory: [] as any,
      ip: { vault: [], franchises: {} } as any,
      relationships: {} as any,
      history: [] as any,
    } as GameState;

    mockAfterState = {
      ...mockBeforeState,
      week: 2,
      tickCount: 2,
      finance: {
        ...mockBeforeState.finance,
        cash: 10500000,
      },
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

  it('should build summary with basic state', () => {
    const summary = SummaryBuilder.build(mockBeforeState, mockAfterState, mockContext);
    
    expect(summary.id).toBeDefined();
    expect(summary.fromWeek).toBe(1);
    expect(summary.toWeek).toBe(2);
    expect(summary.cashBefore).toBe(10000000);
    expect(summary.cashAfter).toBe(10500000);
  });

  it('should handle project updates', () => {
    mockContext.impacts.push({
      type: 'PROJECT_UPDATED',
      payload: { projectId: 'project-1', update: { progress: 50 } },
    });
    
    const summary = SummaryBuilder.build(mockBeforeState, mockAfterState, mockContext);
    expect(summary.projectUpdates).toContain('project-1');
  });

  it('should handle news impacts', () => {
    mockContext.impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        headline: 'Breaking News',
        category: 'general' as any,
        publication: 'Variety',
      },
    });
    
    const summary = SummaryBuilder.build(mockBeforeState, mockAfterState, mockContext);
    expect(summary.newHeadlines.length).toBeGreaterThan(0);
    expect(summary.newHeadlines[0].text).toBe('Breaking News');
  });

  it('should handle ledger impacts', () => {
    mockContext.impacts.push({
      type: 'LEDGER_UPDATED',
      payload: {
        report: {
          revenue: { boxOffice: 1000000, distribution: 500000, other: 200000 },
          expenses: { production: 800000, marketing: 300000, overhead: 100000, pacts: 50000 },
        },
      },
    });
    
    const summary = SummaryBuilder.build(mockBeforeState, mockAfterState, mockContext);
    expect(summary.totalRevenue).toBe(1700000);
    expect(summary.totalCosts).toBe(1250000);
  });

  it('should handle events', () => {
    mockContext.events.push({ title: 'Event 1' } as any);
    mockContext.events.push({ title: 'Event 2' } as any);
    
    const summary = SummaryBuilder.build(mockBeforeState, mockAfterState, mockContext);
    expect(summary.events).toContain('Event 1');
    expect(summary.events).toContain('Event 2');
  });

  it('should handle empty impacts', () => {
    const summary = SummaryBuilder.build(mockBeforeState, mockAfterState, mockContext);
    expect(summary.projectUpdates).toEqual([]);
    expect(summary.newHeadlines).toEqual([]);
    expect(summary.totalRevenue).toBe(0);
    expect(summary.totalCosts).toBe(0);
  });
});
