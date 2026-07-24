import { describe, it, expect, vi, beforeEach } from "vitest";
import { tickShinglePitchRouter } from "@/engine/systems/deals/ShinglePitchRouter";
import type { ShinglePitchOutcome } from "@/engine/systems/deals/ShinglePitchRouter";
import type { GameState, StateImpact } from "@/engine/types";
import { defaultSimMemory } from "@/engine/core/simMemory";
import { createMockGameState, createMockRival } from "./generators/mockFactory";
import { RandomGenerator } from "@/engine/utils/rng";

function findPitchLogImpact(impacts: StateImpact[]): ShinglePitchOutcome[] | undefined {
  for (const imp of impacts) {
    if (imp.type === "INDUSTRY_UPDATE") {
      const payload = imp.payload as Record<string, unknown>;
      const update = payload?.update as Record<string, unknown> | undefined;
      if (update && "simMemory.eventLogs.pitch" in update) {
        return update["simMemory.eventLogs.pitch"] as ShinglePitchOutcome[];
      }
    }
  }
  return undefined;
}

describe("ShinglePitchRouter simMemory log migration", () => {
  let rng: RandomGenerator;

  beforeEach(() => {
    rng = new RandomGenerator(12345);
  });

  it("writes to simMemory.eventLogs.pitch via INDUSTRY_UPDATE impact", () => {
    const rival = createMockRival({
      id: "rival-1",
      name: "Rival Studio",
      cash: 500_000_000,
    });

    const talent = {
      id: "talent-1",
      name: "JJ Abrams",
      role: "producer",
      roles: ["producer"],
      tier: "A_LIST",
      prestige: 85,
      fee: 10_000_000,
      draw: 90,
    };

    const shingle = {
      id: "shingle-1",
      name: "Bad Robot",
      ownerTalentId: "talent-1",
      baseStudioId: "rival-1",
      dealType: "OVERALL" as const,
      overheadPerYear: 20_000_000,
      termWeeksRemaining: 52,
      exclusivity: true,
      foundedWeek: 100,
      pitchesGenerated: 0,
      pitchesAccepted: 0,
      medium: "FILM" as const,
      historyTrail: [],
    };

    const state = createMockGameState({
      week: 200,
      entities: {
        projects: {},
        talents: { "talent-1": talent as any },
        contracts: {},
        rivals: { "rival-1": rival },
        shingles: { "shingle-1": shingle as any },
        releasedProjectIds: [],
        contractsByProjectId: {},
        contractsByTalentId: {},
      } as any,
    });

    // Use a rigged RNG that always triggers a pitch (rng.next() < rate)
    const riggedRng = {
      next: () => 0.001,
      pick: <T>(arr: T[]): T => arr[0],
      range: (min: number, max: number) => min,
      rangeInt: (min: number, max: number) => min,
      uuid: (prefix: string) => `${prefix}-1`,
      getState: () => 0,
    } as unknown as RandomGenerator;

    const impacts = tickShinglePitchRouter(state, riggedRng);
    const log = findPitchLogImpact(impacts);

    expect(log).toBeDefined();
    expect(log!.length).toBe(1);
    expect(log![0].shingleId).toBe("shingle-1");
    expect(log![0].dealType).toBe("OVERALL");
  });

  it("preserves existing pitch log entries when adding new ones", () => {
    const rival = createMockRival({
      id: "rival-1",
      name: "Rival Studio",
      cash: 500_000_000,
    });

    const talent = {
      id: "talent-1",
      name: "JJ Abrams",
      role: "producer",
      roles: ["producer"],
      tier: "A_LIST",
      prestige: 85,
      fee: 10_000_000,
      draw: 90,
    };

    const shingle = {
      id: "shingle-1",
      name: "Bad Robot",
      ownerTalentId: "talent-1",
      baseStudioId: "rival-1",
      dealType: "OVERALL" as const,
      overheadPerYear: 20_000_000,
      termWeeksRemaining: 52,
      exclusivity: true,
      foundedWeek: 100,
      pitchesGenerated: 0,
      pitchesAccepted: 0,
      medium: "FILM" as const,
      historyTrail: [],
    };

    const existingEntry: ShinglePitchOutcome = {
      week: 100,
      year: 1976,
      shingleId: "old-shingle",
      shingleName: "Old Shingle",
      ownerName: "Old Owner",
      originalStudioId: null,
      originalStudioName: "open market",
      finalStudioId: null,
      finalStudioName: "open market",
      accepted: false,
      passed: true,
      dealType: "HOUSEKEEPING",
    };

    const state = createMockGameState({
      week: 200,
      entities: {
        projects: {},
        talents: { "talent-1": talent as any },
        contracts: {},
        rivals: { "rival-1": rival },
        shingles: { "shingle-1": shingle as any },
        releasedProjectIds: [],
        contractsByProjectId: {},
        contractsByTalentId: {},
      } as any,
      simMemory: {
        ...defaultSimMemory(),
        eventLogs: {
          ...defaultSimMemory().eventLogs,
          pitch: [existingEntry],
        },
      },
    });

    const riggedRng = {
      next: () => 0.001,
      pick: <T>(arr: T[]): T => arr[0],
      range: (min: number, max: number) => min,
      rangeInt: (min: number, max: number) => min,
      uuid: (prefix: string) => `${prefix}-1`,
      getState: () => 0,
    } as unknown as RandomGenerator;

    const impacts = tickShinglePitchRouter(state, riggedRng);
    const log = findPitchLogImpact(impacts);

    expect(log).toBeDefined();
    expect(log!.length).toBe(2);
    expect(log![0].shingleId).toBe("old-shingle");
    expect(log![1].shingleId).toBe("shingle-1");
  });
});
