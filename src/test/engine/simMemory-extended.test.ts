import { describe, it, expect } from "vitest";
import { defaultSimMemory, getSimMemory } from "@/engine/core/simMemory";
import type { GameState } from "@/engine/types";

describe("SimMemory extended defaults", () => {
  it("defaultSimMemory returns all new fields with correct empty defaults", () => {
    const mem = defaultSimMemory();

    // Event logs
    expect(mem.eventLogs).toBeDefined();
    expect(mem.eventLogs.antitrust).toEqual([]);
    expect(mem.eventLogs.distress).toEqual([]);
    expect(mem.eventLogs.consolidation).toEqual([]);
    expect(mem.eventLogs.shingle).toEqual([]);
    expect(mem.eventLogs.pitch).toEqual([]);

    // Functional state
    expect(mem.antitrustBlockList).toEqual([]);

    // Infrastructure
    expect(mem.headlineCounter).toBe(0);
    expect(mem.lastProcessedTickCount).toBe(-1);
  });

  it("getSimMemory falls back to defaults when simMemory is undefined", () => {
    const state = { simMemory: undefined } as unknown as GameState;
    const mem = getSimMemory(state);

    expect(mem.eventLogs).toBeDefined();
    expect(mem.eventLogs.antitrust).toEqual([]);
    expect(mem.antitrustBlockList).toEqual([]);
    expect(mem.headlineCounter).toBe(0);
    expect(mem.lastProcessedTickCount).toBe(-1);
  });

  it("getSimMemory preserves existing fields when simMemory is present", () => {
    const state = {
      simMemory: {
        ...defaultSimMemory(),
        antitrustBlockList: [{ acquirerId: "r1", untilWeek: 100 }],
        headlineCounter: 42,
        eventLogs: {
          ...defaultSimMemory().eventLogs,
          antitrust: [{ week: 10, year: 1975, kind: "fine", dominantId: "r1", dominantName: "Rival 1", topShare: 0.5, top3Share: 0.8, note: "test" }],
        },
      },
    } as unknown as GameState;

    const mem = getSimMemory(state);
    expect(mem.antitrustBlockList).toHaveLength(1);
    expect(mem.antitrustBlockList[0].acquirerId).toBe("r1");
    expect(mem.headlineCounter).toBe(42);
    expect(mem.eventLogs.antitrust).toHaveLength(1);
    expect(mem.eventLogs.antitrust[0].kind).toBe("fine");
  });
});
