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
        projects: {}, 
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
      talentPool: {},
      newsHistory: []
    },
    culture: { genrePopularity: {} },
    finance: { bankBalance: 1000000, yearToDateRevenue: 0, yearToDateExpenses: 0 },
    history: []
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates costs and revenue, returns cashChange and newHistory', () => {
    vi.mocked(calculateWeeklyCosts).mockReturnValue(50000);
    vi.mocked(calculateWeeklyRevenue).mockReturnValue(150000);

    const state = getInitialState();

    const impact = processFinance(state);

    expect(calculateWeeklyCosts).toHaveBeenCalled();
    expect(calculateWeeklyRevenue).toHaveBeenCalled();

    expect(impact.cashChange).toBe(100000); // -50,000 + 150,000
    expect(impact.newFinanceHistory).toHaveLength(1);
    expect(impact.newFinanceHistory![0]).toEqual({
      week: 2,
      cash: 1100000,
      revenue: 150000,
      costs: 50000
    });
  });

  it('handles negative cash scenarios correctly', () => {
    vi.mocked(calculateWeeklyCosts).mockReturnValue(5000000);
    vi.mocked(calculateWeeklyRevenue).mockReturnValue(0);

    const state = getInitialState();
    state.cash = -2000000;

    const impact = processFinance(state);

    expect(impact.cashChange).toBe(-5000000);
    expect(impact.newFinanceHistory![0].cash).toBe(-7000000);
  });

  it('handles negative budget extreme edge case (grants/rebates)', () => {
      vi.mocked(calculateWeeklyCosts).mockReturnValue(-100000);
      vi.mocked(calculateWeeklyRevenue).mockReturnValue(0);

      const state = getInitialState();

      const impact = processFinance(state);

      expect(impact.cashChange).toBe(100000);
  });
});
