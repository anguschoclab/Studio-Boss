import { GameState } from "@/engine/types";
import type { DealUpdatedImpact } from "@/engine/types/state.types";

/**
 * Deal-related impact handlers
 * Pure functions that apply deal-related state impacts
 */

export function handleDealUpdated(state: GameState, impact: DealUpdatedImpact): GameState {
  const { deal, action } = impact.payload;
  const current = state.deals ?? { activeDeals: [], pendingOffers: [], expiredDeals: [] };
  let activeDeals = [...current.activeDeals];
  let expiredDeals = [...current.expiredDeals];
  if (action === "add") {
    activeDeals = [...activeDeals, deal];
  } else {
    activeDeals = activeDeals.filter((d) => d.id !== deal.id);
    const status = (action === "expire" ? "expired" : "terminated") as "expired" | "terminated";
    expiredDeals = [{ ...deal, status }, ...expiredDeals].slice(0, 50);
  }
  return { ...state, deals: { ...current, activeDeals, expiredDeals, pendingOffers: current.pendingOffers ?? [] } };
}
