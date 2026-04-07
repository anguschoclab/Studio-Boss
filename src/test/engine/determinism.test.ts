import { describe, it, expect } from 'vitest';
import { initializeGame } from '@/engine/core/gameInit';
import { RandomGenerator } from '@/engine/utils/rng';
import { advanceWeek } from '@/engine/core/weekAdvance';

/**
 * 🌌 DETERMINISM TEST
 * Ensures simulation results are bit-identical when using the same seed.
 */
describe('Simulation Determinism', () => {
  const SEED = 8888;
  const STUDIO_NAME = 'Deterministic Studios';
  const ARCHETYPE = 'mid-tier';

  it('should generate bit-identical initial states', () => {
    const stateA = initializeGame(STUDIO_NAME, ARCHETYPE, SEED);
    const stateB = initializeGame(STUDIO_NAME, ARCHETYPE, SEED);

    // Filter out rngState if it fluctuates, but ideally it shouldn't
    expect(stateA).toEqual(stateB);
  });

  it('should produce identical results after 100 weeks of simulation', () => {
    const rngA = new RandomGenerator(SEED);
    const rngB = new RandomGenerator(SEED);
    let stateA = initializeGame(STUDIO_NAME, ARCHETYPE, SEED);
    let stateB = initializeGame(STUDIO_NAME, ARCHETYPE, SEED);

    for (let i = 0; i < 100; i++) {
        stateA = advanceWeek(stateA, rngA).newState;
        stateB = advanceWeek(stateB, rngB).newState;
    }

    expect(stateA).toEqual(stateB);
  });
});
