import { describe, it, expect, vi, beforeEach } from "vitest";
import { tickConsolidation } from "@/engine/systems/industry/ConsolidationEngine";
import type { ConsolidationEvent } from "@/engine/systems/industry/ConsolidationEngine";
import { RegulatorSystem } from "@/engine/systems/industry/RegulatorSystem";
import type { GameState, StateImpact } from "@/engine/types";
import { defaultSimMemory } from "@/engine/core/simMemory";
import { createMockGameState, createMockRival } from "./generators/mockFactory";
import * as utils from "@/engine/utils";

function findConsolidationLogImpact(impacts: StateImpact[]): ConsolidationEvent[] | undefined {
  for (const imp of impacts) {
    if (imp.type === "INDUSTRY_UPDATE") {
      const payload = imp.payload as Record<string, unknown>;
      const update = payload?.update as Record<string, unknown> | undefined;
      if (update && "simMemory.eventLogs.consolidation" in update) {
        return update["simMemory.eventLogs.consolidation"] as ConsolidationEvent[];
      }
    }
  }
  return undefined;
}

describe("ConsolidationEngine simMemory log migration", () => {
  beforeEach(() => {
    vi.spyOn(utils, "secureRandom").mockReturnValue(0.3);
    vi.spyOn(utils, "rand").mockReturnValue(0);
    vi.spyOn(RegulatorSystem, "isBlocked").mockReturnValue({ blocked: false, sharePreview: 0 });
  });

  it("writes simMemory.eventLogs.consolidation via INDUSTRY_UPDATE impact on strategic M&A", () => {
    const acquirer = createMockRival({
      id: "major-1",
      name: "Mega Major",
      cash: 2_000_000_000,
      strength: 80,
      archetype: "major",
    });
    const target = createMockRival({
      id: "mid-1",
      name: "Mid Tier Studio",
      cash: 100_000_000,
      strength: 50,
      archetype: "mid-tier",
    });

    const state = createMockGameState({
      week: 300,
      entities: {
        projects: {},
        talents: {},
        contracts: {},
        rivals: { "major-1": acquirer, "mid-1": target },
        releasedProjectIds: [],
        contractsByProjectId: {},
        contractsByTalentId: {},
      } as any,
    });

    // secureRandom 0.5 → strategic M&A path (roll < 0.5)
    const impacts = tickConsolidation(state);
    const log = findConsolidationLogImpact(impacts);

    expect(log).toBeDefined();
    expect(log!.length).toBe(1);
    expect(log![0].acquirerId).toBe("major-1");
    expect(log![0].targetId).toBe("mid-1");
    expect(log![0].motive).toBe("strategic");
  });

  it("preserves existing log entries when adding new ones", () => {
    const acquirer = createMockRival({
      id: "major-1",
      name: "Mega Major",
      cash: 2_000_000_000,
      strength: 80,
      archetype: "major",
    });
    const target = createMockRival({
      id: "mid-1",
      name: "Mid Tier Studio",
      cash: 100_000_000,
      strength: 50,
      archetype: "mid-tier",
    });

    const existingEvent: ConsolidationEvent = {
      week: 100,
      year: 1976,
      motive: "platform",
      acquirerId: "old-major",
      acquirerName: "Old Major",
      targetId: "old-platform",
      targetName: "Old Platform",
      cost: 500_000_000,
    };

    const state = createMockGameState({
      week: 300,
      entities: {
        projects: {},
        talents: {},
        contracts: {},
        rivals: { "major-1": acquirer, "mid-1": target },
        releasedProjectIds: [],
        contractsByProjectId: {},
        contractsByTalentId: {},
      } as any,
      simMemory: {
        ...defaultSimMemory(),
        eventLogs: {
          ...defaultSimMemory().eventLogs,
          consolidation: [existingEvent],
        },
      },
    });

    const impacts = tickConsolidation(state);
    const log = findConsolidationLogImpact(impacts);

    expect(log).toBeDefined();
    expect(log!.length).toBe(2);
    expect(log![0].acquirerId).toBe("old-major");
    expect(log![1].acquirerId).toBe("major-1");
  });
});
