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

  it('should return INDUSTRY_UPDATE and RIVAL_UPDATED impacts for Player and Rival', () => {
    const impacts = tickProduction(mockState, rng);

    // Player projects are batched into INDUSTRY_UPDATE
    const industryUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE') as any;
    expect(industryUpdate).toBeDefined();
    const playerProject = industryUpdate?.payload?.['studio.internal.projects']?.['player-p1'];
    expect(playerProject).toBeDefined();
    expect(playerProject?.weeksInPhase).toBe(6);

    // Rival projects are batched into RIVAL_UPDATED
    const rivalUpdate = impacts.find(i => i.type === 'RIVAL_UPDATED') as any;
    expect(rivalUpdate).toBeDefined();
    const rivalProject = rivalUpdate?.payload?.update?.projects?.['rival-p1'];
    expect(rivalProject).toBeDefined();
    expect(rivalProject?.weeksInPhase).toBe(6);
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
     const industryUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE') as any;
     const updatedProject = industryUpdate?.payload?.['studio.internal.projects']?.['p1'];
     expect(updatedProject).toBeDefined();
     expect(updatedProject?.progress).toBeGreaterThan(0);
     expect(updatedProject?.progress).toBeLessThanOrEqual(100);
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
      const industryUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE') as any;
      const updatedProject = industryUpdate?.payload?.['studio.internal.projects']?.['p1'];
      expect(updatedProject?.progress).toBeGreaterThan(0);
  });

  it('should process project with a highly negative budget without throwing (Guild Auditor)', () => {
      const state = {
          week: 1,
          gameSeed: 1,
          tickCount: 0,
          projects: { active: [] },
          game: { currentWeek: 1 },
          finance: { cash: 1000000, ledger: [] },
          news: { headlines: [] },
          ip: { vault: [], franchises: {} },
          market: { opportunities: [], buyers: [] },
          culture: { genrePopularity: {} },
          history: [],
          eventHistory: [],
          studio: {
              name: 'Player Studio',
              archetype: 'major',
              prestige: 50,
              internal: {
                  projects: {
                      'p1': {
                          id: 'p1',
                          title: 'Test',
                          type: 'FILM',
                          format: 'film',
                          genre: 'Drama',
                          budgetTier: 'low',
                          budget: -100_000_000,
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
                          contentFlags: [],
                          scriptHeat: 50,
                          activeRoles: [],
                          scriptEvents: []
                      } as import('@/engine/types').Project
                  },
                  contracts: []
              }
          },
          industry: { rivals: [], families: [], agencies: [], agents: [], talentPool: {}, newsHistory: [], rumors: [] }
      } as GameState;

      const impacts = tickProduction(state, rng);
      const industryUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE') as any;
      const updatedProject = industryUpdate?.payload?.['studio.internal.projects']?.['p1'];
      expect(updatedProject).toBeDefined();
      expect(updatedProject?.progress).toBeGreaterThan(0);
  });
});
