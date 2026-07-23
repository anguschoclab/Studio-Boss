import { describe, it, expect } from "vitest";
import { selectFatigueForAsset } from "@/store/selectors";
import { GameState, IPAsset, Franchise } from "@/engine/types";
import { createMockGameState } from "@/test/mockFactory";

function makeFranchise(overrides: Partial<Franchise> = {}): Franchise {
  return {
    id: "FR-1",
    name: "Test Universe",
    relevanceScore: 80,
    fatigueLevel: 0.2,
    audienceLoyalty: 50,
    totalEquity: 500_000_000,
    synergyMultiplier: 1.0,
    assetIds: ["ip-1"],
    activeProjectIds: [],
    lastReleaseWeeks: [10],
    creationWeek: 1,
    ...overrides,
  };
}

function makeAsset(overrides: Partial<IPAsset> = {}): IPAsset {
  return {
    id: "ip-1",
    originalProjectId: "prj-orig",
    title: "Test IP",
    franchiseId: "FR-1",
    baseValue: 50_000_000,
    decayRate: 0.8,
    merchandisingMultiplier: 1.0,
    syndicationStatus: "NONE",
    syndicationTier: "NONE",
    totalEpisodes: 0,
    rightsExpirationWeek: 999,
    rightsOwner: "STUDIO",
    ...overrides,
  };
}

describe("selectFatigueForAsset", () => {
  it("returns 0 for null state", () => {
    expect(selectFatigueForAsset(null, "ip-1")).toBe(0);
  });

  it("returns 0 for unknown asset ID", () => {
    const state = createMockGameState({
      ip: { vault: [makeAsset()], franchises: { "FR-1": makeFranchise() } },
    });
    expect(selectFatigueForAsset(state, "nonexistent")).toBe(0);
  });

  it("returns 0 for asset with no franchiseId", () => {
    const state = createMockGameState({
      ip: { vault: [makeAsset({ franchiseId: undefined })], franchises: {} },
    });
    expect(selectFatigueForAsset(state, "ip-1")).toBe(0);
  });

  it("returns 0 for asset whose franchiseId doesn't exist in franchises", () => {
    const state = createMockGameState({
      ip: { vault: [makeAsset({ franchiseId: "FR-MISSING" })], franchises: { "FR-1": makeFranchise() } },
    });
    expect(selectFatigueForAsset(state, "ip-1")).toBe(0);
  });

  it("returns a number 0-100 for a valid franchised asset", () => {
    const state = createMockGameState({
      ip: { vault: [makeAsset()], franchises: { "FR-1": makeFranchise() } },
    });
    const result = selectFatigueForAsset(state, "ip-1");
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it("returns higher fatigue with more activeProjectIds", () => {
    const stateLow = createMockGameState({
      ip: { vault: [makeAsset()], franchises: { "FR-1": makeFranchise({ activeProjectIds: [] }) } },
    });
    const stateHigh = createMockGameState({
      ip: { vault: [makeAsset()], franchises: { "FR-1": makeFranchise({ activeProjectIds: ["p1", "p2", "p3"] }) } },
    });
    const low = selectFatigueForAsset(stateLow, "ip-1");
    const high = selectFatigueForAsset(stateHigh, "ip-1");
    expect(high).toBeGreaterThan(low);
  });

  it("returns lower fatigue with higher audienceLoyalty", () => {
    const stateLowLoyalty = createMockGameState({
      ip: { vault: [makeAsset()], franchises: { "FR-1": makeFranchise({ audienceLoyalty: 10, activeProjectIds: ["p1"] }) } },
    });
    const stateHighLoyalty = createMockGameState({
      ip: { vault: [makeAsset()], franchises: { "FR-1": makeFranchise({ audienceLoyalty: 100, activeProjectIds: ["p1"] }) } },
    });
    const low = selectFatigueForAsset(stateLowLoyalty, "ip-1");
    const high = selectFatigueForAsset(stateHighLoyalty, "ip-1");
    expect(high).toBeLessThan(low);
  });

  it("result is scaled to 0-100 (not 0-1)", () => {
    const state = createMockGameState({
      ip: { vault: [makeAsset()], franchises: { "FR-1": makeFranchise({ activeProjectIds: ["p1", "p2", "p3"] }) } },
    });
    const result = selectFatigueForAsset(state, "ip-1");
    expect(result).toBeGreaterThan(1);
  });
});
