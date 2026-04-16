import { GameState, StateImpact, Buyer } from '@/engine/types';

/**
 * Market-related impact handlers
 * Pure functions that apply market-related state impacts
 */

export function handleBuyerUpdated(state: GameState, impact: StateImpact): GameState {
  const { buyerId, update } = impact.payload;
  const buyers = state.market.buyers.map(b => 
    b.id === buyerId ? { ...b, ...update } as Buyer : b
  );
  return {
    ...state,
    market: {
      ...state.market,
      buyers
    }
  };
}

export function handleOpportunityUpdated(state: GameState, impact: StateImpact): GameState {
  const { opportunityId, rivalId, bid } = impact.payload;
  const opportunities = state.market.opportunities.map(o => {
    if (o.id === opportunityId) {
      return {
        ...o,
        bids: {
          ...(o.bids || {}),
          [rivalId]: bid
        }
      };
    }
    return o;
  });
  return {
    ...state,
    market: {
      ...state.market,
      opportunities
    }
  };
}

export function handleTrendsUpdated(state: GameState, impact: StateImpact): GameState {
  const { trends } = impact.payload;
  return {
    ...state,
    market: {
      ...state.market,
      trends: trends
    }
  };
}
