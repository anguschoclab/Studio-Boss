import { describe, it, expect } from 'vitest';
import { GameState, StreamerPlatform, Talent } from '../../../../engine/types';
import { tickPlatforms } from '../../../../engine/systems/television/platformEngine';
import { RandomGenerator } from '../../../../engine/utils/rng';

describe('Platform Engine (Target B1)', () => {
  const rng = new RandomGenerator(42);
  
  const getInitialState = (buyers: StreamerPlatform[]): GameState => ({
    week: 1,
    gameSeed: 1,
    tickCount: 0,
    projects: { active: [] },
    game: { currentWeek: 1 },
    finance: { cash: 1000000, ledger: [] },
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
      territories: ['USA', 'UK']
    } as StreamerPlatform;

    const state = getInitialState([streamer]);
    const impacts = tickPlatforms(state, rng);
    
    const buyerImpact = impacts.find(i => i.payload.buyerId === 's1');
    expect(buyerImpact).toBeDefined();
    expect(buyerImpact?.type).toBe('BUYER_UPDATED');
    
    const nextSubs = buyerImpact?.payload.update.subscribers;
    expect(nextSubs).toBeDefined();
    expect(nextSubs).not.toBe(10_000_000); 
  });
});
