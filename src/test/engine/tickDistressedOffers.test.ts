import { describe, it, expect } from "vitest";
import { tickDistressedOffers } from "@/engine/systems/industry/DistressCascade";
import { applyImpacts } from "@/engine/core/impactReducer";
import type { GameState } from "@/engine/types";
import type { DistressedAssetOffer } from "@/engine/types/distress.types";

const offer: DistressedAssetOffer = {
  id: "o1",
  sellerId: "r1",
  sellerName: "Carolco",
  assetKind: "franchise",
  assetId: "f1",
  assetLabel: "franchise 'Rambo'",
  price: 100_000_000,
  aiBuyerId: "r2",
  aiBuyerName: "Helix",
  createdWeek: 5,
  expiresWeek: 7,
};

function makeState(week: number, offers: DistressedAssetOffer[]): GameState {
  return {
    week,
    studio: { id: "PLAYER", name: "Player Studio" },
    finance: { cash: 0 },
    entities: {
      rivals: {
        r1: { id: "r1", name: "Carolco", cash: -60_000_000, prestige: 30 },
        r2: { id: "r2", name: "Helix", cash: 900_000_000, prestige: 40 },
      },
    },
    ip: { franchises: { f1: { id: "f1", name: "Rambo", ownerId: "r1" } }, vault: [] },
    industry: { distressedOffers: offers, newsHistory: [] },
  } as unknown as GameState;
}

describe("tickDistressedOffers", () => {
  it("expired offer: completes to AI buyer and is removed from the list", () => {
    const impacts = tickDistressedOffers(makeState(7, [offer]));
    expect(impacts.some((i) => i.type === "FRANCHISE_UPDATED")).toBe(true);
    const upd = impacts.find(
      (i) => i.type === "INDUSTRY_UPDATE" && (i as any).payload.update["industry.distressedOffers"]
    ) as any;
    expect(upd.payload.update["industry.distressedOffers"]).toHaveLength(0);
  });

  it("fresh offer (not yet expired): no impacts", () => {
    expect(tickDistressedOffers(makeState(6, [offer]))).toEqual([]);
  });

  it("multiple expired offers: all completed to their AI buyers, all removed", () => {
    const offer2: DistressedAssetOffer = {
      ...offer, id: "o2", assetId: "f2", aiBuyerId: "r2",
    };
    const state = makeState(7, [offer, offer2]);
    (state.ip as any).franchises.f2 = { id: "f2", name: "Rocky", ownerId: "r1" };
    const impacts = tickDistressedOffers(state);
    // Both franchises transferred
    const franchiseUpdates = impacts.filter((i) => i.type === "FRANCHISE_UPDATED");
    expect(franchiseUpdates).toHaveLength(2);
    // Offers list cleared
    const upd = impacts.find(
      (i) => i.type === "INDUSTRY_UPDATE" && (i as any).payload.update["industry.distressedOffers"]
    ) as any;
    expect(upd.payload.update["industry.distressedOffers"]).toHaveLength(0);
  });

  it("mixed expired + fresh offers: only expired ones completed, fresh remain", () => {
    const freshOffer: DistressedAssetOffer = { ...offer, id: "o2", expiresWeek: 10, assetId: "f2" };
    const state = makeState(7, [offer, freshOffer]);
    (state.ip as any).franchises.f2 = { id: "f2", name: "Rocky", ownerId: "r1" };
    const impacts = tickDistressedOffers(state);
    // Only one franchise transfer (expired offer)
    expect(impacts.filter((i) => i.type === "FRANCHISE_UPDATED")).toHaveLength(1);
    // Fresh offer remains
    const upd = impacts.find(
      (i) => i.type === "INDUSTRY_UPDATE" && (i as any).payload.update["industry.distressedOffers"]
    ) as any;
    expect(upd.payload.update["industry.distressedOffers"]).toHaveLength(1);
    expect(upd.payload.update["industry.distressedOffers"][0].id).toBe("o2");
  });

  it("no offers in state: returns empty impacts", () => {
    expect(tickDistressedOffers(makeState(7, []))).toEqual([]);
  });

  // Bug 7 regression tests: stale state in multi-offer expiry

  it("Bug 7: two expired offers from same seller — seller cash is sum of both credits, not overwritten", () => {
    const offer2: DistressedAssetOffer = {
      ...offer, id: "o2", assetId: "f2", aiBuyerId: "r3",
      aiBuyerName: "MGM",
    };
    const state = makeState(7, [offer, offer2]);
    (state.ip as any).franchises.f2 = { id: "f2", name: "Rocky", ownerId: "r1" };
    (state.entities.rivals as any).r3 = { id: "r3", name: "MGM", cash: 800_000_000, prestige: 35 };
    const impacts = tickDistressedOffers(state);
    const finalState = applyImpacts(state, impacts);
    // Seller should have: -60M + 100M + 100M = 140M (not -60M + 100M = 40M)
    expect((finalState.entities.rivals as any).r1.cash).toBe(-60_000_000 + 100_000_000 + 100_000_000);
  });

  it("Bug 7: two expired offers to same AI buyer — buyer cash is correctly debited for both", () => {
    const offer2: DistressedAssetOffer = {
      ...offer, id: "o2", assetId: "f2",
    };
    const state = makeState(7, [offer, offer2]);
    (state.ip as any).franchises.f2 = { id: "f2", name: "Rocky", ownerId: "r1" };
    const impacts = tickDistressedOffers(state);
    const finalState = applyImpacts(state, impacts);
    // Buyer r2 should have: 900M - 100M - 100M = 700M (not 900M - 100M = 800M)
    expect((finalState.entities.rivals as any).r2.cash).toBe(900_000_000 - 100_000_000 - 100_000_000);
  });
});
