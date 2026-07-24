import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
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

function seed(): GameState {
  return {
    week: 6,
    studio: { id: "PLAYER", name: "Player Studio" },
    finance: { cash: 500_000_000, weeklyHistory: [], ledger: [], marketState: {} },
    entities: {
      rivals: {
        r1: { id: "r1", name: "Carolco", cash: -60_000_000, prestige: 30 },
        r2: { id: "r2", name: "Helix", cash: 900_000_000, prestige: 40 },
      },
      projects: {},
    },
    ip: { franchises: { f1: { id: "f1", name: "Rambo", ownerId: "r1" } }, vault: [] },
    industry: { distressedOffers: [offer], newsHistory: [] },
  } as unknown as GameState;
}

beforeEach(() => {
  useGameStore.setState({ gameState: seed() } as any);
  useUIStore.setState({
    activeModal: { id: "m1", type: "DISTRESSED_ASSET_OFFER", payload: { offerId: "o1" } },
    modalQueue: [],
  } as any);
});

describe("distress slice", () => {
  it("acquireDistressedAsset: player owns the franchise, cash debited, offer removed, modal resolved", () => {
    useGameStore.getState().acquireDistressedAsset("o1");
    const s = useGameStore.getState().gameState!;
    expect(s.ip.franchises.f1.ownerId).toBe("PLAYER");
    expect(s.finance.cash).toBe(500_000_000 - 100_000_000);
    expect(s.industry.distressedOffers).toHaveLength(0);
    expect(useUIStore.getState().activeModal).toBeNull();
  });

  it("declineDistressedAsset: AI buyer owns the franchise, player cash unchanged, offer removed", () => {
    useGameStore.getState().declineDistressedAsset("o1");
    const s = useGameStore.getState().gameState!;
    expect(s.ip.franchises.f1.ownerId).toBe("r2");
    expect(s.finance.cash).toBe(500_000_000);
    expect(s.industry.distressedOffers).toHaveLength(0);
    expect(useUIStore.getState().activeModal).toBeNull();
  });

  it("acquire with insufficient cash: modal resolved, no ownership transfer, offer remains", () => {
    useGameStore.setState({
      gameState: { ...seed(), finance: { cash: 50_000_000, weeklyHistory: [], ledger: [], marketState: {} } } as any,
    });
    useUIStore.setState({
      activeModal: { id: "m1", type: "DISTRESSED_ASSET_OFFER", payload: { offerId: "o1" } },
      modalQueue: [],
    } as any);
    useGameStore.getState().acquireDistressedAsset("o1");
    const s = useGameStore.getState().gameState!;
    // Franchise not transferred to player
    expect(s.ip.franchises.f1.ownerId).toBe("r1");
    // Cash unchanged
    expect(s.finance.cash).toBe(50_000_000);
    // Offer still in state
    expect(s.industry.distressedOffers).toHaveLength(1);
    // Modal resolved
    expect(useUIStore.getState().activeModal).toBeNull();
  });

  it("acquire with offerId not found: modal resolved, no state change", () => {
    useGameStore.getState().acquireDistressedAsset("nonexistent");
    const s = useGameStore.getState().gameState!;
    expect(s.ip.franchises.f1.ownerId).toBe("r1");
    expect(s.industry.distressedOffers).toHaveLength(1);
    expect(useUIStore.getState().activeModal).toBeNull();
  });

  it("decline with offerId not found: modal resolved, no state change", () => {
    useGameStore.getState().declineDistressedAsset("nonexistent");
    const s = useGameStore.getState().gameState!;
    expect(s.ip.franchises.f1.ownerId).toBe("r1");
    expect(s.industry.distressedOffers).toHaveLength(1);
    expect(useUIStore.getState().activeModal).toBeNull();
  });

  it("double-resolve regression: acquiring does not skip the next queued modal", () => {
    // Enqueue a second modal behind the distress modal
    useUIStore.setState({
      activeModal: { id: "m1", type: "DISTRESSED_ASSET_OFFER", payload: { offerId: "o1" } },
      modalQueue: [{ id: "m2", type: "SUMMARY", payload: {} }],
    } as any);
    useGameStore.getState().acquireDistressedAsset("o1");
    // The distress modal should be resolved, and the SUMMARY modal should be active
    const ui = useUIStore.getState();
    expect(ui.activeModal).not.toBeNull();
    expect((ui.activeModal as any).type).toBe("SUMMARY");
    expect(ui.modalQueue).toHaveLength(0);
  });
});
