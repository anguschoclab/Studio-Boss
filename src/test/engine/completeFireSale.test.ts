import { describe, it, expect } from "vitest";
import { completeFireSale } from "@/engine/systems/industry/DistressCascade";
import type { DistressedAssetOffer } from "@/engine/types/distress.types";
import type { GameState } from "@/engine/types";

const baseOffer: DistressedAssetOffer = {
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

function makeState(): GameState {
  return {
    studio: { id: "PLAYER_STUDIO" },
    finance: { cash: 500_000_000 },
    entities: {
      rivals: {
        r1: { id: "r1", name: "Carolco", cash: -50_000_000, prestige: 30 },
        r2: { id: "r2", name: "Helix", cash: 800_000_000, prestige: 40 },
      },
    },
    ip: { franchises: { f1: { id: "f1", name: "Rambo", ownerId: "r1" } }, vault: [] },
  } as unknown as GameState;
}

describe("completeFireSale", () => {
  it("transfers a franchise to a RIVAL buyer: rival debited, seller credited, ownership moved", () => {
    const impacts = completeFireSale(makeState(), baseOffer, "r2");
    const franchise = impacts.find((i) => i.type === "FRANCHISE_UPDATED") as any;
    expect(franchise.payload.update.ownerId).toBe("r2");
    const buyerDebit = impacts.find(
      (i) => i.type === "RIVAL_UPDATED" && (i as any).payload.rivalId === "r2"
    ) as any;
    expect(buyerDebit.payload.update.cash).toBe(800_000_000 - 100_000_000);
    const sellerCredit = impacts.find(
      (i) => i.type === "RIVAL_UPDATED" && (i as any).payload.rivalId === "r1"
    ) as any;
    expect(sellerCredit.payload.update.cash).toBe(-50_000_000 + 100_000_000);
    expect(impacts.some((i) => i.type === "NEWS_ADDED")).toBe(true);
    // No player cash impact when the buyer is a rival.
    expect(impacts.some((i) => i.type === "FUNDS_DEDUCTED")).toBe(false);
  });

  it("transfers a franchise to the PLAYER: player cash debited via FUNDS_DEDUCTED, no rival-buyer impact", () => {
    const impacts = completeFireSale(makeState(), baseOffer, "PLAYER_STUDIO");
    const franchise = impacts.find((i) => i.type === "FRANCHISE_UPDATED") as any;
    expect(franchise.payload.update.ownerId).toBe("PLAYER_STUDIO");
    const playerDebit = impacts.find((i) => i.type === "FUNDS_DEDUCTED") as any;
    expect(playerDebit.payload.amount).toBe(100_000_000);
    const sellerCredit = impacts.find(
      (i) => i.type === "RIVAL_UPDATED" && (i as any).payload.rivalId === "r1"
    ) as any;
    expect(sellerCredit.payload.update.cash).toBe(-50_000_000 + 100_000_000);
    // No rival-buyer debit when the buyer is the player.
    expect(
      impacts.some(
        (i) => i.type === "RIVAL_UPDATED" && (i as any).payload.rivalId === "PLAYER_STUDIO"
      )
    ).toBe(false);
  });

  // --- Vault asset transfer tests (Bug 2: rightsOwner must be set) ---

  it("vault asset to RIVAL buyer: sets ownerStudioId AND rightsOwner to RIVAL", () => {
    const vaultOffer: DistressedAssetOffer = { ...baseOffer, assetKind: "vault", assetId: "v1", assetLabel: "'The Reckoning'" };
    const state = makeState();
    (state.ip as any).vault = [{ id: "v1", ownerStudioId: "r1", rightsOwner: "RIVAL" }];
    const impacts = completeFireSale(state, vaultOffer, "r2");
    const vaultUpd = impacts.find(
      (i) => i.type === "INDUSTRY_UPDATE" && (i as any).payload.update["ip.vault"]
    ) as any;
    const newVault = vaultUpd.payload.update["ip.vault"];
    const asset = newVault.find((a: any) => a.id === "v1");
    expect(asset.ownerStudioId).toBe("r2");
    expect(asset.rightsOwner).toBe("RIVAL");
  });

  it("vault asset to PLAYER buyer: sets ownerStudioId AND rightsOwner to STUDIO", () => {
    const vaultOffer: DistressedAssetOffer = { ...baseOffer, assetKind: "vault", assetId: "v1", assetLabel: "'The Reckoning'" };
    const state = makeState();
    (state.ip as any).vault = [{ id: "v1", ownerStudioId: "r1", rightsOwner: "RIVAL" }];
    const impacts = completeFireSale(state, vaultOffer, "PLAYER_STUDIO");
    const vaultUpd = impacts.find(
      (i) => i.type === "INDUSTRY_UPDATE" && (i as any).payload.update["ip.vault"]
    ) as any;
    const newVault = vaultUpd.payload.update["ip.vault"];
    const asset = newVault.find((a: any) => a.id === "v1");
    expect(asset.ownerStudioId).toBe("PLAYER_STUDIO");
    expect(asset.rightsOwner).toBe("STUDIO");
    // Player is debited via FUNDS_DEDUCTED
    const playerDebit = impacts.find((i) => i.type === "FUNDS_DEDUCTED") as any;
    expect(playerDebit.payload.amount).toBe(100_000_000);
  });

  // --- Edge cases ---

  it("missing seller (sellerId not in rivals): no seller credit, ownership still transfers, news generated", () => {
    const state = makeState();
    delete (state.entities.rivals as any).r1;
    const impacts = completeFireSale(state, baseOffer, "r2");
    // No RIVAL_UPDATED for seller (doesn't exist)
    expect(
      impacts.some((i) => i.type === "RIVAL_UPDATED" && (i as any).payload.rivalId === "r1")
    ).toBe(false);
    // Franchise still transfers
    expect(impacts.some((i) => i.type === "FRANCHISE_UPDATED")).toBe(true);
    // News still generated
    expect(impacts.some((i) => i.type === "NEWS_ADDED")).toBe(true);
  });

  it("missing buyer (buyerId not in rivals, not player): no buyer debit, ownership still transfers", () => {
    const state = makeState();
    const impacts = completeFireSale(state, baseOffer, "nonexistent-rival");
    // Franchise still transfers
    const franchise = impacts.find((i) => i.type === "FRANCHISE_UPDATED") as any;
    expect(franchise.payload.update.ownerId).toBe("nonexistent-rival");
    // No RIVAL_UPDATED for buyer (doesn't exist)
    expect(
      impacts.some((i) => i.type === "RIVAL_UPDATED" && (i as any).payload.rivalId === "nonexistent-rival")
    ).toBe(false);
    // No FUNDS_DEDUCTED (not the player)
    expect(impacts.some((i) => i.type === "FUNDS_DEDUCTED")).toBe(false);
  });
});
