import { describe, it, expect } from 'vitest';
import { generateFamilies, generateTalentPool } from '@/engine/generators/talent';
import { RandomGenerator } from '../../../engine/utils/rng';

describe('talent generator', () => {
  const rng = new RandomGenerator(777);

  describe('generateFamilies', () => {
    it('generates the specified number of families', () => {
      const families = generateFamilies(rng, 3);
      expect(families).toHaveLength(3);
      expect(families[0].id).toBeDefined();
    });

    it('creates families with required attributes', () => {
      const families = generateFamilies(rng, 1);
      const fam = families[0];
      expect(fam.recognition).toBeGreaterThanOrEqual(0);
      expect(fam.recognition).toBeLessThanOrEqual(100);
      expect(fam.prestigeLegacy).toBeDefined();
    });
  });

  describe('generateTalentPool', () => {
    it('generates the specified number of talent profiles', () => {
      const pool = generateTalentPool(rng, 5);
      expect(pool).toHaveLength(5);
      expect(pool[0].roles).toBeDefined();
      expect(Array.isArray(pool[0].roles)).toBe(true);
    });

    it('assigns demographics and psychology to the profile', () => {
      const pool = generateTalentPool(rng, 1);
      const talent = pool[0];
      expect(talent.demographics).toBeDefined();
      expect(talent.demographics.age).toBeDefined();
      expect(talent.demographics.country).toBeDefined();
      expect(talent.psychology).toBeDefined();
      expect(talent.psychology.ego).toBeDefined();
    });
  });
});
