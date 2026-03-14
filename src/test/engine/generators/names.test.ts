import { describe, it, expect } from 'vitest';
import {
  generateStudioName,
  generateMotto,
  generateActorName,
  generateActressName,
  generateProjectName
} from '../../../engine/generators/names';

describe('Names Generator', () => {
  describe('generateStudioName', () => {
    it('returns a string', () => {
      const name = generateStudioName([]);
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    it('avoids existing names', () => {
      const existing = ['Apex Pictures'];
      const name = generateStudioName(existing);
      expect(typeof name).toBe('string');
    });
  });

  describe('generateMotto', () => {
    it('returns a string', () => {
      const motto = generateMotto();
      expect(typeof motto).toBe('string');
      expect(motto.length).toBeGreaterThan(0);
    });
  });

  describe('generateActorName', () => {
    it('returns a string with two words (first and last name)', () => {
      const name = generateActorName();
      expect(typeof name).toBe('string');
      expect(name.split(' ').length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('generateActressName', () => {
    it('returns a string with two words (first and last name)', () => {
      const name = generateActressName();
      expect(typeof name).toBe('string');
      expect(name.split(' ').length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('generateProjectName', () => {
    it('returns a string for tv projects', () => {
      const name = generateProjectName('tv', 'Action');
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    it('returns a string for film projects', () => {
      const name = generateProjectName('film', 'Comedy');
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    it('falls back to Drama genre if an unknown genre is passed', () => {
      const name = generateProjectName('film', 'UnknownGenreThatDoesNotExist');
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });
  });
});
