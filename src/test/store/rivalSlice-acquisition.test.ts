import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useGameStore } from "@/store/gameStore";
import { RegulatorSystem } from "@/engine/systems/industry/RegulatorSystem";
import { createMockGameState, createMockRival } from "../engine/generators/mockFactory";

function seed() {
  return createMockGameState({
    finance: { cash: 5_000_000_000, ledger: [], weeklyHistory: [] } as any,
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
          cash: 50_000_000,
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

beforeEach(() => {
  vi.spyOn(RegulatorSystem, "isBlocked").mockReturnValue({
    blocked: false,
    sharePreview: 10,
  });
  const gs = seed();
  useGameStore.setState({ gameState: gs, finance: gs.finance } as any);
});

afterEach(() => vi.restoreAllMocks());

describe("rivalSlice acquisition", () => {
  it("previewAcquisition returns a preview without mutating state", () => {
    const before = useGameStore.getState().gameState;
    const preview = useGameStore.getState().previewAcquisition("r1");
    expect(preview?.targetName).toBe("Target Co");
    expect(useGameStore.getState().gameState).toBe(before);
  });

  it("previewAcquisition returns null when there is no game", () => {
    useGameStore.setState({ gameState: null } as any);
    expect(useGameStore.getState().previewAcquisition("r1")).toBeNull();
  });

  it("previewAcquisition returns a not-found preview for invalid target", () => {
    const preview = useGameStore.getState().previewAcquisition("nonexistent");
    expect(preview).not.toBeNull();
    expect(preview!.canProceed).toBe(false);
    expect(preview!.reason).toMatch(/not found/i);
  });

  it("acquireRival absorbs the rival", () => {
    useGameStore.getState().acquireRival("r1");
    const state = useGameStore.getState().gameState;
    expect(state).not.toBeNull();
    expect(state!.entities.rivals.r1).toBeUndefined();
  });

  it("acquireRival syncs finance to top-level store slice", () => {
    const beforeFinance = useGameStore.getState().finance;
    useGameStore.getState().acquireRival("r1");
    const afterFinance = useGameStore.getState().finance;
    expect(afterFinance).not.toBe(beforeFinance);
    expect(afterFinance.cash).not.toBe(beforeFinance.cash);
  });

  it("acquireRival with null gameState is a no-op", () => {
    useGameStore.setState({ gameState: null } as any);
    const before = useGameStore.getState();
    useGameStore.getState().acquireRival("r1");
    expect(useGameStore.getState()).toBe(before);
  });
});
