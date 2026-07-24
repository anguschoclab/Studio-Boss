import { describe, it, expect } from "vitest";
import { stage1IPFireSale } from "@/engine/systems/industry/DistressCascade";
import type { GameState } from "@/engine/types";

// stage1IPFireSale is currently not exported — Step 3 also adds the `export` keyword.
function makeState(playerCash: number): GameState {
  return {
    week: 10,
    studio: { id: "PLAYER", name: "Player Studio" },
    finance: { cash: playerCash },
    entities: {
      rivals: {
        r1: { id: "r1", name: "Carolco", cash: -60_000_000, prestige: 30, strength: 20 },
        r2: { id: "r2", name: "Helix", cash: 900_000_000, prestige: 40 },
      },
    },
    ip: { franchises: { f1: { id: "f1", name: "Rambo", ownerId: "r1" } }, vault: [] },
    industry: { distressedOffers: [] },
  } as unknown as GameState;
}

describe("stage1IPFireSale player offer", () => {
  it("when the player can afford it: creates an offer + a modal trigger, does NOT transfer yet", () => {
    const seller = makeState(2_000_000_000).entities.rivals.r1;
    const impacts = stage1IPFireSale(makeState(2_000_000_000), seller as any);
    expect(
      impacts.some(
        (i) =>
          i.type === "MODAL_TRIGGERED" && (i as any).payload.modalType === "DISTRESSED_ASSET_OFFER"
      )
    ).toBe(true);
    // Offer appended to industry.distressedOffers via INDUSTRY_UPDATE.
    const upd = impacts.find(
      (i) => i.type === "INDUSTRY_UPDATE" && (i as any).payload.update["industry.distressedOffers"]
    ) as any;
    expect(upd.payload.update["industry.distressedOffers"]).toHaveLength(1);
    // No ownership transfer yet.
    expect(impacts.some((i) => i.type === "FRANCHISE_UPDATED")).toBe(false);
  });

  it("when the player is broke: completes to the AI buyer immediately (transfer happens)", () => {
    const seller = makeState(0).entities.rivals.r1;
    const impacts = stage1IPFireSale(makeState(0), seller as any);
    expect(impacts.some((i) => i.type === "MODAL_TRIGGERED")).toBe(false);
    expect(impacts.some((i) => i.type === "FRANCHISE_UPDATED")).toBe(true);
  });

  it("vault asset offer to player: creates offer with assetKind vault, modal triggered, no transfer yet", () => {
    const state = makeState(2_000_000_000);
    // Remove franchises so it falls through to vault assets
    (state.ip as any).franchises = {};
    (state.ip as any).vault = [{ id: "v1", title: "The Reckoning", ownerStudioId: "r1", rightsOwner: "RIVAL" }];
    const seller = state.entities.rivals.r1;
    const impacts = stage1IPFireSale(state, seller as any);
    const upd = impacts.find(
      (i) => i.type === "INDUSTRY_UPDATE" && (i as any).payload.update["industry.distressedOffers"]
    ) as any;
    expect(upd).toBeDefined();
    const offer = upd.payload.update["industry.distressedOffers"][0];
    expect(offer.assetKind).toBe("vault");
    expect(offer.assetId).toBe("v1");
    expect(impacts.some((i) => i.type === "MODAL_TRIGGERED")).toBe(true);
    // No vault transfer yet
    expect(
      impacts.some((i) => i.type === "INDUSTRY_UPDATE" && (i as any).payload.update["ip.vault"])
    ).toBe(false);
  });

  it("no buyers available (all rivals < $500M): returns empty impacts, no offer created", () => {
    const state = makeState(2_000_000_000);
    (state.entities.rivals as any).r2.cash = 100_000_000; // Below $500M threshold
    const seller = state.entities.rivals.r1;
    const impacts = stage1IPFireSale(state, seller as any);
    expect(impacts).toEqual([]);
  });

  it("no owned IP (no franchises, no vault assets): returns empty impacts", () => {
    const state = makeState(2_000_000_000);
    (state.ip as any).franchises = {};
    (state.ip as any).vault = [];
    const seller = state.entities.rivals.r1;
    const impacts = stage1IPFireSale(state, seller as any);
    expect(impacts).toEqual([]);
  });

  it("offer ID format: distress-{sellerId}-{week}", () => {
    const state = makeState(2_000_000_000);
    const seller = state.entities.rivals.r1;
    const impacts = stage1IPFireSale(state, seller as any);
    const upd = impacts.find(
      (i) => i.type === "INDUSTRY_UPDATE" && (i as any).payload.update["industry.distressedOffers"]
    ) as any;
    const offer = upd.payload.update["industry.distressedOffers"][0];
    expect(offer.id).toBe("distress-r1-10");
  });
});
