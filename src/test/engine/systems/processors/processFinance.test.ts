import { describe, it, expect } from 'vitest';
import { tickFinance } from '../../../../engine/systems/finance/financeTick';
import { GameState, Talent } from '../../../../engine/types';
import { RandomGenerator } from '../../../../engine/utils/rng';

describe('tickFinance', () => {
  const rng = new RandomGenerator(123);
  
  const getInitialState = (): GameState => ({
    week: 5,
    gameSeed: 1,
    tickCount: 0,
    projects: { active: [] },
    game: { currentWeek: 5 },
    finance: {
      cash: 50_000_000,
      ledger: []
    },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
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
      buyers: [],
      activeMarketEvents: []
    },
    industry: {
      rivals: [],
      families: [],
      agencies: [],
      agents: [],
      talentPool: {} as Record<string, Talent>,
      newsHistory: [],
      rumors: []
    },
    culture: {
      genrePopularity: {}
    },
    history: [],
    eventHistory: []
  } as unknown as GameState);

  it('should generate financial impacts (FUNDS_CHANGED and LEDGER_UPDATED)', () => {
    const mockState = getInitialState();

    const impacts = tickFinance(mockState, rng);

    const fundsImpact = impacts.find(i => i.type === 'FUNDS_CHANGED');
    const ledgerImpact = impacts.find(i => i.type === 'LEDGER_UPDATED');

    expect(fundsImpact).toBeDefined();
    expect(ledgerImpact).toBeDefined();
    
    // Net profit should be negative (500k base * 1.5625 for major studio = -781250)
    expect(fundsImpact?.payload.amount).toBe(-1147837);
    expect(ledgerImpact?.payload.report.week).toBe(5);
    expect(ledgerImpact?.payload.report.netProfit).toBe(-1147837);
  });
});
