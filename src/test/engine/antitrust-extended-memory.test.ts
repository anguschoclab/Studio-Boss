import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  tickAntitrust,
  isAcquirerBlockedByAntitrust,
} from "@/engine/systems/industry/Antitrust";
import type { AntitrustEvent } from "@/engine/systems/industry/Antitrust";
import type { GameState, StateImpact } from "@/engine/types";
import { defaultSimMemory } from "@/engine/core/simMemory";
import { createMockGameState, createMockRival } from "./generators/mockFactory";
import * as utils from "@/engine/utils";

function makeRivalDict(count: number, cash: number): Record<string, any> {
  const dict: Record<string, any> = {};
  for (let i = 0; i < count; i++) {
    dict[`rival-${i}`] = createMockRival({
      id: `rival-${i}`,
      name: `Rival ${i}`,
      cash,
      strength: 50,
    });
  }
  return dict;
}

function findSimMemoryImpact(impacts: StateImpact[], path: string): unknown | undefined {
  for (const imp of impacts) {
    if (imp.type === "INDUSTRY_UPDATE") {
      const payload = imp.payload as Record<string, unknown>;
      const update = payload?.update as Record<string, unknown> | undefined;
      if (update && path in update) return update[path];
    }
  }
  return undefined;
}

describe("Antitrust simMemory migration", () => {
  beforeEach(() => {
    vi.spyOn(utils, "secureRandom").mockReturnValue(0.001);
  });

  describe("isAcquirerBlockedByAntitrust", () => {
    it("returns true when acquirer is on block list and week < untilWeek", () => {
      const state = createMockGameState({
        week: 100,
        simMemory: {
          ...defaultSimMemory(),
          antitrustBlockList: [{ acquirerId: "rival-1", untilWeek: 200 }],
        },
      });
      expect(isAcquirerBlockedByAntitrust(state, "rival-1", 100)).toBe(true);
    });

    it("returns false when block has expired", () => {
      const state = createMockGameState({
        week: 250,
        simMemory: {
          ...defaultSimMemory(),
          antitrustBlockList: [{ acquirerId: "rival-1", untilWeek: 200 }],
        },
      });
      expect(isAcquirerBlockedByAntitrust(state, "rival-1", 250)).toBe(false);
    });

    it("returns false when acquirer not on list", () => {
      const state = createMockGameState({
        week: 100,
        simMemory: {
          ...defaultSimMemory(),
          antitrustBlockList: [{ acquirerId: "rival-1", untilWeek: 200 }],
        },
      });
      expect(isAcquirerBlockedByAntitrust(state, "rival-2", 100)).toBe(false);
    });
  });

  describe("tickAntitrust writes to simMemory", () => {
    it("writes simMemory.antitrustBlockList via INDUSTRY_UPDATE impact", () => {
      const rivals = makeRivalDict(6, 10_000_000);
      const dominantRival = createMockRival({
        id: "dominant-1",
        name: "Mega Corp",
        cash: 2_000_000_000,
        strength: 90,
      });
      rivals["dominant-1"] = dominantRival;

      const state = createMockGameState({
        week: 300,
        finance: { cash: 50_000_000, ledger: [], weeklyHistory: [] } as any,
        entities: { projects: {}, talents: {}, contracts: {}, rivals } as any,
      });

      const impacts = tickAntitrust(state);
      const blockList = findSimMemoryImpact(impacts, "simMemory.antitrustBlockList") as
        | { acquirerId: string; untilWeek: number }[]
        | undefined;

      expect(blockList).toBeDefined();
      expect(blockList!.length).toBeGreaterThan(0);
      expect(blockList!.some((b) => b.acquirerId === "dominant-1")).toBe(true);
      expect(blockList!.some((b) => b.untilWeek === 300 + 104)).toBe(true);
    });

    it("writes simMemory.eventLogs.antitrust via INDUSTRY_UPDATE impact", () => {
      const rivals = makeRivalDict(6, 10_000_000);
      const dominantRival = createMockRival({
        id: "dominant-1",
        name: "Mega Corp",
        cash: 2_000_000_000,
        strength: 90,
      });
      rivals["dominant-1"] = dominantRival;

      const state = createMockGameState({
        week: 300,
        finance: { cash: 50_000_000, ledger: [], weeklyHistory: [] } as any,
        entities: { projects: {}, talents: {}, contracts: {}, rivals } as any,
      });

      const impacts = tickAntitrust(state);
      const log = findSimMemoryImpact(impacts, "simMemory.eventLogs.antitrust") as
        | AntitrustEvent[]
        | undefined;

      expect(log).toBeDefined();
      expect(log!.length).toBe(1);
      expect(log![0].dominantId).toBe("dominant-1");
      expect(log![0].kind).toBe("divestiture");
    });

    it("preserves existing log entries when adding new ones", () => {
      const rivals = makeRivalDict(6, 10_000_000);
      const dominantRival = createMockRival({
        id: "dominant-1",
        name: "Mega Corp",
        cash: 2_000_000_000,
        strength: 90,
      });
      rivals["dominant-1"] = dominantRival;

      const existingEvent: AntitrustEvent = {
        week: 100,
        year: 1976,
        kind: "fine",
        dominantId: "old-rival",
        dominantName: "Old Rival",
        topShare: 0.45,
        top3Share: 0.75,
        note: "Previous fine",
      };

      const state = createMockGameState({
        week: 300,
        finance: { cash: 50_000_000, ledger: [], weeklyHistory: [] } as any,
        entities: { projects: {}, talents: {}, contracts: {}, rivals } as any,
        simMemory: {
          ...defaultSimMemory(),
          eventLogs: {
            ...defaultSimMemory().eventLogs,
            antitrust: [existingEvent],
          },
        },
      });

      const impacts = tickAntitrust(state);
      const log = findSimMemoryImpact(impacts, "simMemory.eventLogs.antitrust") as
        | AntitrustEvent[]
        | undefined;

      expect(log).toBeDefined();
      expect(log!.length).toBe(2);
      expect(log![0].dominantId).toBe("old-rival");
      expect(log![1].dominantId).toBe("dominant-1");
    });

    it("expires stale blocks from simMemory", () => {
      const rivals = makeRivalDict(6, 10_000_000);
      const dominantRival = createMockRival({
        id: "dominant-1",
        name: "Mega Corp",
        cash: 2_000_000_000,
        strength: 90,
      });
      rivals["dominant-1"] = dominantRival;

      const state = createMockGameState({
        week: 300,
        finance: { cash: 50_000_000, ledger: [], weeklyHistory: [] } as any,
        entities: { projects: {}, talents: {}, contracts: {}, rivals } as any,
        simMemory: {
          ...defaultSimMemory(),
          antitrustBlockList: [
            { acquirerId: "old-acquirer", untilWeek: 50 },
            { acquirerId: "dominant-1", untilWeek: 200 },
          ],
        },
      });

      const impacts = tickAntitrust(state);
      const blockList = findSimMemoryImpact(impacts, "simMemory.antitrustBlockList") as
        | { acquirerId: string; untilWeek: number }[]
        | undefined;

      expect(blockList).toBeDefined();
      // Old expired blocks should be gone, only the new block for dominant-1 should remain
      expect(blockList!.some((b) => b.acquirerId === "old-acquirer")).toBe(false);
      expect(blockList!.some((b) => b.acquirerId === "dominant-1" && b.untilWeek === 404)).toBe(true);
    });
  });
});
