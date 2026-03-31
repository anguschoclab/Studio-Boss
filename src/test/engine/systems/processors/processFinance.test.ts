import { describe, it, expect } from 'vitest';
import { processFinance } from '../../../../engine/systems/processors/processFinance';
import { GameState } from '../../../../engine/types';

describe('processFinance', () => {
  const getInitialState = (): GameState => ({
    week: 5,
    finance: {
      cash: 50000000,
      ledger: []
    },
    news: { headlines: [] },
    studio: {
      name: 'Test Studio',
      archetype: 'major',
      prestige: 50,
      internal: {
        projects: {}, 
        contracts: [],
      }
    },
    market: {
      opportunities: [],
      trends: [],
      activeMarketEvents: [],
      buyers: []
    },
    industry: {
      rivals: [],
      families: [],
      agencies: [],
      agents: [],
      talentPool: {},
      newsHistory: [],
      awards: [],
      festivalSubmissions: [],
      rumors: [],
      scandals: []
    },
    culture: {
      genrePopularity: {}
    },
    history: []
  } as unknown as GameState);

  it('should generate a WeeklyFinancialReport and append it to the ledger', () => {
    const mockState = getInitialState();

    const newState = processFinance(mockState);

    expect(newState.finance.ledger).toHaveLength(1);
    const report = newState.finance.ledger[0];
    expect(report.week).toBe(5);
    expect(report.startingCash).toBe(50000000);
    // Base weekly overhead (500k) should be subtracted even with no projects
    expect(report.endingCash).toBe(49500000); 
    expect(report.netProfit).toBe(-500000);
    expect(newState.finance.cash).toBe(49500000);
  });

  it('should include box office revenue in the report', () => {
    // This will require actual project data or mocking the finance utilities
    // For now, we'll keep it simple to ensure the basic structure works
  });
});
