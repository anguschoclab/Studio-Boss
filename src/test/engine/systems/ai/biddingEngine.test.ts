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
    cash: 500_000_000,
    archetype: 'major',
    currentMotivation: 'FRANCHISE_BUILDING'
  });

  const mockOpportunity: Opportunity = createMockOpportunity({
    id: 'script-1',
    title: 'Action Epic',
    genre: 'Action',
    costToAcquire: 1_000_000,
    bids: { 'PLAYER': { amount: 1_100_000, terms: 'standard' } },
    highestBidderId: 'PLAYER'
  });

  const mockState = createMockGameState({
    entities: {
      projects: {},
      talents: {},
      contracts: {},
      rivals: { 'rival-1': mockRival }
    },
    market: { 
      opportunities: [mockOpportunity],
      buyers: []
    }
  });

  it('generates a OPPORTUNITY_UPDATED impact representing a counter-bid', () => {
    const impacts = tickAuctions(mockState as any, rng);
    const bidImpact = impacts.find(i => i.type === 'OPPORTUNITY_UPDATED');
    
    expect(bidImpact).toBeDefined();
    const payload = (bidImpact as any).payload;
    expect(payload.opportunityId).toBe('script-1');
    expect(payload.rivalId).toBe('rival-1');
    expect(payload.bid.amount).toBeGreaterThan(1_100_000);
  });

  it('does not bid if the rival is already the highest bidder', () => {
    const winningOpportunity = { 
      ...mockOpportunity, 
      highestBidderId: 'rival-1',
      bids: { 'rival-1': { amount: 2_000_000, terms: 'standard' } } 
    };
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
        entities: { ...mockState.entities, rivals: { 'rival-1': poorRival } } 
    } as unknown as GameState;
    
    const impacts = tickAuctions(poorState, rng);
    // Should not bid because currentHighest (1.1M) * liquidityBuffer is already more than available cash
    expect(impacts.length).toBe(0);
  });
});
