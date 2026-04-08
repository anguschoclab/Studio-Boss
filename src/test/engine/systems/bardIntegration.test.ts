import { describe, it, expect } from 'vitest';
import { BardResolver } from '../../../engine/systems/bardResolver';
import { NarrativeArchiveSchema } from '../../../engine/data/narrative/archive';
import archiveData from '../../../engine/data/narrative/archive.json';

describe('Bard Engine Integration', () => {
  
  describe('Archive Integrity', () => {
    it('should match the NarrativeArchiveSchema', () => {
      const result = NarrativeArchiveSchema.safeParse(archiveData);
      if (!result.success) {
        console.error('Archive Validation Errors:', result.error.format());
      }
      expect(result.success).toBe(true);
    });

    it('should have all mandatory top-level domains', () => {
      const domains = Object.keys(archiveData);
      expect(domains).toContain('Review');
      expect(domains).toContain('Greenlight');
      expect(domains).toContain('Crisis');
      expect(domains).toContain('Talent');
      expect(domains).toContain('Industry');
    });
  });

  describe('BardResolver.resolve', () => {
    it('should correctly resolve a simple Review template', () => {
      const resolved = BardResolver.resolve({
        domain: 'Review',
        subDomain: 'Standard',
        intensity: 90, // Should map to Acclaimed
        context: { project: 'Test Movie' }
      });
      
      expect(resolved).not.toContain('MISSING');
      expect(resolved).not.toContain('EMPTY');
      expect(resolved.length).toBeGreaterThan(5);
    });

    it('should correctly resolve a Specific Variant (e.g. Scandal)', () => {
      const resolved = BardResolver.resolve({
        domain: 'Industry',
        subDomain: 'Scandal',
        variant: 'rating_controversy',
        intensity: 50,
        context: { project: 'Test Movie' }
      });
      
      expect(resolved).toContain('controversy');
      expect(resolved).toContain('Test Movie');
    });

    it('should handle interpolation of nested context', () => {
      const resolved = BardResolver.resolve({
        domain: 'Crisis',
        subDomain: 'PR',
        intensity: 50,
        context: { project: 'Oceanic Focus', actor: 'Tom Cruise' }
      });
      
      // Since it's random, we check if at least it doesn't have the braces left
      expect(resolved).not.toContain('{{project}}');
      expect(resolved).not.toContain('{{actor}}');
    });

    it('should fallback gracefully to Standard if Tone is missing', () => {
      const resolved = BardResolver.resolve({
        domain: 'Review',
        subDomain: 'Standard',
        tone: 'Trade', // Assume Trade tone might be missing for some sub-domains
        intensity: 50,
        context: { project: 'Fallback Movie' }
      });
      
      expect(resolved).not.toContain('MISSING');
      expect(resolved).toContain('Fallback Movie');
    });

    it('should return a descriptive error string for an invalid domain', () => {
      const resolved = BardResolver.resolve({
        domain: 'NonExistent' as any,
        subDomain: 'Standard',
        intensity: 50,
        context: {}
      });
      
      expect(resolved).toContain('MISSING DOMAIN');
    });
  });

  describe('Intensity to Tier Mapping', () => {
    it('should map Review intensity correctly', () => {
      expect(BardResolver.getTier('Review', 90)).toBe('Acclaimed');
      expect(BardResolver.getTier('Review', 50)).toBe('Mixed');
      expect(BardResolver.getTier('Review', 10)).toBe('Panned');
    });

    it('should map Greenlight intensity correctly', () => {
      expect(BardResolver.getTier('Greenlight', 80)).toBe('Prestige');
      expect(BardResolver.getTier('Greenlight', 50)).toBe('Solid');
      expect(BardResolver.getTier('Greenlight', 20)).toBe('Risky');
    });

    it('should use default Common/Standard/Elite tiers for other domains', () => {
      expect(BardResolver.getTier('Crisis', 90)).toBe('Elite');
      expect(BardResolver.getTier('Crisis', 50)).toBe('Standard');
      expect(BardResolver.getTier('Crisis', 10)).toBe('Common');
    });
  });

});
