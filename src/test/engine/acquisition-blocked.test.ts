import { describe, it, expect, vi, afterEach } from "vitest";
import {
  executeAcquisition,
  evaluateAcquisitionTarget,
} from "@/engine/systems/mergers";
import { RegulatorSystem } from "@/engine/systems/industry/RegulatorSystem";
import { createMockGameState, createMockRival } from "./generators/mockFactory";

function makeState(playerCash = 5_000_000_000, targetCash = 50_000_000) {
  return createMockGameState({
    finance: { cash: playerCash, ledger: [], weeklyHistory: [] } as any,
    studio: {
      id: "PLR-1",
      name: "Player Studio",
      archetype: "major",
      prestige: 50,
      internal: { projectHistory: [], projects: {}, contracts: [] },
    } as any,
    entities: {
      projects: {},
      releasedProjectIds: [],
      talents: {},
      contracts: {},
      rivals: {
        r1: createMockRival({
          id: "r1",
          name: "Target Co",
          cash: targetCash,
          strength: 30,
          prestige: 30,
          archetype: "mid-tier",
        }),
      },
      contractsByProjectId: {},
      contractsByTalentId: {},
    } as any,
  });
}

afterEach(() => vi.restoreAllMocks());

describe("executeAcquisition regulator gate", () => {
  it("BLOCKED: target survives, no ownership transfer", () => {
    vi.spyOn(RegulatorSystem, "isBlocked").mockReturnValue({
      blocked: true,
      sharePreview: 40,
      reason: "Severe Concentration of Media Power",
    });
    const before = makeState();
    const after = executeAcquisition(before, "r1");

    expect(after.entities.rivals.r1).toBeDefined();
    expect(after.finance.cash).toBeLessThan(before.finance.cash);
    expect(after.studio.prestige).toBeLessThan(before.studio.prestige);
    expect(after.industry.newsHistory[0].headline).toMatch(/block|reject/i);
  });

  it("BLOCKED: filing fee is exactly 2% of price", () => {
    vi.spyOn(RegulatorSystem, "isBlocked").mockReturnValue({
      blocked: true,
      sharePreview: 40,
      reason: "Blocked",
    });
    const state = makeState();
    const target = state.entities.rivals["r1"];
    const evalResult = evaluateAcquisitionTarget(target, state.finance.cash);
    const expectedFee = Math.round(evalResult.price * 0.02);

    const after = executeAcquisition(state, "r1");
    expect(after.finance.cash).toBe(state.finance.cash - expectedFee);
  });

  it("BLOCKED: prestige penalty is exactly -3", () => {
    vi.spyOn(RegulatorSystem, "isBlocked").mockReturnValue({
      blocked: true,
      sharePreview: 40,
    });
    const state = makeState();
    const after = executeAcquisition(state, "r1");
    expect(after.studio.prestige).toBe(state.studio.prestige - 3);
  });

  it("BLOCKED: news description contains reason text", () => {
    vi.spyOn(RegulatorSystem, "isBlocked").mockReturnValue({
      blocked: true,
      sharePreview: 40,
      reason: "Severe Concentration of Media Power",
    });
    const after = executeAcquisition(makeState(), "r1");
    expect(after.industry.newsHistory[0].description).toContain(
      "Severe Concentration of Media Power"
    );
  });

  it("BLOCKED: prestige does not go below 0", () => {
    vi.spyOn(RegulatorSystem, "isBlocked").mockReturnValue({
      blocked: true,
      sharePreview: 40,
    });
    const state = makeState();
    state.studio.prestige = 2;
    const after = executeAcquisition(state, "r1");
    expect(after.studio.prestige).toBe(0);
  });

  it("ALLOWED: target absorbed and prestige rises", () => {
    vi.spyOn(RegulatorSystem, "isBlocked").mockReturnValue({
      blocked: false,
      sharePreview: 10,
    });
    const before = makeState();
    const after = executeAcquisition(before, "r1");

    expect(after.entities.rivals.r1).toBeUndefined();
    expect(after.studio.prestige).toBeGreaterThan(before.studio.prestige);
  });

  it("ALLOWED: cash = playerCash - price + targetCash", () => {
    vi.spyOn(RegulatorSystem, "isBlocked").mockReturnValue({
      blocked: false,
      sharePreview: 10,
    });
    const state = makeState(5_000_000_000, 50_000_000);
    const target = state.entities.rivals["r1"];
    const evalResult = evaluateAcquisitionTarget(target, state.finance.cash);
    const after = executeAcquisition(state, "r1");
    expect(after.finance.cash).toBe(
      state.finance.cash - evalResult.price + target.cash
    );
  });

  it("still returns unmodified state for invalid target ID", () => {
    vi.spyOn(RegulatorSystem, "isBlocked").mockReturnValue({
      blocked: false,
      sharePreview: 0,
    });
    const state = makeState();
    const result = executeAcquisition(state, "nonexistent");
    expect(result).toBe(state);
  });

  it("still returns unmodified state for unaffordable target", () => {
    vi.spyOn(RegulatorSystem, "isBlocked").mockReturnValue({
      blocked: false,
      sharePreview: 0,
    });
    const state = makeState(1);
    const result = executeAcquisition(state, "r1");
    expect(result).toBe(state);
  });
});
