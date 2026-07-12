import { describe, it, expect, beforeEach } from "vitest";
import { useSettingsStore } from "@/store/settingsStore";
import { getDifficultyParams } from "@/store/settingsStore";

describe("settingsStore", () => {
  beforeEach(() => {
    // Reset to defaults between tests (no persistence in test env).
    useSettingsStore.setState(useSettingsStore.getInitialState());
    localStorage.clear();
  });

  it("applies sensible defaults", () => {
    const s = useSettingsStore.getState();
    expect(s.reduceMotion).toBe(false);
    expect(s.autosaveFrequency).toBe("weekly");
    expect(s.difficulty).toBe("standard");
    expect(s.allowVanityAttachments).toBe(false);
    expect(s.requireVeteranShowrunner).toBe(false);
  });

  it("toggling reduceMotion updates the store", () => {
    useSettingsStore.getState().setReduceMotion(true);
    expect(useSettingsStore.getState().reduceMotion).toBe(true);
  });

  it("toggling difficulty updates the store", () => {
    useSettingsStore.getState().setDifficulty("cutthroat");
    expect(useSettingsStore.getState().difficulty).toBe("cutthroat");
  });

  it("difficulty maps to distinct macro params", () => {
    const relaxed = getDifficultyParams("relaxed");
    const cutthroat = getDifficultyParams("cutthroat");
    expect(cutthroat.heatMultiplier).not.toBe(relaxed.heatMultiplier);
    expect(cutthroat.inflationBias).toBeGreaterThan(relaxed.inflationBias);
  });
});
