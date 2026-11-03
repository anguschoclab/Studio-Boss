import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSettingsStore } from "@/store/settingsStore";
import { getDifficultyParams } from "@/store/settingsStore";
import type { PolicyKey } from "@/store/settingsStore";

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

  it("setPolicy flips only the targeted policy flag", () => {
    const keys: PolicyKey[] = [
      "allowVanityAttachments",
      "capOverheadDeals",
      "preferExternalWriters",
      "requireVeteranShowrunner",
      "autoFlagNepotism",
      "allowAuteurPackages",
      "prioritizeOrbitStaffing",
    ];

    for (const key of keys) {
      useSettingsStore.getState().setPolicy(key, true);
      const s = useSettingsStore.getState();
      expect(s[key]).toBe(true);
      for (const other of keys) {
        if (other !== key) expect(s[other]).toBe(false);
      }
      useSettingsStore.getState().setPolicy(key, false);
    }
  });

  it("setAutosaveFrequency updates the field", () => {
    useSettingsStore.getState().setAutosaveFrequency("off");
    expect(useSettingsStore.getState().autosaveFrequency).toBe("off");
  });

  it("rehydrates a partially persisted settings payload over defaults", async () => {
    localStorage.setItem(
      "studio-boss-settings",
      JSON.stringify({
        state: { difficulty: "cutthroat", reduceMotion: true },
        version: 0,
      })
    );

    await useSettingsStore.persist.rehydrate();

    const s = useSettingsStore.getState();
    expect(s.difficulty).toBe("cutthroat");
    expect(s.reduceMotion).toBe(true);
    // Fields absent from the persisted payload keep their defaults.
    expect(s.autosaveFrequency).toBe("weekly");
    expect(s.allowVanityAttachments).toBe(false);
  });

  it("keeps defaults when persisted settings are corrupt", async () => {
    localStorage.setItem("studio-boss-settings", "{not valid json");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await useSettingsStore.persist.rehydrate();
    consoleSpy.mockRestore();

    const s = useSettingsStore.getState();
    expect(s.difficulty).toBe("standard");
    expect(s.reduceMotion).toBe(false);
  });
});
