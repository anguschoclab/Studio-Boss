import { describe, it, expect } from "vitest";
import { advanceWeek } from "../../../engine/core/weekAdvance";
import { initializeGame } from "../../../engine/core/gameInit";


describe("advanceWeek", () => {
  it("advances the game by one week and generates a summary", () => {
    const initialState = initializeGame("Test Studio", "indie");
    // Mock contracts, talentPool, awards arrays which might be missing in initializeGame initially
    initialState.contracts = [];
    initialState.talentPool = [];
    initialState.awards = [];

    const { newState, summary } = advanceWeek(initialState);

    expect(newState.week).toBe(2);
    expect(summary.fromWeek).toBe(1);
    expect(summary.toWeek).toBe(2);

    // Initial costs should be 0 because there are no projects
    expect(summary.totalCosts).toBe(0);
    expect(summary.totalRevenue).toBe(0);
    expect(newState.cash).toBe(initialState.cash);
  });
});
