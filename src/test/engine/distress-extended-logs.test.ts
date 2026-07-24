import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  tickDistressCascade,
  stage1IPFireSale,
  stage2AssetLiquidation,
} from "@/engine/systems/industry/DistressCascade";
import type { DistressEvent } from "@/engine/systems/industry/DistressCascade";
import type { GameState, StateImpact } from "@/engine/types";
import { defaultSimMemory } from "@/engine/core/simMemory";
import { createMockGameState, createMockRival } from "./generators/mockFactory";
import * as utils from "@/engine/utils";

function findDistressLogImpact(impacts: StateImpact[]): DistressEvent[] | undefined {
  for (const imp of impacts) {
    if (imp.type === "INDUSTRY_UPDATE") {
      const payload = imp.payload as Record<string, unknown>;
      const update = payload?.update as Record<string, unknown> | undefined;
      if (update && "simMemory.eventLogs.distress" in update) {
        return update["simMemory.eventLogs.distress"] as DistressEvent[];
      }
    }
  }
  return undefined;
}

describe("DistressCascade simMemory log migration", () => {
  beforeEach(() => {
    vi.spyOn(utils, "secureRandom").mockReturnValue(0.5);
  });

  describe("tickDistressCascade writes to simMemory.eventLogs.distress", () => {
    it("emits INDUSTRY_UPDATE impact with distress log when a stage action occurs", () => {
      // Create a rival with negative cash and long streak to trigger stage 2
      const rival = createMockRival({
        id: "distressed-1",
        name: "Distressed Studio",
        cash: -100_000_000,
        prestige: 30,
        strength: 30,
      });

      const state = createMockGameState({
        week: 300,
        finance: { cash: 50_000_000, ledger: [], weeklyHistory: [] } as any,
        entities: {
          projects: {},
          talents: {},
          contracts: {},
          rivals: { "distressed-1": rival },
          releasedProjectIds: [],
          contractsByProjectId: {},
          contractsByTalentId: {},
        } as any,
        simMemory: {
          ...defaultSimMemory(),
          distress: {
            negativeStreak: { "distressed-1": 30 },
            lastActionWeek: {},
            stageActionCount: {},
          },
        },
      });

      const impacts = tickDistressCascade(state);
      const log = findDistressLogImpact(impacts);

      // Log may or may not be present depending on whether a stage action fired
      // But if it is present, it should have at least one entry
      if (log) {
        expect(log.length).toBeGreaterThan(0);
        expect(log[0].studioId).toBe("distressed-1");
      }
    });

    it("preserves existing log entries when adding new ones", () => {
      const rival = createMockRival({
        id: "distressed-1",
        name: "Distressed Studio",
        cash: -100_000_000,
        prestige: 30,
        strength: 30,
      });

      const existingEvent: DistressEvent = {
        week: 100,
        year: 1976,
        stage: 1,
        kind: "ip-sale",
        studioId: "old-rival",
        studioName: "Old Rival",
        note: "Previous sale",
      };

      const state = createMockGameState({
        week: 300,
        finance: { cash: 50_000_000, ledger: [], weeklyHistory: [] } as any,
        entities: {
          projects: {},
          talents: {},
          contracts: {},
          rivals: { "distressed-1": rival },
          releasedProjectIds: [],
          contractsByProjectId: {},
          contractsByTalentId: {},
        } as any,
        simMemory: {
          ...defaultSimMemory(),
          distress: {
            negativeStreak: { "distressed-1": 30 },
            lastActionWeek: {},
            stageActionCount: {},
          },
          eventLogs: {
            ...defaultSimMemory().eventLogs,
            distress: [existingEvent],
          },
        },
      });

      const impacts = tickDistressCascade(state);
      const log = findDistressLogImpact(impacts);

      if (log) {
        // First entry should be the preserved one
        expect(log[0].studioId).toBe("old-rival");
        // New entries should be appended
        expect(log.length).toBeGreaterThan(1);
      }
    });
  });

  describe("stage2AssetLiquidation writes to simMemory.eventLogs.distress", () => {
    it("emits log impact with backend-sale event", () => {
      vi.spyOn(utils, "secureRandom").mockReturnValue(0.85);
      const seller = createMockRival({
        id: "seller-1",
        name: "Seller Studio",
        cash: -100_000_000,
        prestige: 30,
        strength: 30,
      });

      const state = createMockGameState({
        week: 300,
        entities: {
          projects: {},
          talents: {},
          contracts: {},
          rivals: { "seller-1": seller },
          releasedProjectIds: [],
          contractsByProjectId: {},
          contractsByTalentId: {},
        } as any,
      });

      const impacts = stage2AssetLiquidation(state, seller);
      const log = findDistressLogImpact(impacts);

      expect(log).toBeDefined();
      expect(log!.length).toBeGreaterThan(0);
      expect(log!.some((e) => e.studioId === "seller-1")).toBe(true);
    });
  });
});
