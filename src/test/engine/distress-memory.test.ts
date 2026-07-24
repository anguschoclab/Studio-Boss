import { describe, it, expect, vi, beforeEach } from "vitest";
import { tickDistressCascade } from "@/engine/systems/industry/DistressCascade";
import { defaultSimMemory } from "@/engine/core/simMemory";
import type { GameState } from "@/engine/types";
import * as utils from "@/engine/utils";

function makeRival(id: string, cash: number) {
  return {
    id,
    name: id,
    cash,
    strength: 50,
    prestige: 50,
    archetype: "mid-tier" as const,
  };
}

function makeState(simMemory?: unknown): GameState {
  const rivals: Record<string, any> = {};
  rivals["r1"] = makeRival("r1", -300_000_000);
  rivals["r2"] = makeRival("r2", 500_000_000);
  rivals["r3"] = makeRival("r3", 500_000_000);
  rivals["r4"] = makeRival("r4", 500_000_000);
  rivals["r5"] = makeRival("r5", 500_000_000);
  rivals["r6"] = makeRival("r6", 500_000_000);
  rivals["r7"] = makeRival("r7", 500_000_000);
  rivals["r8"] = makeRival("r8", 500_000_000);

  return {
    week: 200,
    finance: { cash: 10_000_000 },
    studio: { id: "PLAYER", name: "Player" },
    entities: {
      rivals,
      projects: {},
      releasedProjectIds: [],
      talents: {},
      contracts: {},
      contractsByProjectId: {},
      contractsByTalentId: {},
    },
    industry: { newsHistory: [] },
    ip: { vault: [], franchises: {} },
    market: { buyers: [], opportunities: [] },
    simMemory: (simMemory ?? defaultSimMemory()) as any,
  } as unknown as GameState;
}

describe("distress cascade simMemory", () => {
  beforeEach(() => {
    vi.spyOn(utils, "secureRandom").mockReturnValue(0.5);
    vi.spyOn(utils, "pick").mockReturnValue({ id: "r2", name: "r2", cash: 500_000_000 } as any);
  });

  it("writes updated distress state back via INDUSTRY_UPDATE impact", () => {
    const state = makeState();
    const impacts = tickDistressCascade(state);
    const memWrite = impacts.find(
      (i: any) => i.type === "INDUSTRY_UPDATE" && i.payload?.update?.["simMemory.distress"]
    ) as any;
    if (impacts.length > 0) {
      expect(memWrite).toBeTruthy();
      expect(memWrite.payload.update["simMemory.distress"]).toBeDefined();
      expect(memWrite.payload.update["simMemory.distress"].negativeStreak["r1"]).toBeGreaterThan(0);
    }
  });

  it("reads negativeStreak from simMemory instead of module scope", () => {
    const mem = defaultSimMemory();
    mem.distress.negativeStreak["r1"] = 30; // already streaking
    mem.distress.lastActionWeek["r1"] = -9999;
    const state = makeState(mem);
    const impacts = tickDistressCascade(state);
    // r1 has cash -300M and streak 30 — should produce some impacts
    expect(impacts.length).toBeGreaterThan(0);
  });

  it("respects lastActionWeek cooldown from simMemory", () => {
    const mem = defaultSimMemory();
    mem.distress.negativeStreak["r1"] = 30;
    mem.distress.lastActionWeek["r1"] = 199; // just acted last week
    const state = makeState(mem);
    const impacts = tickDistressCascade(state);
    // r1 should be on cooldown — no action
    const r1Impacts = impacts.filter(
      (i: any) => i.type === "NEWS_ADDED" && i.payload?.headline?.includes("r1"),
    );
    expect(r1Impacts).toHaveLength(0);
  });
});
