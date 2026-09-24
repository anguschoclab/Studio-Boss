import {describe, it, expect} from "vitest";
import {initializeGame} from "@/engine/core/gameInit";
import {advanceWeek} from "@/engine/core/weekAdvance";
import {countKeys} from "@/engine/utils";

/**
 * 🌌 DETERMINISM TEST
 * Ensures simulation results are bit-identical when using the same seed.
 */
describe("Simulation Determinism", () => {
  const SEED = 8888;
  const STUDIO_NAME = "Deterministic Studios";
  const ARCHETYPE = "mid-tier";

  it("should generate bit-identical initial states", () => {
    const stateA = initializeGame(STUDIO_NAME, ARCHETYPE, SEED);
    const stateB = initializeGame(STUDIO_NAME, ARCHETYPE, SEED);

    // Initial states must be identical
    expect(stateA).toEqual(stateB);
  });

  it("should produce identical results after 10 weeks of simulation", { timeout: 240000 }, () => {
    let stateA = initializeGame(STUDIO_NAME, ARCHETYPE, SEED);
    let stateB = initializeGame(STUDIO_NAME, ARCHETYPE, SEED);

    for (let i = 0; i < 10; i++) {
      stateA = advanceWeek(stateA).newState;
      stateB = advanceWeek(stateB).newState;
    }

    // Compare core metrics
    expect(stateA.week).toBe(stateB.week);
    expect(stateA.finance.cash).toBe(stateB.finance.cash);
    expect(stateA.studio.prestige).toBe(stateB.studio.prestige);

    // Compare entity counts
    expect(countKeys(stateA.entities.talents)).toBe(countKeys(stateB.entities.talents));
    expect(countKeys(stateA.entities.projects)).toBe(countKeys(stateB.entities.projects));
    expect(countKeys(stateA.entities.rivals)).toBe(countKeys(stateB.entities.rivals));

    // Deep equality check for stable properties
    expect(stateA.finance).toEqual(stateB.finance);
    expect(stateA.studio).toEqual(stateB.studio);
  });
});
