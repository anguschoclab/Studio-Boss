import { describe, it, expect } from "vitest";
import { defaultSimMemory, getSimMemory, CURRENT_SAVE_VERSION } from "@/engine/core/simMemory";
import type { GameState } from "@/engine/types";

describe("simMemory", () => {
  it("defaultSimMemory returns a complete, empty memory", () => {
    const m = defaultSimMemory();
    expect(m.antitrust.lastActionWeek).toBe(-9999);
    expect(m.distress.negativeStreak).toEqual({});
    expect(m.distress.lastActionWeek).toEqual({});
    expect(m.distress.stageActionCount).toEqual({});
    expect(m.flops).toEqual({});
    expect(m.headlessCashStreaks).toEqual({});
  });

  it("getSimMemory falls back to defaults when state has none (old save)", () => {
    const state = {} as GameState;
    expect(getSimMemory(state).antitrust.lastActionWeek).toBe(-9999);
  });

  it("getSimMemory returns the state-carried memory when present", () => {
    const state = {
      simMemory: { ...defaultSimMemory(), antitrust: { lastActionWeek: 42 } },
    } as unknown as GameState;
    expect(getSimMemory(state).antitrust.lastActionWeek).toBe(42);
  });

  it("exposes a numeric save version >= 2", () => {
    expect(CURRENT_SAVE_VERSION).toBeGreaterThanOrEqual(2);
  });
});
