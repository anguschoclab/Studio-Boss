import { describe, it, expect, vi } from 'vitest';
import { generateFamilies, generateTalentPool } from '@/engine/generators/talent';
import { Agency, Agent, Family } from '@/engine/types';
import * as utils from '../../../engine/utils';

describe('talent generator', () => {
  describe('generateFamilies', () => {
    it('generates the specified number of families', () => {
      const families = generateFamilies(3);
      expect(families).toHaveLength(3);
      expect(families[0].id).toBeDefined();
    });

    it('creates families with required attributes', () => {
      const families = generateFamilies(1);
      const fam = families[0];
      expect(fam.recognition).toBeGreaterThanOrEqual(0);
      expect(fam.recognition).toBeLessThanOrEqual(100);
      expect(fam.prestigeLegacy).toBeDefined();
    });
  });

  describe('generateTalentPool', () => {
    it('generates the specified number of talent profiles', () => {
      const pool = generateTalentPool(5, [], [], []);
      expect(pool).toHaveLength(5);
      expect(pool[0].roles).toBeDefined();
      expect(Array.isArray(pool[0].roles)).toBe(true);
    });

    it('assigns demographics and psychology to the profile', () => {
      const pool = generateTalentPool(1, [], [], []);
      const talent = pool[0];
      expect(talent.demographics).toBeDefined();
      expect(talent.demographics.age).toBeDefined();
      expect(talent.demographics.country).toBeDefined();
      expect(talent.psychology).toBeDefined();
      expect(talent.psychology.ego).toBeDefined();
    });
  });
});
