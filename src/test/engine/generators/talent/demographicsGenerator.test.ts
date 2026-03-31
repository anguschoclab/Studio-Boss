import { describe, it, expect } from 'vitest';
import { generateDemographics } from '../../../../engine/generators/talent/demographicsGenerator';

describe('generateDemographics', () => {
  it('generates local demographics favoring the provided localCountry', () => {
    let localCount = 0;
    const TOTAL_TESTS = 100;
    for(let i=0; i<TOTAL_TESTS; i++) {
      const demo = generateDemographics(false, 'Japan'); // isGlobalSuperstar = false
      if (demo.country === 'Japan') localCount++;
    }
    // 80% target, giving some wiggle room (0.8 +- 0.15)
    expect(localCount).toBeGreaterThan(65); 
    expect(localCount).toBeLessThan(95);
  });

  it('generates global demographics for A-listers ignoring localCountry', () => {
    let localCount = 0;
    const TOTAL_TESTS = 100;
    for(let i=0; i<TOTAL_TESTS; i++) {
      const demo = generateDemographics(true, 'Japan'); // isGlobalSuperstar = true
      if (demo.country === 'Japan') localCount++;
    }
    // Should be globally distributed (1/9 chance ~ 11%, giving some room)
    expect(localCount).toBeLessThan(35); 
  });

  it('provides a sensible ethnicity based on country', () => {
    const demoJapan = generateDemographics(false, 'Japan');
    if (demoJapan.country === 'Japan') {
        expect(demoJapan.ethnicity).toBe('Asian');
    }

    const demoMexico = generateDemographics(false, 'Mexico');
    if (demoMexico.country === 'Mexico') {
        expect(demoMexico.ethnicity).toBe('Hispanic');
    }
  });
});
