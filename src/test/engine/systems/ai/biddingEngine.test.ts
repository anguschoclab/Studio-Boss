import { describe, it, expect } from 'vitest';
import { GameState, RivalStudio, Opportunity, Talent, OpportunityUpdateImpact } from '@/engine/types';
import { tickAuctions } from '@/engine/systems/ai/biddingEngine';
import { RandomGenerator } from '@/engine/utils/rng';

describe('AI Bidding Engine (Target C2 Refactor)', () => {
  const rng = new RandomGenerator(777);
  
  const mockRival: RivalStudio = {
    id: 'rival-1',
    name: 'Major Studio',
    motto: 'Standard.',
    archetype: 'major',
    strength: 80,
    cash: 50_000_000,
    prestige: 50,
    foundedWeek: 0,
    recentActivity: 'Testing',
    projectCount: 5,
    strategy: 'acquirer',
    projects: {},
    contracts: [],
    motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
    currentMotivation: 'STABILITY'
  };

  const mockOpportunity: Opportunity = {
    id: 'script-1',
    title: 'Action Epic',
    type: 'script',
    format: 'film',
    genre: 'Action',
    budgetTier: 'blockbuster',
    targetAudience: 'General',
    flavor: 'Cool',
    origin: 'open_spec',
    costToAcquire: 1_000_000,
    weeksUntilExpiry: 10,
    expirationWeek: 10,
    bids: { 'player-1': { amount: 1_100_000, terms: 'standard' } },
    bidHistory: []
  } as Opportunity;

  const mockState = {
    week: 1,
    gameSeed: 1,
    tickCount: 0,
    projects: { active: [] },
    game: { currentWeek: 1 },
    finance: { cash: 1_000_000, ledger: [] },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    studio: {
      name: 'Player Studio',
      archetype: 'major',
      prestige: 50,
      internal: { projects: {}, contracts: [] }
    },
    market: { 
      opportunities: [mockOpportunity],
      buyers: []
    },
    industry: {
      rivals: [mockRival],
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

  it('generates a OPPORTUNITY_UPDATED impact representing a counter-bid', () => {
    const impacts = tickAuctions(mockState as any, rng);
    const bidImpact = impacts.find(i => i.type === 'OPPORTUNITY_UPDATED') as OpportunityUpdateImpact | undefined;
    
    expect(bidImpact).toBeDefined();
    expect(bidImpact?.payload.opportunityId).toBe('script-1');
    expect(bidImpact?.payload.rivalId).toBe('rival-1');
    expect(bidImpact?.payload.bid.amount).toBeGreaterThan(1_100_000);
  });

  it('does not bid if the rival is already the highest bidder', () => {
    const winningOpportunity = { ...mockOpportunity, bids: { 'rival-1': { amount: 2_000_000, terms: 'standard' } } };
    const winningState = {
      ...mockState,
      market: {
        ...mockState.market,
        opportunities: [winningOpportunity]
      }
    } as unknown as GameState;
    
    const impacts = tickAuctions(winningState, rng);
    expect(impacts.length).toBe(0);
  });

  it('respects budget limits and aggression profiles', () => {
    const poorRival = { ...mockRival, cash: 1_000_000 };
    const poorState = { 
        ...mockState, 
        industry: { ...mockState.industry, rivals: [poorRival] } 
    } as unknown as GameState;
    
    const impacts = tickAuctions(poorState, rng);
    // Should not bid because currentHighest (1.1M) * 1.5 is already more than available cash
    expect(impacts.length).toBe(0);
  });
});
