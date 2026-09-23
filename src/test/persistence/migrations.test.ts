import {describe, it, expect} from "vitest";
import {migrateSave} from "@/engine/migrations";
import {CURRENT_SAVE_VERSION} from "@/engine/core/simMemory";
import type {GameState} from "@/engine/types";

describe("migrateSave (zero-backward-compatibility)", () => {
  it("rejects saves older than the current version", () => {
    const oldSave = { week: 30, finance: { cash: 100 } } as unknown as GameState;
    expect(() => migrateSave(oldSave)).toThrow(/Unsupported save version/);
  });

  it("rejects versioned saves below CURRENT_SAVE_VERSION", () => {
    expect(() =>
      migrateSave({ week: 30, saveVersion: CURRENT_SAVE_VERSION - 1 } as unknown as GameState)
    ).toThrow(/Unsupported save version/);
  });

  it("rejects saves from the future", () => {
    expect(() =>
      migrateSave({ week: 30, saveVersion: CURRENT_SAVE_VERSION + 1 } as unknown as GameState)
    ).toThrow(/Unsupported save version/);
  });

  it("returns a current-version save unchanged (idempotent)", () => {
    const save = {
      week: 1,
      saveVersion: CURRENT_SAVE_VERSION,
      simMemory: { antitrust: { lastActionWeek: 7 } },
    } as unknown as GameState;
    expect(migrateSave(save)).toBe(save);
  });

  it("backfills simMemory on a current-version save missing it", () => {
    const save = { week: 5, saveVersion: CURRENT_SAVE_VERSION } as unknown as GameState;
    const normalized = migrateSave(save);
    expect(normalized.saveVersion).toBe(CURRENT_SAVE_VERSION);
    expect(normalized.simMemory?.antitrust.lastActionWeek).toBe(-9999);
    expect(normalized.simMemory?.headlessCashStreaks).toEqual({});
    expect(normalized.week).toBe(5);
  });
});
