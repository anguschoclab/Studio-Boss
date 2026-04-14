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
    game: { currentWeek: 5 },
    entities: {
      projects: {},
      talents: {},
      contracts: {},
      rivals: {}
    },
    finance: {
      cash: 50_000_000,
      ledger: [],
      weeklyHistory: [],
      marketState: { baseRate: 0.05, savingsYield: 0.02, debtRate: 0.1, loanRate: 0.08, rateHistory: [], sentiment: 50, cycle: 'STABLE' }
    },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    studio: {
      name: 'Test Studio',
      archetype: 'major',
      prestige: 50,
      ownedPlatforms: [],
      internal: {
        projectHistory: [],
      }
    },
    market: {
      opportunities: [],
      buyers: []
    },
    industry: {
      rivals: [],
      families: [],
      agencies: [],
      agents: [],
      talentPool: {} as Record<string, Talent>,
      newsHistory: [],
    },
    culture: {
      genrePopularity: {}
    },
    deals: { activeDeals: [], pendingOffers: [], expiredDeals: [] },
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
    
    // Net profit should be negative (overhead + interest cost for major studio with no projects)
    // Overhead = 2000000 * 1.85^2 = 6845000
    // Yield = 50M * (0.02 / 52) = 19231
    // Net = 19231 - 6845000 = -6825769
    expect(fundsImpact?.payload.amount).toBe(-6825769);
    expect(ledgerImpact?.payload.report.week).toBe(5);
    expect(ledgerImpact?.payload.report.netProfit).toBe(-6825769);
  });
});
