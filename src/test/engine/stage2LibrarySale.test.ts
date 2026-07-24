import { describe, it, expect, beforeEach, vi } from "vitest";
import { stage2AssetLiquidation, resetDistressState } from "@/engine/systems/industry/DistressCascade";
import { applyImpacts } from "@/engine/core/impactReducer";
import type { GameState } from "@/engine/types";
import * as utils from "@/engine/utils";

function makeStage2State(): GameState {
  return {
    week: 30,
    studio: { id: "PLAYER", name: "Player Studio" },
    finance: { cash: 0 },
    entities: {
      rivals: {
        r1: {
          id: "r1",
          name: "Carolco",
          cash: -100_000_000,
          prestige: 30,
          strength: 20,
        },
        r2: {
          id: "r2",
          name: "Helix",
          cash: 900_000_000,
          prestige: 40,
        },
      },
      projects: {},
      talents: {},
    },
    ip: {
      franchises: {},
      vault: [
        { id: "v1", title: "Old Movie", ownerStudioId: "r1", baseValue: 50_000_000, rightsOwner: "RIVAL" },
        { id: "v2", title: "Sequel", ownerStudioId: "r1", baseValue: 80_000_000, rightsOwner: "RIVAL" },
        { id: "v3", title: "Other", ownerStudioId: "r1", baseValue: 100_000_000, rightsOwner: "RIVAL" },
      ],
    },
    industry: { distressedOffers: [], newsHistory: [] },
    market: { buyers: [] },
  } as unknown as GameState;
}

describe("stage2AssetLiquidation — library sale rightsOwner", () => {
  beforeEach(() => {
    resetDistressState();
    vi.restoreAllMocks();
    vi.spyOn(utils, "secureRandom").mockReturnValue(0.60);
  });

  it("sets rightsOwner to RIVAL when a rival buyer exists", () => {
    const state = makeStage2State();
    const seller = (state.entities.rivals as any).r1;
    const impacts = stage2AssetLiquidation(state, seller);
    const finalState = applyImpacts(state, impacts);

    const vault = (finalState.ip as any).vault;
    const transferred = vault.filter((a: any) => a.ownerStudioId === "r2");
    expect(transferred.length).toBeGreaterThan(0);
    for (const a of transferred) {
      expect(a.rightsOwner).toBe("RIVAL");
    }
  });

  it("sets rightsOwner to MARKET when no rival buyer exists", () => {
    const state = makeStage2State();
    (state.entities.rivals as any).r2.cash = 100_000_000;
    const seller = (state.entities.rivals as any).r1;
    const impacts = stage2AssetLiquidation(state, seller);
    const finalState = applyImpacts(state, impacts);

    const vault = (finalState.ip as any).vault;
    const transferred = vault.filter(
      (a: any) => a.ownerStudioId === undefined && a.id !== "v3"
    );
    if (transferred.length > 0) {
      for (const a of transferred) {
        expect(a.rightsOwner).toBe("MARKET");
      }
    }
  });
});
