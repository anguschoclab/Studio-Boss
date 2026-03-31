import { describe, it, expect } from 'vitest';
import { GameState, RivalStudio, Opportunity } from '@/engine/types';
import { tickAuctions } from '@/engine/systems/ai/biddingEngine';
import { RandomGenerator } from '@/engine/utils/rng';

describe('AI Bidding Engine (Target C2 Refactor)', () => {
  const rng = new RandomGenerator(777);
  const mockRival: RivalStudio = {
    id: 'rival-1',
    name: 'Major Studio',
    cash: 50000000,
    archetype: 'FRANCHISE_FACTORY',
    strength: 80,
    projects: {},
    motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
    currentMotivation: 'STABILITY'
  } as any;

  const mockOpportunity: Opportunity = {
    id: 'script-1',
    title: 'Action Epic',
    genre: 'Action',
    budgetTier: 'blockbuster',
    costToAcquire: 1000000,
    expirationWeek: 10,
    bids: { 'player-1': 1100000 }
  } as any;

  const mockState = {
    week: 1,
    industry: {
      rivals: [mockRival]
    },
    market: {
      opportunities: [mockOpportunity]
    }
  } as unknown as GameState;

  it('generates a OPPORTUNITY_UPDATED impact representing a counter-bid', () => {
    const impacts = tickAuctions(mockState, rng);
    const bidImpact = impacts.find(i => i.type === 'OPPORTUNITY_UPDATED');
    
    expect(bidImpact).toBeDefined();
    expect(bidImpact?.payload.opportunityId).toBe('script-1');
    expect(bidImpact?.payload.rivalId).toBe('rival-1');
    expect(bidImpact?.payload.bid).toBeGreaterThan(1100000);
  });

  it('does not bid if the rival is already the highest bidder', () => {
    const winningState = {
      ...mockState,
      market: {
        ...mockState.market,
        opportunities: [{ ...mockOpportunity, bids: { 'rival-1': 2000000 } }]
      }
    } as any;
    
    const impacts = tickAuctions(winningState, rng);
    expect(impacts.length).toBe(0);
  });

  it('respects budget limits and aggression profiles', () => {
    const poorRival = { ...mockRival, cash: 1000000 };
    const state = { ...mockState, industry: { rivals: [poorRival] } } as any;
    
    const impacts = tickAuctions(state, rng);
    // Should not bid because 1.1M is > 40% of 1M cash
    expect(impacts.length).toBe(0);
  });
});
