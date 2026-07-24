import { describe, it, expect, beforeEach } from "vitest";
import {
  completeFireSale,
  tickDistressCascade,
} from "../../../engine/systems/industry/DistressCascade";
import { createMockGameState, createMockIPAsset } from "../../utils/mockFactories";
import type {
  GameState,
  RivalStudio,
  IPAsset,
  Franchise,
  StateImpact,
} from "../../../engine/types";
import type { DistressedAssetOffer } from "../../../engine/types/distress.types";

function createMockRival(overrides: Partial<RivalStudio> = {}): RivalStudio {
  return {
    id: "rival-1",
    name: "Test Rival",
    motto: "We make movies",
    archetype: "major",
    strength: 50,
    cash: 100_000_000,
    prestige: 50,
    foundedWeek: 0,
    recentActivity: "",
    projectCount: 0,
    motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
    currentMotivation: "STABILITY",
    projects: {},
    contracts: [],
    ...overrides,
  } as RivalStudio;
}

function createMockFranchise(overrides: Partial<Franchise> = {}): Franchise {
  return {
    id: "frac-1",
    name: "Test Franchise",
    relevanceScore: 70,
    fatigueLevel: 0.2,
    audienceLoyalty: 60,
    totalEquity: 50_000_000,
    synergyMultiplier: 1.2,
    assetIds: [],
    activeProjectIds: [],
    lastReleaseWeeks: [],
    creationWeek: 0,
    ...overrides,
  };
}

function findImpact(impacts: StateImpact[], type: string): StateImpact | undefined {
  return impacts.find((i) => i.type === type);
}

describe("DistressCascade impact types", () => {
  beforeEach(() => {
  });

  describe("completeFireSale", () => {
    it("produces FRANCHISE_UPDATED for franchise asset kind", () => {
      const rival = createMockRival({ id: "seller", name: "Seller" });
      const buyer = createMockRival({ id: "buyer", name: "Buyer", cash: 1_000_000_000 });
      const state = createMockGameState({
        week: 10,
        entities: {
          rivals: { seller: rival, buyer },
          projects: {},
          releasedProjectIds: [],
          talents: {},
          contracts: {},
          contractsByProjectId: {},
          contractsByTalentId: {},
        },
        ip: {
          vault: [],
          franchises: {
            "frac-1": createMockFranchise({ id: "frac-1", ownerId: "seller" }),
          },
        },
        finance: { cash: 500_000_000, ledger: [], weeklyHistory: [], marketState: { trends: {}, buyerActivity: {}, marketEvents: [], heat: 50 } } as any,
      });

      const offer: DistressedAssetOffer = {
        id: "offer-1",
        sellerId: "seller",
        sellerName: "Seller",
        assetKind: "franchise",
        assetId: "frac-1",
        assetLabel: "franchise 'Test Franchise'",
        price: 100_000_000,
        aiBuyerId: "buyer",
        aiBuyerName: "Buyer",
        createdWeek: 8,
        expiresWeek: 12,
      };

      const impacts = completeFireSale(state, offer, "buyer");
      const fracImpact = findImpact(impacts, "FRANCHISE_UPDATED");
      expect(fracImpact).toBeDefined();
      expect((fracImpact!.payload as { franchiseId: string }).franchiseId).toBe("frac-1");
      expect((fracImpact!.payload as { update: { ownerId: string } }).update.ownerId).toBe("buyer");
    });

    it("produces INDUSTRY_UPDATE with ip.vault for vault asset kind", () => {
      const asset = createMockIPAsset({ id: "asset-1", title: "Test Movie", ownerStudioId: "seller" });
      const rival = createMockRival({ id: "seller", name: "Seller" });
      const buyer = createMockRival({ id: "buyer", name: "Buyer", cash: 1_000_000_000 });
      const state = createMockGameState({
        week: 10,
        entities: {
          rivals: { seller: rival, buyer },
          projects: {},
          releasedProjectIds: [],
          talents: {},
          contracts: {},
          contractsByProjectId: {},
          contractsByTalentId: {},
        },
        ip: { vault: [asset], franchises: {} },
        finance: { cash: 500_000_000, ledger: [], weeklyHistory: [], marketState: { trends: {}, buyerActivity: {}, marketEvents: [], heat: 50 } } as any,
      });

      const offer: DistressedAssetOffer = {
        id: "offer-2",
        sellerId: "seller",
        sellerName: "Seller",
        assetKind: "vault",
        assetId: "asset-1",
        assetLabel: "'Test Movie'",
        price: 80_000_000,
        aiBuyerId: "buyer",
        aiBuyerName: "Buyer",
        createdWeek: 8,
        expiresWeek: 12,
      };

      const impacts = completeFireSale(state, offer, "buyer");
      const industryImpact = findImpact(impacts, "INDUSTRY_UPDATE");
      expect(industryImpact).toBeDefined();
      const update = (industryImpact!.payload as { update: Record<string, unknown> }).update;
      expect(update["ip.vault"]).toBeDefined();
      const newVault = update["ip.vault"] as IPAsset[];
      const transferred = newVault.find((a) => a.id === "asset-1");
      expect(transferred?.ownerStudioId).toBe("buyer");
      expect(transferred?.rightsOwner).toBe("RIVAL");
    });

    it("produces RIVAL_UPDATED for seller with cash and prestige hit", () => {
      const rival = createMockRival({ id: "seller", name: "Seller", cash: 0, prestige: 40 });
      const buyer = createMockRival({ id: "buyer", name: "Buyer", cash: 1_000_000_000 });
      const state = createMockGameState({
        week: 10,
        entities: {
          rivals: { seller: rival, buyer },
          projects: {},
          releasedProjectIds: [],
          talents: {},
          contracts: {},
          contractsByProjectId: {},
          contractsByTalentId: {},
        },
        ip: {
          vault: [],
          franchises: { "frac-1": createMockFranchise({ id: "frac-1", ownerId: "seller" }) },
        },
        finance: { cash: 500_000_000, ledger: [], weeklyHistory: [], marketState: { trends: {}, buyerActivity: {}, marketEvents: [], heat: 50 } } as any,
      });

      const offer: DistressedAssetOffer = {
        id: "offer-3",
        sellerId: "seller",
        sellerName: "Seller",
        assetKind: "franchise",
        assetId: "frac-1",
        assetLabel: "franchise 'Test'",
        price: 120_000_000,
        aiBuyerId: "buyer",
        aiBuyerName: "Buyer",
        createdWeek: 8,
        expiresWeek: 12,
      };

      const impacts = completeFireSale(state, offer, "buyer");
      const rivalImpact = findImpact(impacts, "RIVAL_UPDATED");
      expect(rivalImpact).toBeDefined();
      const payload = rivalImpact!.payload as { rivalId: string; update: { cash: number; prestige: number } };
      expect(payload.rivalId).toBe("seller");
      expect(payload.update.cash).toBe(120_000_000);
      expect(payload.update.prestige).toBe(35);
    });

    it("produces FUNDS_DEDUCTED when player is the buyer", () => {
      const rival = createMockRival({ id: "seller", name: "Seller" });
      const state = createMockGameState({
        week: 10,
        entities: {
          rivals: { seller: rival },
          projects: {},
          releasedProjectIds: [],
          talents: {},
          contracts: {},
          contractsByProjectId: {},
          contractsByTalentId: {},
        },
        ip: {
          vault: [],
          franchises: { "frac-1": createMockFranchise({ id: "frac-1", ownerId: "seller" }) },
        },
        finance: { cash: 500_000_000, ledger: [], weeklyHistory: [], marketState: { trends: {}, buyerActivity: {}, marketEvents: [], heat: 50 } } as any,
      });

      const offer: DistressedAssetOffer = {
        id: "offer-4",
        sellerId: "seller",
        sellerName: "Seller",
        assetKind: "franchise",
        assetId: "frac-1",
        assetLabel: "franchise 'Test'",
        price: 90_000_000,
        aiBuyerId: "buyer",
        aiBuyerName: "Buyer",
        createdWeek: 8,
        expiresWeek: 12,
      };

      const impacts = completeFireSale(state, offer, "player-studio");
      const fundsImpact = findImpact(impacts, "FUNDS_DEDUCTED");
      expect(fundsImpact).toBeDefined();
      expect((fundsImpact!.payload as { amount: number }).amount).toBe(90_000_000);
    });

    it("produces NEWS_ADDED with market category", () => {
      const rival = createMockRival({ id: "seller", name: "Seller" });
      const buyer = createMockRival({ id: "buyer", name: "Buyer", cash: 1_000_000_000 });
      const state = createMockGameState({
        week: 10,
        entities: {
          rivals: { seller: rival, buyer },
          projects: {},
          releasedProjectIds: [],
          talents: {},
          contracts: {},
          contractsByProjectId: {},
          contractsByTalentId: {},
        },
        ip: {
          vault: [],
          franchises: { "frac-1": createMockFranchise({ id: "frac-1", ownerId: "seller" }) },
        },
        finance: { cash: 500_000_000, ledger: [], weeklyHistory: [], marketState: { trends: {}, buyerActivity: {}, marketEvents: [], heat: 50 } } as any,
      });

      const offer: DistressedAssetOffer = {
        id: "offer-5",
        sellerId: "seller",
        sellerName: "Seller",
        assetKind: "franchise",
        assetId: "frac-1",
        assetLabel: "franchise 'Test'",
        price: 100_000_000,
        aiBuyerId: "buyer",
        aiBuyerName: "Buyer",
        createdWeek: 8,
        expiresWeek: 12,
      };

      const impacts = completeFireSale(state, offer, "buyer");
      const newsImpact = findImpact(impacts, "NEWS_ADDED");
      expect(newsImpact).toBeDefined();
      const payload = newsImpact!.payload as { headline: string; category: string };
      expect(payload.headline).toContain("FIRE SALE");
      expect(payload.category).toBe("market");
    });
  });

  describe("tickDistressCascade — stage3/stage4 impacts", () => {
    it("stage3DistressedMA produces INDUSTRY_UPDATE with mergedRivalId and acquirerId", () => {
      const target = createMockRival({
        id: "target",
        name: "Target",
        cash: -250_000_000,
        prestige: 20,
        strength: 30,
      });
      const acquirer = createMockRival({
        id: "acquirer",
        name: "Acquirer",
        cash: 2_000_000_000,
        prestige: 60,
        strength: 70,
      });
      const state = createMockGameState({
        week: 20,
        entities: {
          rivals: { target, acquirer },
          projects: {},
          releasedProjectIds: [],
          talents: {},
          contracts: {},
          contractsByProjectId: {},
          contractsByTalentId: {},
        },
        ip: { vault: [], franchises: {} },
        industry: {
          families: [],
          agencies: [],
          agents: [],
          awards: [],
          newsHistory: [],
          scandals: [],
          distressedOffers: [],
        } as any,
        finance: { cash: 500_000_000, ledger: [], weeklyHistory: [], marketState: { trends: {}, buyerActivity: {}, marketEvents: [], heat: 50 } } as any,
      });

      const impacts = tickDistressCascade(state);
      const industryImpact = impacts.find(
        (i) => i.type === "INDUSTRY_UPDATE" && (i.payload as { mergedRivalId?: string }).mergedRivalId,
      );
      expect(industryImpact).toBeDefined();
      const payload = industryImpact!.payload as { mergedRivalId: string; acquirerId: string };
      expect(payload.mergedRivalId).toBe("target");
      expect(payload.acquirerId).toBe("acquirer");
    });

    it("stage4Bankruptcy produces INDUSTRY_UPDATE with bankruptRivalId", () => {
      const target = createMockRival({
        id: "doomed",
        name: "Doomed",
        cash: -500_000_000,
        prestige: 5,
        strength: 10,
      });
      // Need > MIN_FLOOR (7) rivals for bankruptcy to fire
      const fillerRivals: Record<string, RivalStudio> = {};
      for (let i = 0; i < 7; i++) {
        const r = createMockRival({ id: `filler-${i}`, name: `Filler ${i}`, cash: 100_000_000 });
        fillerRivals[r.id] = r;
      }
      const state = createMockGameState({
        week: 30,
        entities: {
          rivals: { doomed: target, ...fillerRivals },
          projects: {},
          releasedProjectIds: [],
          talents: {},
          contracts: {},
          contractsByProjectId: {},
          contractsByTalentId: {},
        },
        ip: { vault: [], franchises: {} },
        industry: {
          families: [],
          agencies: [],
          agents: [],
          awards: [],
          newsHistory: [],
          scandals: [],
          distressedOffers: [],
        } as any,
        finance: { cash: 500_000_000, ledger: [], weeklyHistory: [], marketState: { trends: {}, buyerActivity: {}, marketEvents: [], heat: 50 } } as any,
      });

      const impacts = tickDistressCascade(state);
      const bankruptcyImpact = impacts.find(
        (i) => i.type === "INDUSTRY_UPDATE" && (i.payload as { bankruptRivalId?: string }).bankruptRivalId,
      );
      expect(bankruptcyImpact).toBeDefined();
      expect((bankruptcyImpact!.payload as { bankruptRivalId: string }).bankruptRivalId).toBe("doomed");
    });
  });
});
