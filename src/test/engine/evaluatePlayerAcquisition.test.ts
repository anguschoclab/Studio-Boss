import { describe, it, expect } from "vitest";
import {
  evaluatePlayerAcquisition,
  evaluateAcquisitionTarget,
} from "@/engine/systems/mergers";
import { createMockGameState, createMockRival } from "./generators/mockFactory";

function makeState(opts: {
  playerCash?: number;
  playerPrestige?: number;
  rivals?: Array<{
    id: string;
    name?: string;
    cash?: number;
    strength?: number;
    prestige?: number;
    archetype?: string;
  }>;
}) {
  const playerPrestige = opts.playerPrestige ?? 50;
  const rivals: Record<string, ReturnType<typeof createMockRival>> = {};
  for (const r of opts.rivals ?? [
    { id: "r1", name: "Target Co", cash: 50_000_000, strength: 30, prestige: 30, archetype: "mid-tier" },
  ]) {
    rivals[r.id] = createMockRival({
      id: r.id,
      name: r.name ?? "Target Co",
      cash: r.cash ?? 50_000_000,
      strength: r.strength ?? 30,
      prestige: r.prestige ?? 30,
      archetype: (r.archetype ?? "mid-tier") as any,
    });
  }
  return createMockGameState({
    finance: { cash: opts.playerCash ?? 5_000_000_000, ledger: [], weeklyHistory: [] } as any,
    studio: {
      id: "PLR-1",
      name: "Player Studio",
      archetype: "major",
      prestige: playerPrestige,
      internal: { projectHistory: [], projects: {}, contracts: [] },
    } as any,
    entities: {
      projects: {},
      releasedProjectIds: [],
      talents: {},
      contracts: {},
      rivals,
      contractsByProjectId: {},
      contractsByTalentId: {},
    } as any,
  });
}

describe("evaluatePlayerAcquisition", () => {
  it("returns price, affordability and a deterministic combined-share preview", () => {
    const r = evaluatePlayerAcquisition(makeState({}), "r1");
    expect(r.targetName).toBe("Target Co");
    expect(r.price).toBeGreaterThan(0);
    expect(r.affordable).toBe(true);
    expect(typeof r.combinedShare).toBe("number");
    expect(r.combinedShare).toBeGreaterThanOrEqual(0);
  });

  it("flags unaffordable deals with a reason and blocks the action", () => {
    const r = evaluatePlayerAcquisition(makeState({ playerCash: 1 }), "r1");
    expect(r.affordable).toBe(false);
    expect(r.canProceed).toBe(false);
    expect(r.reason).toMatch(/fund/i);
  });

  it("is deterministic — same state gives the same preview twice", () => {
    const s = makeState({});
    expect(evaluatePlayerAcquisition(s, "r1")).toEqual(evaluatePlayerAcquisition(s, "r1"));
  });

  it("returns a not-found result for an unknown target", () => {
    const r = evaluatePlayerAcquisition(makeState({}), "nope");
    expect(r.canProceed).toBe(false);
    expect(r.reason).toMatch(/not found/i);
    expect(r.targetName).toBe("Unknown");
    expect(r.price).toBe(0);
  });

  it("price matches evaluateAcquisitionTarget", () => {
    const s = makeState({});
    const target = s.entities.rivals["r1"];
    const evalResult = evaluateAcquisitionTarget(target, s.finance.cash);
    const preview = evaluatePlayerAcquisition(s, "r1");
    expect(preview.price).toBe(evalResult.price);
  });

  it("playerCash field matches state.finance.cash", () => {
    const s = makeState({ playerCash: 42_000_000 });
    const preview = evaluatePlayerAcquisition(s, "r1");
    expect(preview.playerCash).toBe(42_000_000);
  });

  it("classifies as 'high' when combined share > 35%", () => {
    const s = makeState({
      rivals: [
        { id: "r1", prestige: 30, strength: 30, cash: 50_000_000, archetype: "mid-tier" },
        { id: "r2", prestige: 30, strength: 30, cash: 50_000_000, archetype: "mid-tier" },
      ],
    });
    const r = evaluatePlayerAcquisition(s, "r1");
    expect(r.regulatorRisk).toBe("high");
    expect(r.blockChance).toBe(0.9);
  });

  it("classifies as 'none' when combined share ≤ 25%", () => {
    const manyRivals = Array.from({ length: 10 }, (_, i) => ({
      id: `r${i}`,
      prestige: 10,
      strength: 10,
      cash: 10_000_000,
      archetype: "mid-tier",
    }));
    const s = makeState({ playerPrestige: 10, rivals: manyRivals });
    const r = evaluatePlayerAcquisition(s, "r0");
    expect(r.combinedShare).toBeLessThanOrEqual(25);
    expect(r.regulatorRisk).toBe("none");
    expect(r.blockChance).toBe(0);
  });

  it("classifies as 'review' when 25% < combined share ≤ 35%", () => {
    const rivals = Array.from({ length: 4 }, (_, i) => ({
      id: `r${i}`,
      prestige: 20,
      strength: 20,
      cash: 10_000_000,
      archetype: "mid-tier",
    }));
    const s = makeState({ playerPrestige: 25, rivals });
    const r = evaluatePlayerAcquisition(s, "r0");
    expect(r.combinedShare).toBeGreaterThan(25);
    expect(r.combinedShare).toBeLessThanOrEqual(35);
    expect(r.regulatorRisk).toBe("review");
    expect(r.blockChance).toBeCloseTo(0.4 + (r.combinedShare - 25) * 0.05, 5);
  });
});
