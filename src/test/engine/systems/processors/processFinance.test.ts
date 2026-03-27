import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processFinance } from '../../../../engine/systems/processors/processFinance';
import { GameState } from '../../../../engine/types';

// Mock the finance dependencies
vi.mock('../../../../engine/systems/finance', () => ({
  calculateWeeklyCosts: vi.fn(),
  calculateWeeklyRevenue: vi.fn()
}));

import { calculateWeeklyCosts, calculateWeeklyRevenue } from '../../../../engine/systems/finance';

describe('processFinance', () => {
  const getInitialState = (): GameState => ({
    week: 1,
    cash: 1000000,
    studio: {
      name: 'Test Studio',
      archetype: 'major',
      prestige: 50,
      internal: {
        projects: [],
        contracts: [],
        financeHistory: []
      }
    },
    market: {
      opportunities: [],
      buyers: []
    },
    industry: {
      rivals: [],
      headlines: [],
      families: [],
      agencies: [],
      agents: [],
      talentPool: [],
      newsHistory: []
    },
    culture: { genrePopularity: {} },
    finance: { bankBalance: 1000000, yearToDateRevenue: 0, yearToDateExpenses: 0 },
    history: []
  });

  const getInitialWeeklyChanges = () => ({
    projectUpdates: [],
    events: [],
    newHeadlines: [],
    costs: 0,
    revenue: 0,
    newsEvents: []
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates costs and revenue, updates cash and history', () => {
    vi.mocked(calculateWeeklyCosts).mockReturnValue(50000);
    vi.mocked(calculateWeeklyRevenue).mockReturnValue(150000);

    const state = getInitialState();
    const changes = getInitialWeeklyChanges();

    const result = processFinance(state, changes);

    expect(calculateWeeklyCosts).toHaveBeenCalledWith([], []);
    expect(calculateWeeklyRevenue).toHaveBeenCalledWith([], [], []);

    expect(result.cash).toBe(1100000); // 1,000,000 - 50,000 + 150,000
    expect(result.studio.internal.financeHistory).toHaveLength(1);
    expect(result.studio.internal.financeHistory[0]).toEqual({
      week: 2,
      cash: 1100000,
      revenue: 150000,
      costs: 50000
    });

    expect(changes.costs).toBe(50000);
    expect(changes.revenue).toBe(150000);
  });

  it('slices finance history if it exceeds 52 weeks', () => {
    vi.mocked(calculateWeeklyCosts).mockReturnValue(0);
    vi.mocked(calculateWeeklyRevenue).mockReturnValue(0);

    const state = getInitialState();
    // Fill history with 52 items
    state.studio.internal.financeHistory = new Array(52).fill({ week: 0, cash: 0, revenue: 0, costs: 0 }).map((_, i) => ({
      week: i + 1, cash: 1000000, revenue: 0, costs: 0
    }));

    const changes = getInitialWeeklyChanges();
    const result = processFinance(state, changes);

    expect(result.studio.internal.financeHistory).toHaveLength(52); // Should remain 52
    expect(result.studio.internal.financeHistory[51].week).toBe(2); // The new entry
    expect(result.studio.internal.financeHistory[0].week).toBe(2); // First item shifted
  });

  it('handles extremely negative cash scenarios gracefully', () => {
    vi.mocked(calculateWeeklyCosts).mockReturnValue(5000000);
    vi.mocked(calculateWeeklyRevenue).mockReturnValue(0);

    const state = getInitialState();
    state.cash = -2000000; // already in debt
    const changes = getInitialWeeklyChanges();

    const result = processFinance(state, changes);

    expect(result.cash).toBe(-7000000);
    expect(result.studio.internal.financeHistory[0].cash).toBe(-7000000);
  });

  it('handles negative budget extreme edge case', () => {
      // While budget constraints should be elsewhere, test pure logic passes
      vi.mocked(calculateWeeklyCosts).mockReturnValue(-100000); // E.g. a grant/rebate
      vi.mocked(calculateWeeklyRevenue).mockReturnValue(0);

      const state = getInitialState();
      const changes = getInitialWeeklyChanges();

      const result = processFinance(state, changes);

      expect(result.cash).toBe(1100000);
  });
});
