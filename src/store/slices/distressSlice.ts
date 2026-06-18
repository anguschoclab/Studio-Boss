import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { completeFireSale } from '@/engine/systems/industry/DistressCascade';
import { getPlayerId } from '@/engine/utils/ownership';
import { applyImpacts } from '@/engine/core/impactReducer';

export interface DistressSlice {
  acquireDistressedAsset: (offerId: string) => void;
  declineDistressedAsset: (offerId: string) => void;
}

export const createDistressSlice: StateCreator<GameStore, [], [], DistressSlice> = (set, get) => ({
  acquireDistressedAsset: (offerId) => {
    set((s) => {
      if (!s.gameState) return s;
      const offer = s.gameState.industry?.distressedOffers?.find((o) => o.id === offerId);
      if (!offer) return s;

      const impacts = completeFireSale(s.gameState, offer, getPlayerId(s.gameState));
      const remaining = (s.gameState.industry?.distressedOffers ?? []).filter((o) => o.id !== offerId);
      const withRemoval = applyImpacts(s.gameState, [
        ...impacts,
        {
          type: 'INDUSTRY_UPDATE',
          payload: { update: { 'industry.distressedOffers': remaining } },
        } as unknown as import('@/engine/types').StateImpact,
      ]);
      return { gameState: withRemoval };
    });
  },

  declineDistressedAsset: (offerId) => {
    set((s) => {
      if (!s.gameState) return s;
      const offer = s.gameState.industry?.distressedOffers?.find((o) => o.id === offerId);
      if (!offer) return s;

      // Decline means the AI buyer takes it immediately.
      const impacts = completeFireSale(s.gameState, offer, offer.aiBuyerId);
      const remaining = (s.gameState.industry?.distressedOffers ?? []).filter((o) => o.id !== offerId);
      const withRemoval = applyImpacts(s.gameState, [
        ...impacts,
        {
          type: 'INDUSTRY_UPDATE',
          payload: { update: { 'industry.distressedOffers': remaining } },
        } as unknown as import('@/engine/types').StateImpact,
      ]);
      return { gameState: withRemoval };
    });
  },
});
