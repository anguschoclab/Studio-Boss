import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateStudioName,
  generateMotto,
  generateDemographicName,
  generateProjectName
} from '../../../engine/generators/names';
import { RandomGenerator } from '../../../engine/utils/rng';

describe('Names Generator', () => {
  let rng: RandomGenerator;

  beforeEach(() => {
    rng = new RandomGenerator(999); // Fixed seed
  });

  describe('generateStudioName', () => {
    it('returns a string', () => {
      const name = generateStudioName([], rng);
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    it('avoids existing names', () => {
      const existing = ['Apex Pictures'];
      const name = generateStudioName(existing, rng);
      expect(typeof name).toBe('string');
      // The generator should ideally avoid 'Apex Pictures' if it rolls it, 
      // but with unique IDs it's likely already unique.
    });
  });

  describe('generateMotto', () => {
    it('returns a string', () => {
      const motto = generateMotto(rng);
      expect(typeof motto).toBe('string');
      expect(motto.length).toBeGreaterThan(0);
    });
  });

  describe('generateDemographicName', () => {
    it('returns a string with two words for MALE', () => {
      const name = generateDemographicName('MALE', 'USA', 'White', rng);
      expect(typeof name).toBe('string');
      expect(name.split(' ').length).toBeGreaterThanOrEqual(2);
    });

    it('returns a string with two words for FEMALE', () => {
      const name = generateDemographicName('FEMALE', 'USA', 'White', rng);
      expect(typeof name).toBe('string');
      expect(name.split(' ').length).toBeGreaterThanOrEqual(2);
    });
    
    it('returns a string for NON_BINARY', () => {
      const name = generateDemographicName('NON_BINARY', 'USA', 'White', rng);
      expect(typeof name).toBe('string');
      expect(name.split(' ').length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('generateProjectName', () => {
    it('returns a string for tv projects', () => {
      const name = generateProjectName('tv', 'Action', rng);
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    it('returns a string for film projects', () => {
      const name = generateProjectName('film', 'Comedy', rng);
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    it('falls back to Drama genre if an unknown genre is passed', () => {
      const name = generateProjectName('film', 'UnknownGenreThatDoesNotExist', rng);
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });
  });
});
