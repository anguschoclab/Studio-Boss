import { describe, it, expect } from "vitest";
import { tickDistressedOffers } from "@/engine/systems/industry/DistressCascade";
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
    industry: { distressedOffers: offers },
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
});
