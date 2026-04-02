import { describe, it, expect } from 'vitest';
import { GameState, StreamerPlatform, Talent, BuyerUpdateImpact } from '../../../../engine/types';
import { tickPlatforms } from '../../../../engine/systems/television/platformEngine';
import { RandomGenerator } from '../../../../engine/utils/rng';

describe('Platform Engine (Target B1)', () => {
  const rng = new RandomGenerator(42);
  
  const getInitialState = (buyers: StreamerPlatform[]): GameState => {
    return {
      week: 1,
      gameSeed: 1,
      tickCount: 0,
      game: { currentWeek: 1 },
      finance: { cash: 1000000, ledger: [], weeklyHistory: [], marketState: { baseRate: 0.04, savingsYield: 0.02, debtRate: 0.08, loanRate: 0.06, rateHistory: [] } },
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
      market: { opportunities: [], buyers, activeMarketEvents: [] },
      industry: {
        rivals: [],
        families: [],
        agencies: [],
        agents: [],
        talentPool: {} as Record<string, Talent>,
        newsHistory: [],
        rumors: []
      },
      culture: { genrePopularity: {} },
      history: [],
      eventHistory: []
    } as unknown as GameState;
  };

  it('should calculate subscriber growth and churn correctly', () => {
    const streamer: StreamerPlatform = {
      id: 's1',
      name: 'Netflex',
      archetype: 'streamer',
      subscribers: 10_000_000,
      churnRate: 0.05,
      contentLibraryQuality: 70,
      marketingSpend: 500_000,
      prestige: 50,
      isMajor: true,
      currentMandate: { type: 'prestige', activeUntilWeek: 10 },
      isGlobal: true,
      territories: ['USA', 'UK'],
      ratingHistory: []
    } as unknown as import('../../engine/types').TVPlatform;

    const state = getInitialState([streamer]);
    const impacts = tickPlatforms(state, rng);
    
    const buyerImpact = impacts.find((i): i is BuyerUpdateImpact => i.type === 'BUYER_UPDATED' && i.payload.buyerId === 's1');
    expect(buyerImpact).toBeDefined();
    expect(buyerImpact?.type).toBe('BUYER_UPDATED');
    
    const nextSubs = (buyerImpact?.payload.update as Partial<StreamerPlatform> | undefined)?.subscribers;
    expect(nextSubs).toBeDefined();
    expect(nextSubs).not.toBe(10_000_000); 
  });
});
