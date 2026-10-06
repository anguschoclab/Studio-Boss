import { describe, it, expect } from "vitest";
import { initializeGame } from "../../../engine/core/gameInit";
import { ALL_GENRES, initializeTrends } from "../../../engine/systems/trends";

describe("initializeGame — genrePopularity from trends", () => {
  it("populates genrePopularity for all 10 ALL_GENRES entries", () => {
    const state = initializeGame("Test Studio", "major", 42);
    for (const genre of ALL_GENRES) {
      const key = genre.toLowerCase();
      expect(state.culture.genrePopularity).toHaveProperty(key);
      expect(typeof state.culture.genrePopularity[key]).toBe("number");
    }
  });

  it("initializeTrends returns only 3 trends (so 7 genres use the fallback path)", () => {
    const trends = initializeTrends();
    expect(trends).toHaveLength(3);
  });

  it("genres with a matching trend get trend.heat / 100", () => {
    const state = initializeGame("Test Studio", "major", 42);
    // initializeTrends picks 3 genres with heat 80, 50, 20
    // initializeGame doesn't store trends in state.market, but genrePopularity
    // should contain exactly 3 entries matching heat/100 (0.8, 0.5, 0.2)
    const allValues = Object.values(state.culture.genrePopularity);
    const trendValues = allValues.filter((v) => v === 0.8 || v === 0.5 || v === 0.2);
    expect(trendValues).toHaveLength(3);
  });

  it("genres without a matching trend get the fallback range (0.2 to 0.5)", () => {
    const state = initializeGame("Test Studio", "major", 42);
    // initializeGame doesn't store trends in state.market, so we identify
    // trend genres by their exact heat/100 values (0.8, 0.5, 0.2)
    const trendValues = new Set([0.8, 0.5, 0.2]);

    for (const genre of ALL_GENRES) {
      const key = genre.toLowerCase();
      const val = state.culture.genrePopularity[key];
      if (!trendValues.has(val)) {
        // Fallback: 0.2 + rand() * 0.3 → range [0.2, 0.5)
        expect(val).toBeGreaterThanOrEqual(0.2);
        expect(val).toBeLessThan(0.5 + 0.001); // small epsilon for float
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const state1 = initializeGame("Test Studio", "major", 999);
    const state2 = initializeGame("Test Studio", "major", 999);
    expect(state1.culture.genrePopularity).toEqual(state2.culture.genrePopularity);
  });

  it("produces different results with different seeds", () => {
    const state1 = initializeGame("Test Studio", "major", 1);
    const state2 = initializeGame("Test Studio", "major", 2);
    // At least one genre popularity should differ
    const keys = Object.keys(state1.culture.genrePopularity);
    const anyDifferent = keys.some(
      (k) => state1.culture.genrePopularity[k] !== state2.culture.genrePopularity[k]
    );
    expect(anyDifferent).toBe(true);
  });
});
