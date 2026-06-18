import { describe, it, expect } from 'vitest';
import { selectDistressedOffers, selectDistressedOffer } from '@/store/selectors';
import type { GameState } from '@/engine/types';
import type { DistressedAssetOffer } from '@/engine/types/distress.types';

const offer: DistressedAssetOffer = {
  id: 'o1', sellerId: 'r1', sellerName: 'Carolco', assetKind: 'franchise',
  assetId: 'f1', assetLabel: "franchise 'Rambo'", price: 100, aiBuyerId: 'r2',
  aiBuyerName: 'Helix', createdWeek: 5, expiresWeek: 7,
};

function makeState(offers: DistressedAssetOffer[] = []): GameState {
  return { industry: { distressedOffers: offers } } as unknown as GameState;
}

describe('distress-offer selectors', () => {
  it('selectDistressedOffers returns the list (empty array when undefined)', () => {
    expect(selectDistressedOffers(makeState())).toEqual([]);
    expect(selectDistressedOffers(makeState([offer]))).toHaveLength(1);
  });
  it('selectDistressedOffer finds by id', () => {
    expect(selectDistressedOffer(makeState([offer]), 'o1')?.sellerName).toBe('Carolco');
    expect(selectDistressedOffer(makeState([offer]), 'nope')).toBeUndefined();
  });
});
