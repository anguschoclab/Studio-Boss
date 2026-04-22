import { describe, it, expect } from 'vitest';
import { psychologyGenerator } from '../../../../engine/generators/talent/psychologyGenerator';

describe('generatePsychology', () => {
  it('generates psychological profiles where A-listers have higher base ego', () => {
    const psychologyAList = psychologyGenerator('A-List');
    const psychologyCList = psychologyGenerator('C-List');

    // A-List ego base is 50, C-List is 10.
    // Expect A-List ego to generally be higher than C-List
    expect(psychologyAList.ego).toBeGreaterThanOrEqual(50);
    expect(psychologyCList.ego).toBeGreaterThanOrEqual(10);
  });

  it('generates attributes within 1-100 range', () => {
    for (let i = 0; i < 50; i++) {
        const psych = psychologyGenerator('B-List');
        expect(psych.ego).toBeGreaterThanOrEqual(1);
        expect(psych.ego).toBeLessThanOrEqual(100);
        expect(psych.mood).toBeGreaterThanOrEqual(1);
        expect(psych.mood).toBeLessThanOrEqual(100);
        expect(psych.scandalRisk).toBeGreaterThanOrEqual(0);
        expect(psych.scandalRisk).toBeLessThanOrEqual(100);
    }
  });

  it('initializes synergy lists as empty arrays', () => {
    const psych = psychologyGenerator('S-List');
    expect(Array.isArray(psych.synergyAffinities)).toBe(true);
    expect(Array.isArray(psych.synergyConflicts)).toBe(true);
    expect(psych.synergyAffinities.length).toBe(0);
    expect(psych.synergyConflicts.length).toBe(0);
  });
});
