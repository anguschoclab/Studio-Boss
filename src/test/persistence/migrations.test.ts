import { describe, it, expect } from "vitest";
import { migrateSave } from "@/engine/migrations";
import { CURRENT_SAVE_VERSION } from "@/engine/core/simMemory";
import type { GameState } from "@/engine/types";

describe("migrateSave", () => {
  it("upgrades a v1 save (no saveVersion, no simMemory) to current", () => {
    const oldSave = { week: 30, finance: { cash: 100 } } as unknown as GameState;
    const migrated = migrateSave(oldSave);
    expect(migrated.saveVersion).toBe(CURRENT_SAVE_VERSION);
    expect(migrated.simMemory?.antitrust.lastActionWeek).toBe(-9999);
    expect(migrated.simMemory?.headlessCashStreaks).toEqual({});
    expect(migrated.week).toBe(30);
  });

  it("leaves a current-version save unchanged (idempotent)", () => {
    const fresh = migrateSave({ week: 1 } as unknown as GameState);
    const again = migrateSave(fresh);
    expect(again).toEqual(fresh);
  });

  it("preserves existing simMemory if a save already has one", () => {
    const save = {
      week: 5,
      saveVersion: 1,
      simMemory: {
        antitrust: { lastActionWeek: 7 },
        distress: { negativeStreak: {}, lastActionWeek: {}, stageActionCount: {} },
        flops: {},
        headlessCashStreaks: {},
      },
    } as unknown as GameState;
    expect(migrateSave(save).simMemory?.antitrust.lastActionWeek).toBe(7);
  });
});
