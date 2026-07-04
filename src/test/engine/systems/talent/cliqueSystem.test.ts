import { describe, it, expect } from 'vitest';
import { tickCliqueSystem, getCliqueFameBonus } from '@/engine/systems/talent/CliqueSystem';
import { RandomGenerator } from '@/engine/utils/rng';
import { createMockGameState, createMockTalent } from '../../generators/mockFactory';
import { Clique } from '@/engine/types/clique.types';

function makeClique(overrides: Partial<Clique> = {}): Clique {
  return {
    id: 'CLQ-1',
    name: 'The Brat Pack',
    members: ['TAL-1', 'TAL-2', 'TAL-3'],
    formedWeek: 1,
    status: 'active',
    fameBonus: 24,
    reputation: 'cool',
    exclusivity: 50,
    combinedStarPower: 150,
    reunionPotential: 50,
    internalConflicts: [],
    ...overrides,
  };
}

function makeMockRng(nextValue: number = 0.1): RandomGenerator {
  return {
    next: () => nextValue,
    uuid: () => 'mock-uuid',
    pick: (arr: any[]) => arr[0],
    rangeInt: (min: number, max: number) => Math.floor((min + max) / 2),
    getState: () => ({ seed: 12345 }),
  } as unknown as RandomGenerator;
}

describe('CliqueSystem', () => {
  describe('tickCliqueSystem', () => {
    it('returns empty impacts when no talents or cliques exist', () => {
      const state = createMockGameState();
      const rng = new RandomGenerator(12345);
      const impacts = tickCliqueSystem(state, rng);
      expect(impacts).toHaveLength(0);
    });

    it('evolves existing cliques and produces CLIQUE_UPDATED impacts', () => {
      const clique = makeClique({ id: 'CLQ-1', members: ['TAL-1', 'TAL-2', 'TAL-3'] });
      const state = createMockGameState({
        entities: {
          projects: {},
          releasedProjectIds: [],
          talents: {
            'TAL-1': createMockTalent({ id: 'TAL-1' }),
            'TAL-2': createMockTalent({ id: 'TAL-2' }),
            'TAL-3': createMockTalent({ id: 'TAL-3' }),
          },
          contracts: {},
          rivals: {},
        },
        relationships: {
          cliques: { cliques: { 'CLQ-1': clique } },
        } as any,
      });
      const rng = makeMockRng(0.1);
      const impacts = tickCliqueSystem(state, rng);
      const cliqueUpdated = impacts.find((i: any) => i.type === 'CLIQUE_UPDATED');
      expect(cliqueUpdated).toBeDefined();
    });
  });

  describe('getCliqueFameBonus', () => {
    it('returns 0 when talent is in no clique', () => {
      const state = createMockGameState({
        relationships: { cliques: { cliques: {} } } as any,
      });
      expect(getCliqueFameBonus('TAL-1', state)).toBe(0);
    });

    it('returns highest fameBonus across multiple active cliques', () => {
      const c1 = makeClique({ id: 'CLQ-1', members: ['TAL-1'], fameBonus: 16, status: 'active' });
      const c2 = makeClique({ id: 'CLQ-2', members: ['TAL-1'], fameBonus: 32, status: 'active' });
      const state = createMockGameState({
        relationships: {
          cliques: { cliques: { 'CLQ-1': c1, 'CLQ-2': c2 } },
        } as any,
      });
      expect(getCliqueFameBonus('TAL-1', state)).toBe(32);
    });

    it('ignores disbanded cliques', () => {
      const c1 = makeClique({ id: 'CLQ-1', members: ['TAL-1'], fameBonus: 40, status: 'disbanded' });
      const state = createMockGameState({
        relationships: {
          cliques: { cliques: { 'CLQ-1': c1 } },
        } as any,
      });
      expect(getCliqueFameBonus('TAL-1', state)).toBe(0);
    });
  });
});
