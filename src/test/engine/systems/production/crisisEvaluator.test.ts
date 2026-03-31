import { describe, it, expect } from 'vitest';
import { evaluateProjectCrises } from '@/engine/systems/production/crisisEvaluator';
import { Project } from '@/engine/types';

describe('evaluateProjectCrises', () => {
  it('does nothing if a crisis is already active', () => {
    const project = { id: '1', state: 'production', activeCrisis: { crisisId: 'onset_altercation', triggeredWeek: 5, haltedProduction: true } } as Project;
    const result = evaluateProjectCrises(project, 10);
    expect(result.activeCrisis?.crisisId).toBe('onset_altercation');
    expect(result.activeCrisis?.triggeredWeek).toBe(5);
  });

  it('triggers a crisis if RNG hits the threshold', () => {
    const project = { id: '1', state: 'production', activeCrisis: null } as Project;
    // Mock RNG to 0.99 (above 0.95 threshold)
    const result = evaluateProjectCrises(project, 10, 0.99); 
    expect(result.activeCrisis).not.toBeNull();
    expect(result.activeCrisis?.crisisId).toBe('onset_altercation');
    expect(result.activeCrisis?.haltedProduction).toBe(true);
  });

  it('does not trigger a crisis if RNG is below the threshold', () => {
    const project = { id: '1', state: 'production', activeCrisis: null } as Project;
    // Mock RNG to 0.50 (below 0.95 threshold)
    const result = evaluateProjectCrises(project, 10, 0.50); 
    expect(result.activeCrisis).toBeNull();
  });
});
