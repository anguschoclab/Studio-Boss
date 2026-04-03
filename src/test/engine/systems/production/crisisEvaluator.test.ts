import { describe, it, expect } from 'vitest';
import { GameState, StateImpact, Project } from '@/engine/types';
import { resolveCrisisWithHandlers } from '@/engine/systems/production/crisisEvaluator';

describe('Crisis Evaluator (Target A3)', () => {
  const mockState = {
    week: 1,
    studio: {
      internal: {
        projects: {
          'p1': {
            id: 'p1',
            title: 'Star Wars Clone',
            state: 'production',
            productionWeeks: 20,
            buzz: 50,
            activeCrisis: {
              description: 'Actor walkout',
              options: [
                {
                  text: 'Bribe them',
                  cashPenalty: 100000,
                  weeksDelay: 2,
                  buzzPenalty: -10
                }
              ],
              resolved: false
            }
          } as unknown as Project
        }
      }
    }
  } as unknown as GameState;

  it('should resolve a crisis using handlers and return StateImpact objects', () => {
    const impacts = resolveCrisisWithHandlers(mockState, 'p1', 0);
    
    const fundsImpact = impacts.find(i => i.type === 'FUNDS_CHANGED');
    const projectImpact = impacts.find(i => i.type === 'PROJECT_UPDATED');
    
    expect(fundsImpact?.payload.amount).toBe(-100000);
    const updatedProject = projectImpact as StateImpact & { payload: { update: { productionWeeks: number; activeCrisis: { resolved: boolean } } } };
    expect(updatedProject.payload.update.productionWeeks).toBe(22);
    expect(updatedProject.payload.update.activeCrisis.resolved).toBe(true);
  });
});

describe('Crisis Evaluator - Edge Cases', () => {
  it('should safely return empty array if no activeCrisis exists', () => {
     const state = {
       week: 1,
       studio: {
         internal: {
           projects: {
             'p1': {
               id: 'p1',
               title: 'test',
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
             } as Project
           }
         }
       }
     } as unknown as GameState;
     const impacts = resolveCrisisWithHandlers(state, 'p1', 0);
     expect(impacts).toHaveLength(0);
  });

  it('should safely return empty array if activeCrisis is already resolved', () => {
     const state = {
       week: 1,
       studio: {
         internal: {
           projects: {
             'p1': {
               id: 'p1',
               title: 'test',
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
               contentFlags: [],
               activeCrisis: { resolved: true, crisisId: '1', title: 'test', description: 'test', type: 'DELAY', resolvedWeek: 1, options: [] }
             } as Project
           }
         }
       }
     } as unknown as GameState;
     const impacts = resolveCrisisWithHandlers(state, 'p1', 0);
     expect(impacts).toHaveLength(0);
  });

  it('should safely return empty array if optionIndex is out of bounds', () => {
     const state = {
       week: 1,
       studio: {
         internal: {
           projects: {
             'p1': {
               id: 'p1',
               title: 'test',
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
               contentFlags: [],
               activeCrisis: { resolved: false, crisisId: '1', title: 'test', description: 'test', type: 'DELAY', resolvedWeek: 1, options: [] }
             } as Project
           }
         }
       }
     } as unknown as GameState;
     const impacts = resolveCrisisWithHandlers(state, 'p1', 0);
     expect(impacts).toHaveLength(0);
  });

  it('should safely process an option with no impacts/penalties', () => {
     const state = {
       week: 1,
       studio: {
         internal: {
           projects: {
             'p1': {
               id: 'p1',
               title: 'test',
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
               contentFlags: [],
               activeCrisis: { resolved: false, crisisId: '1', title: 'test', description: 'test', type: 'DELAY', resolvedWeek: 1, options: [{ text: 'Do nothing' }] }
             } as Project
           }
         }
       }
     } as unknown as GameState;
     const impacts = resolveCrisisWithHandlers(state, 'p1', 0);
     // Should still emit NEWS_ADDED and PROJECT_UPDATED (resolved: true)
     expect(impacts.some(i => i.type === 'NEWS_ADDED')).toBe(true);
     expect(impacts.some(i => i.type === 'PROJECT_UPDATED')).toBe(true);
  });
});
