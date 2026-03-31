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
    expect(projectImpact?.payload.update.productionWeeks).toBe(22);
    expect(projectImpact?.payload.update.activeCrisis.resolved).toBe(true);
  });
});
