import { describe, it, expect } from "vitest";
import { generateScandals } from "@/engine/systems/scandals/GeneratorModule";
import { RandomGenerator } from "@/engine/utils/rng";
import {
  createMockGameState,
  createMockTalent,
  createMockContract,
} from "../../generators/mockFactory";

function makeMockRng(nextValue: number = 0.001): RandomGenerator {
  return {
    next: () => nextValue,
    uuid: () => "mock-uuid",
    pick: (arr: any[]) => arr[0],
    rangeInt: (min: number, max: number) => Math.floor((min + max) / 2),
    getState: () => ({ seed: 12345 }),
  } as unknown as RandomGenerator;
}

describe("generateScandals", () => {
  it("returns impacts with empty arrays when no contracts or talents exist", () => {
    const state = createMockGameState();
    const rng = new RandomGenerator(12345);
    const impacts = generateScandals(state, rng);
    expect(impacts).toHaveLength(1);
    const impact = impacts[0] as any;
    expect(impact.newScandals).toEqual([]);
    expect(impact.newsEvents).toEqual([]);
  });

  it("generates a scandal when talent has high scandalRisk", () => {
    const talent = createMockTalent({
      id: "TAL-1",
      name: "Wild Star",
      psychology: {
        ego: 80,
        mood: 50,
        scandalRisk: 95,
        synergyAffinities: [],
        synergyConflicts: [],
      },
    });
    const state = createMockGameState({
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: { "TAL-1": talent },
        contracts: {},
        rivals: {},
      },
    });
    const rng = makeMockRng(0.001);
    const impacts = generateScandals(state, rng);
    const impact = impacts.find((i: any) => i.newScandals !== undefined) as any;
    expect(impact.newScandals.length).toBeGreaterThan(0);
    expect(impact.newScandals[0].talentId).toBe("TAL-1");
  });

  it("builds talentToProjectMap correctly and generates crisis for contracted talent", () => {
    const talent = createMockTalent({
      id: "TAL-1",
      name: "Troubled Star",
      psychology: {
        ego: 80,
        mood: 50,
        scandalRisk: 95,
        synergyAffinities: [],
        synergyConflicts: [],
      },
    });
    const contract = createMockContract({ id: "CON-1", talentId: "TAL-1", projectId: "PRJ-1" });
    const state = createMockGameState({
      entities: {
        projects: {
          "PRJ-1": { id: "PRJ-1", title: "Big Movie", genre: "Drama" } as any,
        },
        releasedProjectIds: [],
        talents: { "TAL-1": talent },
        contracts: { "CON-1": contract },
        contractsByProjectId: { "PRJ-1": ["CON-1"] },
        contractsByTalentId: { "TAL-1": ["CON-1"] },
        rivals: {},
      },
    });
    const rng = makeMockRng(0.001);
    const impacts = generateScandals(state, rng);
    const impact = impacts.find((i: any) => i.newScandals !== undefined) as any;
    expect(impact.newScandals.length).toBeGreaterThan(0);
    expect(impact.projectUpdates.length).toBeGreaterThan(0);
    expect(impact.projectUpdates[0].projectId).toBe("PRJ-1");
  });
});
