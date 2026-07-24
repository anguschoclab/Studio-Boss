import { describe, it, expect, vi, beforeEach } from "vitest";
import { cancelHighestOverheadDeal } from "@/engine/systems/deals/ShingleSystem";
import type { ShingleLogEntry } from "@/engine/systems/deals/ShingleSystem";
import type { GameState, StateImpact } from "@/engine/types";
import { defaultSimMemory } from "@/engine/core/simMemory";
import { createMockGameState, createMockRival } from "./generators/mockFactory";
import * as utils from "@/engine/utils";

function findShingleLogImpact(impacts: StateImpact[]): ShingleLogEntry[] | undefined {
  for (const imp of impacts) {
    if (imp.type === "INDUSTRY_UPDATE") {
      const payload = imp.payload as Record<string, unknown>;
      const update = payload?.update as Record<string, unknown> | undefined;
      if (update && "simMemory.eventLogs.shingle" in update) {
        return update["simMemory.eventLogs.shingle"] as ShingleLogEntry[];
      }
    }
  }
  return undefined;
}

describe("ShingleSystem simMemory log migration", () => {
  beforeEach(() => {
    vi.spyOn(utils, "secureRandom").mockReturnValue(0.5);
  });

  it("cancelHighestOverheadDeal writes to simMemory.eventLogs.shingle via INDUSTRY_UPDATE", () => {
    const rival = createMockRival({
      id: "rival-1",
      name: "Rival Studio",
      cash: 500_000_000,
    });

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

    const impacts = cancelHighestOverheadDeal(state, "rival-1");
    expect(impacts).not.toBeNull();
    const log = findShingleLogImpact(impacts!);

    expect(log).toBeDefined();
    expect(log!.length).toBe(1);
    expect(log![0].kind).toBe("cancelled");
    expect(log![0].shingleId).toBe("shingle-1");
    expect(log![0].studioId).toBe("rival-1");
  });

  it("preserves existing shingle log entries when adding new ones", () => {
    const rival = createMockRival({
      id: "rival-1",
      name: "Rival Studio",
      cash: 500_000_000,
    });

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

    const existingEntry: ShingleLogEntry = {
      week: 100,
      year: 1976,
      kind: "formed",
      shingleId: "old-shingle",
      shingleName: "Old Shingle",
      ownerName: "Old Owner",
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
          shingle: [existingEntry],
        },
      },
    });

    const impacts = cancelHighestOverheadDeal(state, "rival-1");
    expect(impacts).not.toBeNull();
    const log = findShingleLogImpact(impacts!);

    expect(log).toBeDefined();
    expect(log!.length).toBe(2);
    expect(log![0].shingleId).toBe("old-shingle");
    expect(log![1].shingleId).toBe("shingle-1");
  });
});
