import { GameState, StateImpact } from '@/engine/types';

/**
 * Deal-related impact handlers
 * Pure functions that apply deal-related state impacts
 */

export function handleDealUpdated(state: GameState, impact: StateImpact): GameState {
  const { deal, action } = impact.payload as {
    deal: import('@/engine/types/talent.types').TalentPact;
    action: 'add' | 'expire' | 'terminate';
  };
  const current = state.deals;
  let activeDeals = [...current.activeDeals];
  let expiredDeals = [...current.expiredDeals];
  if (action === 'add') {
    activeDeals = [...activeDeals, deal];
  } else {
    activeDeals = activeDeals.filter(d => d.id !== deal.id);
    const status = (action === 'expire' ? 'expired' : 'terminated') as 'expired' | 'terminated';
    expiredDeals = [{ ...deal, status }, ...expiredDeals].slice(0, 50);
  }
  return { ...state, deals: { ...current, activeDeals, expiredDeals } };
}
