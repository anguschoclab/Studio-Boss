import { describe, it, expect } from 'vitest';
import { completeFireSale } from '@/engine/systems/industry/DistressCascade';
import type { DistressedAssetOffer } from '@/engine/types/distress.types';
import type { GameState } from '@/engine/types';

const baseOffer: DistressedAssetOffer = {
  id: 'o1', sellerId: 'r1', sellerName: 'Carolco', assetKind: 'franchise',
  assetId: 'f1', assetLabel: "franchise 'Rambo'", price: 100_000_000,
  aiBuyerId: 'r2', aiBuyerName: 'Helix', createdWeek: 5, expiresWeek: 7,
};

function makeState(): GameState {
  return {
    studio: { id: 'PLAYER_STUDIO' },
    finance: { cash: 500_000_000 },
    entities: { rivals: { r1: { id: 'r1', name: 'Carolco', cash: -50_000_000, prestige: 30 }, r2: { id: 'r2', name: 'Helix', cash: 800_000_000, prestige: 40 } } },
    ip: { franchises: { f1: { id: 'f1', name: 'Rambo', ownerId: 'r1' } }, vault: [] },
  } as unknown as GameState;
}

describe('completeFireSale', () => {
  it('transfers a franchise to a RIVAL buyer: rival debited, seller credited, ownership moved', () => {
    const impacts = completeFireSale(makeState(), baseOffer, 'r2');
    const franchise = impacts.find(i => i.type === 'FRANCHISE_UPDATED') as any;
    expect(franchise.payload.update.ownerId).toBe('r2');
    const buyerDebit = impacts.find(i => i.type === 'RIVAL_UPDATED' && (i as any).payload.rivalId === 'r2') as any;
    expect(buyerDebit.payload.update.cash).toBe(800_000_000 - 100_000_000);
    const sellerCredit = impacts.find(i => i.type === 'RIVAL_UPDATED' && (i as any).payload.rivalId === 'r1') as any;
    expect(sellerCredit.payload.update.cash).toBe(-50_000_000 + 100_000_000);
    expect(impacts.some(i => i.type === 'NEWS_ADDED')).toBe(true);
    // No player cash impact when the buyer is a rival.
    expect(impacts.some(i => i.type === 'FUNDS_DEDUCTED')).toBe(false);
  });

  it('transfers a franchise to the PLAYER: player cash debited via FUNDS_DEDUCTED, no rival-buyer impact', () => {
    const impacts = completeFireSale(makeState(), baseOffer, 'PLAYER_STUDIO');
    const franchise = impacts.find(i => i.type === 'FRANCHISE_UPDATED') as any;
    expect(franchise.payload.update.ownerId).toBe('PLAYER_STUDIO');
    const playerDebit = impacts.find(i => i.type === 'FUNDS_DEDUCTED') as any;
    expect(playerDebit.payload.amount).toBe(100_000_000);
    const sellerCredit = impacts.find(i => i.type === 'RIVAL_UPDATED' && (i as any).payload.rivalId === 'r1') as any;
    expect(sellerCredit.payload.update.cash).toBe(-50_000_000 + 100_000_000);
    // No rival-buyer debit when the buyer is the player.
    expect(impacts.some(i => i.type === 'RIVAL_UPDATED' && (i as any).payload.rivalId === 'PLAYER_STUDIO')).toBe(false);
  });
});
