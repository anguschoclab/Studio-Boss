import { describe, it, expect } from 'vitest';
import { GameState, ProjectUpdateImpact } from '@/engine/types';
import { tickProduction } from '@/engine/systems/productionEngine';
import { RandomGenerator } from '@/engine/utils/rng';

describe('Production Engine (Target A2) - Symmetry', () => {
  const rng = new RandomGenerator(555);
  const mockState = {
    week: 1,
    studio: {
      name: 'Player Studio',
      internal: {
        projects: {
          'player-p1': { 
            id: 'player-p1', 
            type: 'FILM', 
            state: 'production', 
            weeksInPhase: 5, 
            productionWeeks: 20,
            progress: 25,
            scriptHeat: 50,
            activeRoles: [],
            scriptEvents: []
          }
        },
        contracts: []
      }
    },
    industry: {
      rivals: [
        {
          id: 'rival-s1',
          name: 'Rival Studio',
          projects: {
            'rival-p1': { 
              id: 'rival-p1', 
              type: 'FILM', 
              state: 'production', 
              weeksInPhase: 5, 
              productionWeeks: 20,
              progress: 25,
              scriptHeat: 50,
              activeRoles: [],
              scriptEvents: []
            }
          }
        }
      ],
      talentPool: {}
    }
  } as unknown as GameState;

  it('should return PROJECT_UPDATED impacts for Player and Rival', () => {
    const impacts = tickProduction(mockState, rng);
    
    const playerImpact = impacts.find(i => i.type === 'PROJECT_UPDATED' && i.payload.projectId === 'player-p1') as ProjectUpdateImpact | undefined;
    const rivalImpact = impacts.find(i => i.type === 'PROJECT_UPDATED' && i.payload.projectId === 'rival-p1') as ProjectUpdateImpact | undefined;
    
    expect(playerImpact).toBeDefined();
    expect(rivalImpact).toBeDefined();
    
    // Assert weeksInPhase increment
    expect(playerImpact?.payload.update.weeksInPhase).toBe(6);
    expect(rivalImpact?.payload.update.weeksInPhase).toBe(6);
  });
});

describe('Production Engine (Target A2) - Edge Cases', () => {
  const rng = new RandomGenerator(555);

  it('should handle empty projects pipeline safely', () => {
    const emptyState = {
      week: 1,
      studio: { internal: { projects: {}, contracts: [] } },
      industry: { rivals: [], talentPool: {} }
    } as unknown as GameState;
    const impacts = tickProduction(emptyState, rng);
    expect(impacts).toHaveLength(0);
  });

  it('should process projects with 0 targetWeeks without Infinity progress', () => {
     const state = {
        studio: {
            internal: {
                projects: {
                    'p1': {
                        id: 'p1',
                        title: 'Test',
                        type: 'FILM',
                        format: 'film',
                        genre: 'drama',
                        budgetTier: 'low',
                        budget: 1000000,
                        weeklyCost: 100000,
                        targetAudience: 'General',
                        flavor: 'test',
                        state: 'production',
                        buzz: 50,
                        weeksInPhase: 0,
                        developmentWeeks: 10,
                        productionWeeks: 0,
                        revenue: 0,
                        weeklyRevenue: 0,
                        releaseWeek: null,
                        accumulatedCost: 0,
                        momentum: 50,
                        progress: 0,
                        activeCrisis: null,
                        contentFlags: []
                    } as import('@/engine/types').Project
                },
                contracts: []
            }
        },
        industry: { rivals: [], talentPool: {} }
     } as unknown as GameState;
     const impacts = tickProduction(state, rng);
     const projectImpact = impacts.find(i => (i as ProjectUpdateImpact).payload.projectId === 'p1') as ProjectUpdateImpact;
     expect(projectImpact.payload.update.progress).toBeDefined();
     expect(projectImpact.payload.update.progress).toBeGreaterThan(0);
     expect(projectImpact.payload.update.progress).toBeLessThanOrEqual(100);
  });

  it('should apply maximum morale multiplier if talents are fully motivated', () => {
      const state = {
          studio: {
              internal: {
                  projects: {
                      'p1': {
                          id: 'p1',
                          title: 'Test',
                          type: 'FILM',
                          format: 'film',
                          genre: 'drama',
                          budgetTier: 'low',
                          budget: 1000000,
                          weeklyCost: 100000,
                          targetAudience: 'General',
                          flavor: 'test',
                          state: 'production',
                          buzz: 50,
                          weeksInPhase: 0,
                          developmentWeeks: 10,
                          productionWeeks: 10,
                          revenue: 0,
                          weeklyRevenue: 0,
                          releaseWeek: null,
                          accumulatedCost: 0,
                          momentum: 50,
                          progress: 0,
                          activeCrisis: null,
                          contentFlags: []
                      } as import('@/engine/types').Project
                  },
                  contracts: [{ id: 'c1', projectId: 'p1', talentId: 't1', fee: 10000, backendPercent: 0 } as import('@/engine/types').Contract]
              }
          },
          industry: {
              rivals: [],
              talentPool: {
                  't1': {
                      id: 't1',
                      name: 'Test Talent',
                      role: 'actor',
                      roles: ['actor'],
                      tier: 'A_LIST',
                      prestige: 50,
                      fee: 1000000,
                      draw: 50,
                      accessLevel: 'outsider',
                      momentum: 50,
                      demographics: { age: 30, gender: 'MALE', ethnicity: 'White', country: 'USA' },
                      psychology: { ego: 50, mood: 100, scandalRisk: 0, synergyAffinities: [], synergyConflicts: [] }
                  } as import('@/engine/types').Talent
              }
          }
      } as unknown as GameState;
      const impacts = tickProduction(state, rng);
      const projectImpact = impacts.find(i => (i as ProjectUpdateImpact).payload.projectId === 'p1') as ProjectUpdateImpact;
      expect(projectImpact.payload.update.progress).toBeGreaterThan(0);
  });
});
