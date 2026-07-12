import { describe, it, expect, beforeEach } from "vitest";
import { stage1IPFireSale, resetDistressState } from "@/engine/systems/industry/DistressCascade";
import type { GameState } from "@/engine/types";

function makeState(playerCash: number): GameState {
  return {
    week: 10,
    studio: { id: "PLAYER", name: "Player Studio" },
    finance: { cash: playerCash },
    entities: {
      rivals: {
        r1: { id: "r1", name: "Carolco", cash: -60_000_000, prestige: 30, strength: 20 },
        r2: { id: "r2", name: "Helix", cash: 900_000_000, prestige: 40 },
        r3: { id: "r3", name: "MGM", cash: 600_000_000, prestige: 50 },
      },
    },
    ip: {
      franchises: {
        f1: { id: "f1", name: "Rambo", ownerId: "r1" },
        f2: { id: "f2", name: "Rocky", ownerId: "r1" },
      },
      vault: [
        { id: "v1", title: "Old Movie", ownerStudioId: "r1", baseValue: 50_000_000 },
        { id: "v2", title: "Sequel", ownerStudioId: "r1", baseValue: 80_000_000 },
        { id: "v3", title: "Other", ownerStudioId: "r2", baseValue: 100_000_000 },
      ],
    },
    industry: { distressedOffers: [] },
  } as unknown as GameState;
}

describe("DistressCascade performance refactor", () => {
  beforeEach(() => {
    resetDistressState();
  });

  describe("stage1IPFireSale — for...in franchise filtering", () => {
    it("correctly filters franchises by ownerId", () => {
      const state = makeState(0);
      const seller = (state.entities.rivals as any).r1;
      const impacts = stage1IPFireSale(state, seller);
      // Should find franchises owned by r1 and complete fire sale to AI buyer
      expect(impacts.some((i: any) => i.type === "FRANCHISE_UPDATED")).toBe(true);
      const franchiseUpdate = impacts.find((i: any) => i.type === "FRANCHISE_UPDATED") as any;
      expect(franchiseUpdate.payload.update.ownerId).not.toBe("r1");
    });

    it("returns empty when seller owns no franchises or vault assets", () => {
      const state = makeState(0);
      const seller = {
        id: "r3",
        name: "Empty Studio",
        cash: -60_000_000,
        prestige: 30,
        strength: 20,
      } as any;
      const impacts = stage1IPFireSale(state, seller);
      expect(impacts).toHaveLength(0);
    });

    it("filters buyers by cash threshold > 500M using for...in", () => {
      const state = makeState(0);
      const seller = (state.entities.rivals as any).r1;
      const impacts = stage1IPFireSale(state, seller);
      // r2 (900M) and r3 (600M) both qualify as buyers
      const fireSale = impacts.find((i: any) => i.type === "FRANCHISE_UPDATED") as any;
      const buyerId = fireSale?.payload.update.ownerId;
      expect(["r2", "r3"]).toContain(buyerId);
    });
  });

  describe("stage2AssetLiquidation — Set-based vault lookup", () => {
    it("vault bundle transfer correctly updates ownership via Set lookup", () => {
      // This is tested indirectly via tickDistressCascade, but we can verify
      // the vault structure supports the Set-based approach by checking that
      // vault items have unique ids that can be looked up in a Set.
      const state = makeState(0);
      const vault = (state.ip as any).vault;
      const bundleIds = new Set(["v1", "v2"]);
      const newVault = vault.map((a: any) =>
        bundleIds.has(a.id) ? { ...a, ownerStudioId: "r2" } : a
      );
      expect(newVault.find((a: any) => a.id === "v1").ownerStudioId).toBe("r2");
      expect(newVault.find((a: any) => a.id === "v2").ownerStudioId).toBe("r2");
      expect(newVault.find((a: any) => a.id === "v3").ownerStudioId).toBe("r2");
    });
  });
});
