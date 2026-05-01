import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '@/engine/types/studio.types';
import { initializeGame } from '@/engine/core/gameInit';

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


  describe('Core Entities', () => {
    it('player studio should have PLR- prefix', () => {
      expect(state.studio.id).toMatch(/^PLR-/i);
    });

    it('all rivals should have RIV- prefix', () => {
      Object.values(state.entities.rivals).forEach(rival => {
        expect(rival.id).toMatch(/^RIV-/i);
      });
    });

    it('all talent should have TAL- prefix', () => {
      Object.values(state.entities.talents).forEach(talent => {
        expect(talent.id).toMatch(/^TAL-/i);
      });
    });

    it('all agencies should have AGY- prefix', () => {
      state.industry.agencies.forEach(agency => {
        expect(agency.id).toMatch(/^AGY-/i);
      });
    });

    it('all agents should have AGT- prefix', () => {
      state.industry.agents.forEach(agent => {
        expect(agent.id).toMatch(/^AGT-/i);
      });
    });

    it('all families should have FAM- prefix', () => {
      state.industry.families.forEach(family => {
        expect(family.id).toMatch(/^FAM-/i);
      });
    });

    it('all buyers should have BUY- prefix', () => {
      state.market.buyers.forEach(buyer => {
        expect(buyer.id).toMatch(/^BUY-/i);
      });
    });
  });

  describe('Systemic Data', () => {
    it('initial projects should have PRJ- prefix', () => {
      Object.values(state.entities.projects).forEach(project => {
        expect(project.id).toMatch(/^PRJ-/i);
      });
    });

    it('initial opportunities should have OPP- prefix', () => {
      state.market.opportunities.forEach(opp => {
        expect(opp.id).toMatch(/^OPP-/i);
      });
    });
  });
});
