import { describe, it, expect } from 'vitest';
import { initializeGame } from '@/engine/core/gameInit';
import { WeekCoordinator } from '@/engine/services/WeekCoordinator';
import { RandomGenerator } from '@/engine/utils/rng';

describe('Studio Boss - 100 Week Determinism Certification', () => {
  it('should produce identical results over 100 weeks when given the same seed', { timeout: 30000 }, () => {
    const SEED = 42;
    const STUDIO_NAME = 'Test Studio';
    const ARCHETYPE = 'major';

    // 1. Initialize two identical states
    const stateA = initializeGame(STUDIO_NAME, ARCHETYPE, SEED);
    const stateB = initializeGame(STUDIO_NAME, ARCHETYPE, SEED);

    // Initial check: sanity check that initialization is deterministic
    expect(stateA.gameSeed).toBe(stateB.gameSeed);
    expect(stateA.finance.cash).toBe(stateB.finance.cash);
    expect(Object.keys(stateA.industry.talentPool).length).toBe(Object.keys(stateB.industry.talentPool).length);
    
    let currentStateA = stateA;
    let currentStateB = stateB;

    // 2. Run 100 weeks on both
    for (let i = 0; i < 100; i++) {
      const rngA = new RandomGenerator(currentStateA.gameSeed + currentStateA.week);
      const rngB = new RandomGenerator(currentStateB.gameSeed + currentStateB.week);

      const resultA = WeekCoordinator.execute(currentStateA, rngA);
      const resultB = WeekCoordinator.execute(currentStateB, rngB);

      currentStateA = resultA.newState;
      currentStateB = resultB.newState;

      // Check current week state consistency
      try {
        expect(currentStateA.week).toBe(currentStateB.week);
        expect(currentStateA.finance.cash).toBe(currentStateB.finance.cash);
        expect(currentStateA.studio.prestige).toBe(currentStateB.studio.prestige);
        
        // Deep consistency check on rivals
        stateA.industry.rivals.forEach((_rival, idx) => {
          const rA = currentStateA.industry.rivals[idx];
          const rB = currentStateB.industry.rivals[idx];
          if (rA && rB) {
            expect(rA.cash).toBe(rB.cash);
            expect(rA.strength).toBe(rB.strength);
          }
        });
      } catch (error) {
        console.error(`Determinism drift detected at week ${currentStateA.week}`);
        throw error;
      }
    }

    // 3. Final Deep Comparison
    expect(currentStateA.finance.cash).toBe(currentStateB.finance.cash);
    expect(currentStateA.week).toBe(101);
    
    // Check that talent pool remains stable and identical
    const talentPoolA = currentStateA.industry.talentPool;
    const talentPoolB = currentStateB.industry.talentPool;
    
    Object.keys(talentPoolA).forEach(id => {
      expect(talentPoolA[id].prestige).toBe(talentPoolB[id].prestige);
      expect(talentPoolA[id].draw).toBe(talentPoolB[id].draw);
    });

    console.log('✅ 100-week Determinism Certification PASSED.');
  });
});
