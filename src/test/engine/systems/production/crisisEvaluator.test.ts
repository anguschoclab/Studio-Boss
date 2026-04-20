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
      }
    });
    
    const state = createMockGameState();
    state.entities.projects['p1'] = project;

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
     state.entities.projects['p1'] = project;
     
     const impacts = resolveCrisisWithHandlers(state, 'p1', 0);
     expect(impacts).toHaveLength(0);
  });

  it('should safely return empty array if activeCrisis is already resolved', () => {
     const project = createMockProject({ 
       id: 'p1', 
       state: 'production', 
       activeCrisis: { resolved: true, crisisId: '1', title: 'test', description: 'test', type: 'DELAY', resolvedWeek: 1, options: [] }
     });
     const state = createMockGameState();
     state.entities.projects['p1'] = project;
     
     const impacts = resolveCrisisWithHandlers(state, 'p1', 0);
     expect(impacts).toHaveLength(0);
  });

  it('should safely return empty array if optionIndex is out of bounds', () => {
     const project = createMockProject({ 
       id: 'p1', 
       state: 'production', 
       activeCrisis: { resolved: false, crisisId: '1', title: 'test', description: 'test', type: 'DELAY', resolvedWeek: 1, options: [] }
     });
     const state = createMockGameState();
     state.entities.projects['p1'] = project;

     const impacts = resolveCrisisWithHandlers(state, 'p1', 0);
     expect(impacts).toHaveLength(0);
  });

  it('should safely process an option with no impacts/penalties', () => {
     const project = createMockProject({ 
       id: 'p1', 
       state: 'production', 
       activeCrisis: { resolved: false, crisisId: '1', title: 'test', description: 'test', type: 'DELAY', resolvedWeek: 1, options: [{ text: 'Do nothing' }] }
     });
     const state = createMockGameState();
     state.entities.projects['p1'] = project;

     const impacts = resolveCrisisWithHandlers(state, 'p1', 0);
     // Should still emit NEWS_ADDED and PROJECT_UPDATED (resolved: true)
     expect(impacts.some(i => i.type === 'NEWS_ADDED')).toBe(true);
     expect(impacts.some(i => i.type === 'PROJECT_UPDATED')).toBe(true);
  });

  it('should safely process negative penalties and delays without crashing (Guild Auditor)', () => {
     const project = createMockProject({
       id: 'p1',
       state: 'production',
       productionWeeks: 10,
       buzz: 50,
       activeCrisis: {
         resolved: false,
         crisisId: '1',
         title: 'test',
         description: 'test',
         type: 'DELAY',
         resolvedWeek: 1,
         options: [{
           text: 'Negative penalties',
           cashPenalty: -500000,
           weeksDelay: -2,
           buzzPenalty: -20,
           reputationPenalty: -10
         }]
       }
     });
     const state = createMockGameState();
     state.entities.projects['p1'] = project;

     const impacts = resolveCrisisWithHandlers(state, 'p1', 0);

     const fundsImpact = impacts.find(i => i.type === 'FUNDS_CHANGED');
     expect(fundsImpact?.payload.amount).toBe(500000); // -(-500000)

     const prestigeImpact = impacts.find(i => i.type === 'PRESTIGE_CHANGED');
     expect(prestigeImpact?.payload.amount).toBe(10); // -(-10)

     const projectUpdate = impacts.find(i => i.type === 'PROJECT_UPDATED') as StateImpact & { payload: { update: any } };
     expect(projectUpdate).toBeDefined();
     expect(projectUpdate.payload.update.productionWeeks).toBe(8); // 10 + (-2)
     expect(projectUpdate.payload.update.buzz).toBe(70); // max(0, 50 - (-20)) = 70
  });
});
