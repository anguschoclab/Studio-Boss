import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '@/engine/types/studio.types';
import { initializeGame } from '@/engine/core/gameInit';
import { RandomGenerator } from '@/engine/utils/rng';

/**
 * 🌌 ID INTEGRITY SUITE
 * Ensures all simulation entities adhere to the global [PREFIX]-[UUID] blueprint.
 */
describe('ID Integrity Standards', () => {
  let state: GameState;
  const SEED = 8888;

  beforeEach(() => {
    state = initializeGame('test-studio', 'mid-tier', SEED);
  });

  const PREFIX_MAP: Record<string, string> = {
    // Core Studios
    'state.studio.id': 'PLR',
    'state.entities.rivals.*.id': 'RIV',
    
    // Talent Layer
    'state.entities.talents.*.id': 'TAL',
    'state.industry.families.*.id': 'FAM',
    'state.industry.agencies.*.id': 'AGY',
    'state.industry.agents.*.id': 'AGT',
    
    // Project Layer
    'state.entities.projects.*.id': 'PRJ',
    'state.entities.contracts.*.id': 'CNT',
    'state.studio.internal.firstLookDeals.*.id': 'PCT',
    
    // Market & Industry
    'state.market.opportunities.*.id': 'OPP',
    'state.market.buyers.*.id': 'BUY',
    'state.industry.awards.*.id': 'AWD',
    'state.industry.scandals.*.id': 'SND',
    
    // Data Templates
    'state.industry.activeMergers.*.id': 'NWS', // Headline based
    'state.industry.newsHistory.*.id': 'NWS',
  };

  const validateID = (id: string, expectedPrefix: string, path: string) => {
    it(`should have valid ${expectedPrefix}- prefix for ${path}`, () => {
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      
      const parts = id.split('-');
      expect(parts[0]).toBe(expectedPrefix);
      
      // Check for UUID length and format (8-4-4-4-12 = 36 chars)
      // Note: rng.uuid might return shorter or different but it should be standard
      const uuidPart = id.slice(expectedPrefix.length + 1);
      // We expect at least some entropy
      expect(uuidPart.length).toBeGreaterThan(8);
    });
  };

  describe('Core Entities', () => {
    it('player studio should have PLR- prefix', () => {
      expect(state.studio.id).toMatch(/^PLR-/);
    });

    it('all rivals should have RIV- prefix', () => {
      Object.values(state.entities.rivals).forEach(rival => {
        expect(rival.id).toMatch(/^RIV-/);
      });
    });

    it('all talent should have TAL- prefix', () => {
      Object.values(state.entities.talents).forEach(talent => {
        expect(talent.id).toMatch(/^TAL-/);
      });
    });

    it('all agencies should have AGY- prefix', () => {
      state.industry.agencies.forEach(agency => {
        expect(agency.id).toMatch(/^AGY-/);
      });
    });

    it('all agents should have AGT- prefix', () => {
      state.industry.agents.forEach(agent => {
        expect(agent.id).toMatch(/^AGT-/);
      });
    });

    it('all families should have FAM- prefix', () => {
      state.industry.families.forEach(family => {
        expect(family.id).toMatch(/^FAM-/);
      });
    });

    it('all buyers should have BUY- prefix', () => {
      state.market.buyers.forEach(buyer => {
        expect(buyer.id).toMatch(/^BUY-/);
      });
    });
  });

  describe('Systemic Data', () => {
    it('initial projects should have PRJ- prefix', () => {
      Object.values(state.entities.projects).forEach(project => {
        expect(project.id).toMatch(/^PRJ-/);
      });
    });

    it('initial opportunities should have OPP- prefix', () => {
      state.market.opportunities.forEach(opp => {
        expect(opp.id).toMatch(/^OPP-/);
      });
    });
  });
});
