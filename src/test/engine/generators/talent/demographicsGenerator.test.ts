import { describe, it, expect } from 'vitest';
import { generateDemographics } from '../../../../engine/generators/talent/demographicsGenerator';
import { RandomGenerator } from '../../../../engine/utils/rng';

describe('generateDemographics', () => {
  const rng = new RandomGenerator(777);

  it('generates local demographics favoring the provided localCountry', () => {
    let localCount = 0;
    const TOTAL_TESTS = 100;
    for(let i=0; i<TOTAL_TESTS; i++) {
      const demo = generateDemographics(rng, false, 'Japan'); // isGlobalSuperstar = false
      if (demo.country === 'Japan') localCount++;
    }
    // High bias (0.8) should lead to high counts
    expect(localCount).toBeGreaterThan(65); 
    expect(localCount).toBeLessThan(98);
  });

  it('generates global demographics for A-listers ignoring localCountry', () => {
    let localCount = 0;
    const TOTAL_TESTS = 100;
    for(let i=0; i<TOTAL_TESTS; i++) {
      const testRng = new RandomGenerator(i);
      const demo = generateDemographics(testRng, true, 'Japan'); // isGlobalSuperstar = true
      if (demo.country === 'Japan') localCount++;
    }
    // Should be globally distributed (~11%), definitely less than 35
    expect(localCount).toBeLessThan(35); 
  });

  it('provides a sensible ethnicity based on country', () => {
    const demoJapan = generateDemographics(rng, false, 'Japan');
    if (demoJapan.country === 'Japan') {
        expect(demoJapan.ethnicity).toBe('Asian');
    }

    const demoMexico = generateDemographics(rng, false, 'Mexico');
    if (demoMexico.country === 'Mexico') {
        expect(demoMexico.ethnicity).toBe('Hispanic');
    }
  });
});
