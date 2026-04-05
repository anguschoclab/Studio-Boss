import { describe, it, expect } from 'vitest';
import { StateImpact } from '@/engine/types';
import { resolveCrisisWithHandlers } from '@/engine/systems/production/crisisEvaluator';
import { createMockGameState, createMockProject } from '../../../utils/mockFactories';

describe('Crisis Evaluator (Target A3)', () => {
  it('should resolve a crisis using handlers and return StateImpact objects', () => {
    const project = createMockProject({
      id: 'p1',
      title: 'Star Wars Clone',
      state: 'production',
      productionWeeks: 20,
      buzz: 50,
      activeCrisis: {
        crisisId: 'c1',
        title: 'Crisis',
        description: 'Actor walkout',
        type: 'DELAY',
        resolvedWeek: 1,
        options: [
          {
            text: 'Bribe them',
            cashPenalty: 100000,
            weeksDelay: 2,
            buzzPenalty: -10
          }
        ],
        resolved: false
      } as any
    });
    
    const state = createMockGameState();
    state.studio.internal.projects['p1'] = project;

    const impacts = resolveCrisisWithHandlers(state, 'p1', 0);
    
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
     const project = createMockProject({ id: 'p1', state: 'production', activeCrisis: null });
     const state = createMockGameState();
     state.studio.internal.projects['p1'] = project;
     
     const impacts = resolveCrisisWithHandlers(state, 'p1', 0);
     expect(impacts).toHaveLength(0);
  });

  it('should safely return empty array if activeCrisis is already resolved', () => {
     const project = createMockProject({ 
       id: 'p1', 
       state: 'production', 
       activeCrisis: { resolved: true, crisisId: '1', title: 'test', description: 'test', type: 'DELAY', resolvedWeek: 1, options: [] } as any
     });
     const state = createMockGameState();
     state.studio.internal.projects['p1'] = project;
     
     const impacts = resolveCrisisWithHandlers(state, 'p1', 0);
     expect(impacts).toHaveLength(0);
  });

  it('should safely return empty array if optionIndex is out of bounds', () => {
     const project = createMockProject({ 
       id: 'p1', 
       state: 'production', 
       activeCrisis: { resolved: false, crisisId: '1', title: 'test', description: 'test', type: 'DELAY', resolvedWeek: 1, options: [] } as any
     });
     const state = createMockGameState();
     state.studio.internal.projects['p1'] = project;

     const impacts = resolveCrisisWithHandlers(state, 'p1', 0);
     expect(impacts).toHaveLength(0);
  });

  it('should safely process an option with no impacts/penalties', () => {
     const project = createMockProject({ 
       id: 'p1', 
       state: 'production', 
       activeCrisis: { resolved: false, crisisId: '1', title: 'test', description: 'test', type: 'DELAY', resolvedWeek: 1, options: [{ text: 'Do nothing' }] } as any
     });
     const state = createMockGameState();
     state.studio.internal.projects['p1'] = project;

     const impacts = resolveCrisisWithHandlers(state, 'p1', 0);
     // Should still emit NEWS_ADDED and PROJECT_UPDATED (resolved: true)
     expect(impacts.some(i => i.type === 'NEWS_ADDED')).toBe(true);
     expect(impacts.some(i => i.type === 'PROJECT_UPDATED')).toBe(true);
  });
});
