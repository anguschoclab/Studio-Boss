import { describe, it, expect } from 'vitest';
import { 
  haveCompeted, 
  areFriends, 
  areRivals, 
  areRomantic, 
  getTalentRelationships, 
  getCastingChemistry,
  tickRelationshipSystem 
} from '@/engine/systems/talent/RelationshipSystem';
import { RandomGenerator } from '@/engine/utils/rng';
import type { GameState } from '@/engine/types';

import { createMockGameState, createMockProject, createMockTalent, createMockContract } from '../../utils/mockFactories';

describe('RelationshipSystem - Award Nominee Tracking', () => {
  it('should return false when no awards exist', () => {
    const state = createTestGameState();
    expect(haveCompeted('talent-1', 'talent-2', state)).toBe(false);
  });

  it('should return false when awards exist but talents are not on the same project', () => {
    const state = createTestGameState({
      entities: {
        projects: {
          'project-1': createMockProject({
            id: 'project-1',
            attachedTalentIds: ['talent-1'],
          }),
          'project-2': createMockProject({
            id: 'project-2',
            attachedTalentIds: ['talent-2'],
          }),
        },
        contracts: {},
        talents: {},
        rivals: {},
      },
      industry: {
        awards: [
          {
            id: 'award-1',
            projectId: 'project-1',
            name: 'Best Picture',
            category: 'Film',
            body: 'Academy Awards',
            status: 'won',
            year: 2024,
          },
          {
            id: 'award-2',
            projectId: 'project-2',
            name: 'Best Director',
            category: 'Film',
            body: 'Academy Awards',
            status: 'nominated',
            year: 2024,
          },
        ],
        agencies: [],
        agents: [],
        families: [],
        festivalSubmissions: [],
        rumors: [],
        scandals: [],
        activeMergers: [],
        newsHistory: [],
      },
    });

    expect(haveCompeted('talent-1', 'talent-2', state)).toBe(false);
  });

  it('should return true when talents worked on the same award-winning project', () => {
    const state = createTestGameState({
      entities: {
        projects: {
          'project-1': {
            id: 'project-1',
            attachedTalentIds: ['talent-1', 'talent-2'],
          },
        },
        contracts: {},
        talents: {},
        rivals: {},
      },
      industry: {
        awards: [
          {
            id: 'award-1',
            projectId: 'project-1',
            name: 'Best Picture',
            category: 'Film',
            body: 'Academy Awards',
            status: 'won',
            year: 2024,
          },
        ],
        agencies: [],
        agents: [],
        families: [],
        festivalSubmissions: [],
        rumors: [],
        scandals: [],
        activeMergers: [],
        newsHistory: [],
      },
    });

    expect(haveCompeted('talent-1', 'talent-2', state)).toBe(true);
  });

  it('should return true when talents worked on the same nominated project', () => {
    const state = createMockGameState({
      entities: {
        projects: {
          'project-1': {
            id: 'project-1',
            attachedTalentIds: ['talent-1', 'talent-2'],
          },
        },
        contracts: {},
        talents: {},
        rivals: {},
      },
      industry: {
        awards: [
          {
            id: 'award-1',
            projectId: 'project-1',
            name: 'Best Picture',
            category: 'Film',
            body: 'Academy Awards',
            status: 'nominated',
            year: 2024,
          },
        ],
        agencies: [],
        agents: [],
        families: [],
        festivalSubmissions: [],
        rumors: [],
        scandals: [],
        activeMergers: [],
        newsHistory: [],
      },
    });

    expect(haveCompeted('talent-1', 'talent-2', state)).toBe(true);
  });
});

describe('RelationshipSystem - Query Functions', () => {
  it('should return true for friends with sufficient strength', () => {
    const state = createMockGameState({
      relationships: {
        relationships: {
          'talent-1-talent-2': {
            id: 'talent-1-talent-2',
            talentAId: 'talent-1',
            talentBId: 'talent-2',
            type: 'friend',
            strength: 70,
            isPublic: true,
            history: [],
            formedWeek: 1,
            lastUpdatedWeek: 1,
          },
        },
      },
    });

    expect(areFriends('talent-1', 'talent-2', state)).toBe(true);
  });

  it('should return false for friends with insufficient strength', () => {
    const state = createMockGameState({
      relationships: {
        relationships: {
          'talent-1-talent-2': {
            id: 'talent-1-talent-2',
            talentAId: 'talent-1',
            talentBId: 'talent-2',
            type: 'friend',
            strength: 30,
            isPublic: true,
            history: [],
            formedWeek: 1,
            lastUpdatedWeek: 1,
          },
        },
      },
    });

    expect(areFriends('talent-1', 'talent-2', state)).toBe(false);
  });

  it('should return false when no relationship exists', () => {
    const state = createMockGameState();
    expect(areFriends('talent-1', 'talent-2', state)).toBe(false);
  });

  it('should return true for rivals with sufficient negative strength', () => {
    const state = createMockGameState({
      relationships: {
        relationships: {
          'talent-1-talent-2': {
            id: 'talent-1-talent-2',
            talentAId: 'talent-1',
            talentBId: 'talent-2',
            type: 'rival',
            strength: -70,
            isPublic: true,
            history: [],
            formedWeek: 1,
            lastUpdatedWeek: 1,
          },
        },
      },
    });

    expect(areRivals('talent-1', 'talent-2', state)).toBe(true);
  });

  it('should return true for enemies with sufficient negative strength', () => {
    const state = createMockGameState({
      relationships: {
        relationships: {
          'talent-1-talent-2': {
            id: 'talent-1-talent-2',
            talentAId: 'talent-1',
            talentBId: 'talent-2',
            type: 'enemy',
            strength: -70,
            isPublic: true,
            history: [],
            formedWeek: 1,
            lastUpdatedWeek: 1,
          }
        },
      },
    });

    expect(areRivals('talent-1', 'talent-2', state)).toBe(true);
  });

  it('should return false for rivals with insufficient negative strength', () => {
    const state = createMockGameState({
      relationships: {
        relationships: {
          'talent-1-talent-2': {
            id: 'talent-1-talent-2',
            talentAId: 'talent-1',
            talentBId: 'talent-2',
            type: 'rival',
            strength: -20,
            isPublic: true,
            history: [],
            formedWeek: 1,
            lastUpdatedWeek: 1,
          }
        },
      },
    });

    expect(areRivals('talent-1', 'talent-2', state)).toBe(false);
  });

  it('should return true for romantic relationships with sufficient strength', () => {
    const state = createMockGameState({
      relationships: {
        relationships: {
          'talent-1-talent-2': {
            id: 'talent-1-talent-2',
            talentAId: 'talent-1',
            talentBId: 'talent-2',
            type: 'romantic',
            strength: 70,
            isPublic: true,
            history: [],
            formedWeek: 1,
            lastUpdatedWeek: 1,
          }
        },
      },
    });

    expect(areRomantic('talent-1', 'talent-2', state)).toBe(true);
  });

  it('should return false for romantic relationships with insufficient strength', () => {
    const state = createMockGameState({
      relationships: {
        relationships: {
          'talent-1-talent-2': {
            id: 'talent-1-talent-2',
            talentAId: 'talent-1',
            talentBId: 'talent-2',
            type: 'romantic',
            strength: 30,
            isPublic: true,
            history: [],
            formedWeek: 1,
            lastUpdatedWeek: 1,
          }
        },
      },
    });

    expect(areRomantic('talent-1', 'talent-2', state)).toBe(false);
  });

  it('should return all relationships for a talent', () => {
    const state = createMockGameState({
      relationships: {
        relationships: {
          'talent-1-talent-2': {
            id: 'talent-1-talent-2',
            talentAId: 'talent-1',
            talentBId: 'talent-2',
            type: 'friend',
            strength: 70,
            isPublic: true,
            history: [],
            formedWeek: 1,
            lastUpdatedWeek: 1,
          },
          'talent-1-talent-3': {
            id: 'talent-1-talent-3',
            talentAId: 'talent-1',
            talentBId: 'talent-3',
            type: 'rival',
            strength: -70,
            isPublic: true,
            history: [],
            formedWeek: 1,
            lastUpdatedWeek: 1,
          }
          'talent-2-talent-3': {
            id: 'talent-2-talent-3',
            talentAId: 'talent-2',
            talentBId: 'talent-3',
            type: 'romantic',
            strength: 70,
            isPublic: true,
            history: [],
            formedWeek: 1,
            lastUpdatedWeek: 1,
          }
        },
      },
    });

    const relationships = getTalentRelationships('talent-1', state);
    expect(relationships.length).toBe(2);
    expect(relationships.some(r => r.talentBId === 'talent-2')).toBe(true);
    expect(relationships.some(r => r.talentBId === 'talent-3')).toBe(true);
  });

  it('should return empty array for talent with no relationships', () => {
    const state = createMockGameState();
    const relationships = getTalentRelationships('talent-1', state);
    expect(relationships).toEqual([]);
  });

  it('should return positive chemistry for friends', () => {
    const state = createMockGameState({
      relationships: {
        relationships: {
          'talent-1-talent-2': {
            id: 'talent-1-talent-2',
            talentAId: 'talent-1',
            talentBId: 'talent-2',
            type: 'friend',
            strength: 70,
            isPublic: true,
            history: [],
            formedWeek: 1,
            lastUpdatedWeek: 1,
          }
        },
      },
    });

    const rng = new RandomGenerator(42);
    const chemistry = getCastingChemistry('talent-1', 'talent-2', state, rng);
    expect(chemistry).toBeGreaterThan(0);
  });

  it('should return negative chemistry for rivals', () => {
    const state = createMockGameState({
      relationships: {
        relationships: {
          'talent-1-talent-2': {
            id: 'talent-1-talent-2',
            talentAId: 'talent-1',
            talentBId: 'talent-2',
            type: 'rival',
            strength: -70,
            isPublic: true,
            history: [],
            formedWeek: 1,
            lastUpdatedWeek: 1,
          }
        },
      },
    });

    const rng = new RandomGenerator(42);
    const chemistry = getCastingChemistry('talent-1', 'talent-2', state, rng);
    expect(chemistry).toBeLessThan(0);
  });

  it('should return bonus chemistry for romantic relationships', () => {
    const state = createMockGameState({
      relationships: {
        relationships: {
          'talent-1-talent-2': {
            id: 'talent-1-talent-2',
            talentAId: 'talent-1',
            talentBId: 'talent-2',
            type: 'romantic',
            strength: 70,
            isPublic: true,
            history: [],
            formedWeek: 1,
            lastUpdatedWeek: 1,
          }
        },
      },
    });

    const rng = new RandomGenerator(42);
    const chemistry = getCastingChemistry('talent-1', 'talent-2', state, rng);
    expect(chemistry).toBeGreaterThan(5); // Romantic gets +5 bonus
  });

  it('should return zero chemistry when no relationship exists', () => {
    const state = createMockGameState();
    const rng = new RandomGenerator(42);
    const chemistry = getCastingChemistry('talent-1', 'talent-2', state, rng);
    expect(chemistry).toBe(0);
  });

  it('should return negative chemistry for ex-relationships', () => {
    const state = createMockGameState({
      relationships: {
        relationships: {
          'talent-1-talent-2': {
            id: 'talent-1-talent-2',
            talentAId: 'talent-1',
            talentBId: 'talent-2',
            type: 'ex',
            strength: -20,
            isPublic: true,
            history: [],
            formedWeek: 1,
            lastUpdatedWeek: 1,
          }
        },
      },
    });

    const rng = new RandomGenerator(42);
    const chemistry = getCastingChemistry('talent-1', 'talent-2', state, rng);
    expect(chemistry).toBe(-15); // Ex relationships get -15 penalty
  });
});

describe('RelationshipSystem - tickRelationshipSystem', () => {
  it('should return impacts for relationship formation', () => {
    const state = createMockGameState({
      entities: {
        talents: {
          'talent-1': createMockTalent({
            id: 'talent-1',
            name: 'Actor 1',
            prestige: 70,
            starMeter: 65,
          }),
          'talent-2': createMockTalent({
            id: 'talent-2',
            name: 'Actor 2',
            prestige: 65,
            starMeter: 60,
          }),
        },
        projects: {
          'project-1': createMockProject({
            id: 'project-1',
            attachedTalentIds: ['talent-1', 'talent-2'],
          }),
        },
        contracts: {
          'contract-1': createMockContract({ id: 'contract-1', projectId: 'project-1', talentId: 'talent-1' }),
          'contract-2': createMockContract({ id: 'contract-2', projectId: 'project-1', talentId: 'talent-2' }),
        },
        rivals: {},
      },
    });

    const rng = new RandomGenerator(42);
    const impacts = tickRelationshipSystem(state, rng);
    
    // Should return impacts (may or may not form relationships based on RNG)
    expect(Array.isArray(impacts)).toBe(true);
  });

  it('should handle state with no talents gracefully', () => {
    const state = createMockGameState({
      entities: {
        talents: {},
        projects: {},
        contracts: {},
        rivals: {},
      },
    });

    const rng = new RandomGenerator(42);
    const impacts = tickRelationshipSystem(state, rng);
    
    expect(Array.isArray(impacts)).toBe(true);
    expect(impacts.length).toBe(0);
  });

  it('should evolve existing relationships', () => {
    const state = createMockGameState({
      entities: {
        talents: {
          'talent-1': {
            id: 'talent-1',
            name: 'Actor 1',
            demographics: { age: 30, country: 'USA' },
            personality: 'collaborative',
            prestige: 70,
            draw: 60,
            starMeter: 65,
          }
          'talent-2': createMockTalent({
            id: 'talent-2',
            name: 'Actor 2',
            demographics: { age: 32, gender: 'MALE', ethnicity: 'Caucasian', country: 'USA' },
            prestige: 65,
            starMeter: 60,
          }),
        },
        projects: {},
        contracts: {},
        rivals: {},
      },
      relationships: {
        relationships: {
          'talent-1-talent-2': {
            id: 'talent-1-talent-2',
            talentAId: 'talent-1',
            talentBId: 'talent-2',
            type: 'friend',
            strength: 50,
            isPublic: true,
            history: [],
            formedWeek: 1,
            lastUpdatedWeek: 1,
          }
        },
      },
    });

    const rng = new RandomGenerator(42);
    const impacts = tickRelationshipSystem(state, rng);
    
    expect(Array.isArray(impacts)).toBe(true);
  });
});
