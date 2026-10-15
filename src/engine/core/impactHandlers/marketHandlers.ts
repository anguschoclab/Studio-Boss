import { GameState, Buyer } from "@/engine/types";
import type {
  BuyerUpdateImpact,
  OpportunityUpdateImpact,
  TrendsUpdateImpact,
} from "@/engine/types/state.types";

/**
 * Market-related impact handlers
 * Pure functions that apply market-related state impacts
 */

export function handleBuyerUpdated(state: GameState, impact: BuyerUpdateImpact): GameState {
  const { buyerId, update } = impact.payload;
  const existing = state.market.buyers || [];
  // Insert when the buyerId isn't present — streamer-upstart spawns
  // (IndustryUpstarts) emit a full Buyer as `update` for a new id.
  const buyers = existing.some((b) => b.id === buyerId)
    ? existing.map((b) => (b.id === buyerId ? ({ ...b, ...update } as Buyer) : b))
    : [...existing, { id: buyerId, ...update } as Buyer];
  return {
    ...state,
    market: {
      ...state.market,
      buyers,
    },
  };
}

export function handleOpportunityUpdated(
  state: GameState,
  impact: OpportunityUpdateImpact
): GameState {
  const payload = impact.payload;
  if ("action" in payload) {
    if (payload.action === "EXPIRE") {
      return {
        ...state,
        market: {
          ...state.market,
          opportunities: (state.market.opportunities || []).filter(
            (o) => o.id !== payload.opportunityId
          ),
        },
      };
    }
    return state;
  }
  const { opportunityId, rivalId, bid } = payload;
  const opportunities = (state.market.opportunities || []).map((o) => {
    if (o.id === opportunityId) {
      return {
        ...o,
        bids: {
          ...(o.bids || {}),
          [rivalId]: bid,
        },
      };
    }
    return o;
  });
  return {
    ...state,
    market: {
      ...state.market,
      opportunities,
    },
  };
}

export function handleTrendsUpdated(state: GameState, impact: TrendsUpdateImpact): GameState {
  const { trends } = impact.payload;
  return {
    ...state,
    market: {
      ...state.market,
      trends: trends,
    },
  };
}
