import { describe, it, expect } from "vitest";
import { HeadlessController } from "@/engine/simulation/HeadlessController";
import { RandomGenerator } from "@/engine/utils/rng";
import { defaultSimMemory } from "@/engine/core/simMemory";
import type { GameState } from "@/engine/types";

function makeState(streaks?: Record<string, number>): GameState {
  return {
    week: 200,
    finance: { cash: 10_000_000 },
    studio: { id: "PLAYER", name: "Player" },
    entities: {
      rivals: {
        r1: { id: "r1", name: "Rival 1", cash: -600_000_000, prestige: 50, strength: 50, archetype: "mid-tier" },
        r2: { id: "r2", name: "Rival 2", cash: 50_000_000, prestige: 50, strength: 50, archetype: "mid-tier" },
      },
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
    simMemory: { ...defaultSimMemory(), headlessCashStreaks: streaks ?? {} },
  } as unknown as GameState;
}

describe("headless cash streaks in simMemory", () => {
  it("writes updated cash streaks via INDUSTRY_UPDATE impact", () => {
    const state = makeState();
    const rng = new RandomGenerator(42);
    const impacts = HeadlessController.tick(state, rng);
    const memWrite = impacts.find(
      (i: any) => i.type === "INDUSTRY_UPDATE" && i.payload?.update?.["simMemory.headlessCashStreaks"]
    ) as any;
    expect(memWrite).toBeTruthy();
    const streaks = memWrite.payload.update["simMemory.headlessCashStreaks"];
    expect(streaks["r1"]).toBe(1); // r1 has negative cash, streak increments
    expect(streaks["r2"]).toBe(0); // r2 has positive cash, streak resets
  });

  it("reads existing streaks from simMemory and accumulates", () => {
    const state = makeState({ r1: 51, r2: 0 });
    const rng = new RandomGenerator(42);
    const impacts = HeadlessController.tick(state, rng);
    const memWrite = impacts.find(
      (i: any) => i.type === "INDUSTRY_UPDATE" && i.payload?.update?.["simMemory.headlessCashStreaks"]
    ) as any;
    const streaks = memWrite.payload.update["simMemory.headlessCashStreaks"];
    // r1 had streak 51, now 52 — should trigger bankruptcy (>= BANKRUPTCY_WEEKS_REQUIRED)
    expect(streaks["r1"]).toBe(0); // reset after bankruptcy
    const bankruptcy = impacts.find(
      (i: any) => i.type === "RIVAL_UPDATED" && i.payload?.rivalId === "r1"
    );
    expect(bankruptcy).toBeDefined();
  });
});
