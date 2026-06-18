import { describe, it, expect } from 'vitest';
import { stage1IPFireSale } from '@/engine/systems/industry/DistressCascade';
import type { GameState } from '@/engine/types';

// stage1IPFireSale is currently not exported — Step 3 also adds the `export` keyword.
function makeState(playerCash: number): GameState {
  return {
    week: 10,
    studio: { id: 'PLAYER', name: 'Player Studio' },
    finance: { cash: playerCash },
    entities: { rivals: {
      r1: { id: 'r1', name: 'Carolco', cash: -60_000_000, prestige: 30, strength: 20 },
      r2: { id: 'r2', name: 'Helix', cash: 900_000_000, prestige: 40 },
    } },
    ip: { franchises: { f1: { id: 'f1', name: 'Rambo', ownerId: 'r1' } }, vault: [] },
    industry: { distressedOffers: [] },
  } as unknown as GameState;
}

describe('stage1IPFireSale player offer', () => {
  it('when the player can afford it: creates an offer + a modal trigger, does NOT transfer yet', () => {
    const seller = makeState(2_000_000_000).entities.rivals.r1;
    const impacts = stage1IPFireSale(makeState(2_000_000_000), seller as any);
    expect(impacts.some(i => i.type === 'MODAL_TRIGGERED' && (i as any).payload.modalType === 'DISTRESSED_ASSET_OFFER')).toBe(true);
    // Offer appended to industry.distressedOffers via INDUSTRY_UPDATE.
    const upd = impacts.find(i => i.type === 'INDUSTRY_UPDATE' && (i as any).payload.update['industry.distressedOffers']) as any;
    expect(upd.payload.update['industry.distressedOffers']).toHaveLength(1);
    // No ownership transfer yet.
    expect(impacts.some(i => i.type === 'FRANCHISE_UPDATED')).toBe(false);
  });

  it('when the player is broke: completes to the AI buyer immediately (transfer happens)', () => {
    const seller = makeState(0).entities.rivals.r1;
    const impacts = stage1IPFireSale(makeState(0), seller as any);
    expect(impacts.some(i => i.type === 'MODAL_TRIGGERED')).toBe(false);
    expect(impacts.some(i => i.type === 'FRANCHISE_UPDATED')).toBe(true);
  });
});
