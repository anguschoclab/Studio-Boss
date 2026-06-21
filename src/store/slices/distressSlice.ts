import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { completeFireSale } from '@/engine/systems/industry/DistressCascade';
import { getPlayerId } from '@/engine/utils/ownership';
import { applyImpacts } from '@/engine/core/impactReducer';
import { useUIStore } from '@/store/uiStore';

export interface DistressSlice {
  acquireDistressedAsset: (offerId: string) => void;
  declineDistressedAsset: (offerId: string) => void;
}

export const createDistressSlice: StateCreator<GameStore, [], [], DistressSlice> = (set, get) => ({
  acquireDistressedAsset: (offerId) => {
    const state = get().gameState;
    if (!state) return;
    const offer = state.industry?.distressedOffers?.find((o) => o.id === offerId);
    if (!offer) {
      useUIStore.getState().resolveCurrentModal();
      return;
    }
    if ((state.finance?.cash ?? 0) < offer.price) {
      useUIStore.getState().resolveCurrentModal();
      return;
    }

    const impacts = completeFireSale(state, offer, getPlayerId(state));
    const remaining = (state.industry?.distressedOffers ?? []).filter((o) => o.id !== offerId);
    const withRemoval = applyImpacts(state, [
      ...impacts,
      {
        type: 'INDUSTRY_UPDATE',
        payload: { update: { 'industry.distressedOffers': remaining } },
      } as unknown as import('@/engine/types').StateImpact,
    ]);
    set({ gameState: withRemoval });
    useUIStore.getState().resolveCurrentModal();
  },

  declineDistressedAsset: (offerId) => {
    const state = get().gameState;
    if (!state) return;
    const offer = state.industry?.distressedOffers?.find((o) => o.id === offerId);
    if (!offer) {
      useUIStore.getState().resolveCurrentModal();
      return;
    }

    const impacts = completeFireSale(state, offer, offer.aiBuyerId);
    const remaining = (state.industry?.distressedOffers ?? []).filter((o) => o.id !== offerId);
    const withRemoval = applyImpacts(state, [
      ...impacts,
      {
        type: 'INDUSTRY_UPDATE',
        payload: { update: { 'industry.distressedOffers': remaining } },
      } as unknown as import('@/engine/types').StateImpact,
    ]);
    set({ gameState: withRemoval });
    useUIStore.getState().resolveCurrentModal();
  },
});
