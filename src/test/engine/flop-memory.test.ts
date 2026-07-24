import { describe, it, expect } from "vitest";
import {
  applyFlopPenalties,
  processFlops,
  FlopSeverity,
} from "@/engine/systems/finance/FlopMechanics";
import { defaultSimMemory } from "@/engine/core/simMemory";
import type { GameState, Project } from "@/engine/types";

function makeState(week = 10, flops?: Record<string, any>): GameState {
  return {
    week,
    finance: { cash: 10_000_000 },
    studio: { id: "PLAYER", name: "Player" },
    entities: {
      rivals: {
        r1: { id: "r1", name: "Rival 1", cash: 50_000_000, prestige: 50, strength: 50, archetype: "mid-tier" },
      },
      projects: {},
      releasedProjectIds: [],
      talents: {},
      contracts: {},
      contractsByProjectId: {},
      contractsByTalentId: {},
    },
    industry: { newsHistory: [] },
    simMemory: { ...defaultSimMemory(), flops: flops ?? {} },
  } as unknown as GameState;
}

function makeProject(ownerId: string, revenue: number, budget: number, week = 10): Project {
  return {
    id: `proj-${Math.random()}`,
    title: "Test",
    state: "released",
    releaseWeek: week,
    ownerId,
    revenue,
    budget,
  } as unknown as Project;
}

describe("flop memory in simMemory", () => {
  it("applyFlopPenalties writes flop history to simMemory via INDUSTRY_UPDATE", () => {
    const state = makeState();
    const impacts = applyFlopPenalties(state, makeProject("r1", 0, 1_000_000), "r1");
    const memWrite = impacts.find(
      (i: any) => i.type === "INDUSTRY_UPDATE" && i.payload?.update?.["simMemory.flops.r1"]
    ) as any;
    expect(memWrite).toBeTruthy();
    const history = memWrite.payload.update["simMemory.flops.r1"];
    expect(history.catastrophicFlops).toBe(1);
  });

  it("applyFlopPenalties accumulates flops from existing simMemory history", () => {
    const existingFlops = {
      r1: { rivalId: "r1", majorFlops: 2, catastrophicFlops: 0, flopWeeks: [8, 9] },
    };
    const state = makeState(10, existingFlops);
    const impacts = applyFlopPenalties(state, makeProject("r1", 250, 1000), "r1");
    const memWrite = impacts.find(
      (i: any) => i.type === "INDUSTRY_UPDATE" && i.payload?.update?.["simMemory.flops.r1"]
    ) as any;
    const history = memWrite.payload.update["simMemory.flops.r1"];
    expect(history.majorFlops).toBe(3);
    expect(history.flopWeeks).toContain(10);
  });

  it("triggers restructuring when 3 major flops in 1 year from simMemory", () => {
    const existingFlops = {
      r1: { rivalId: "r1", majorFlops: 2, catastrophicFlops: 0, flopWeeks: [8, 9] },
    };
    const state = makeState(10, existingFlops);
    const impacts = applyFlopPenalties(state, makeProject("r1", 250, 1000), "r1");
    const restructure = impacts.find(
      (i: any) => i.type === "RIVAL_UPDATED" && i.payload?.update?.strategy === "prestige_chaser"
    );
    expect(restructure).toBeDefined();
  });

  it("does not trigger restructuring with fewer than 3 major flops", () => {
    const existingFlops = {
      r1: { rivalId: "r1", majorFlops: 1, catastrophicFlops: 0, flopWeeks: [9] },
    };
    const state = makeState(10, existingFlops);
    const impacts = applyFlopPenalties(state, makeProject("r1", 250, 1000), "r1");
    const restructure = impacts.find(
      (i: any) => i.type === "RIVAL_UPDATED" && i.payload?.update?.strategy === "prestige_chaser"
    );
    expect(restructure).toBeUndefined();
  });
});
