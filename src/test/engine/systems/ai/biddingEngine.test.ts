import { describe, it, expect } from 'vitest';
import { GameState, RivalStudio, Opportunity, Talent, OpportunityUpdateImpact, StateImpact } from '@/engine/types';
import { tickAuctions } from '@/engine/systems/ai/biddingEngine';
import { RandomGenerator } from '@/engine/utils/rng';
import { createMockGameState, createMockRival, createMockOpportunity } from '../../../utils/mockFactories';

describe('AI Bidding Engine (Target C2 Refactor)', () => {
  const rng = new RandomGenerator(777);
  
  const mockRival: RivalStudio = createMockRival({
    id: 'rival-1',
    name: 'Major Studio',
  });

  const mockOpportunity: Opportunity = createMockOpportunity({
    id: 'script-1',
    title: 'Action Epic',
    bids: { 'player-1': { amount: 1_100_000, terms: 'standard' } },
  });

  const mockState = createMockGameState({
    industry: {
      rivals: [mockRival],
      families: [],
      agencies: [],
      agents: [],
      talentPool: {},
      newsHistory: []
    },
    market: { 
      opportunities: [mockOpportunity],
      buyers: []
    }
  });

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
