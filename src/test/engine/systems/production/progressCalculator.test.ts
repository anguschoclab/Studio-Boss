import { describe, it, expect } from 'vitest';
import { advanceProjectProgress } from '../../../../engine/systems/production/progressCalculator';
import { Project } from '../../../../engine/types';

describe('advanceProjectProgress', () => {
  it('halts progress and burns budget if a crisis is active and halting', () => {
    const project = { 
        id: '1', 
        progress: 20, 
        budget: 1000000, 
        accumulatedCost: 200000,
        activeCrisis: { crisisId: 'halt', haltedProduction: true },
        momentum: 50
    } as any as Project;

    const result = advanceProjectProgress(project);
    expect(result.progress).toBe(20); // No progress
    expect(result.accumulatedCost).toBeGreaterThan(200000); // Budget burned
  });

  it('advances progress normally when no crisis is active', () => {
    const project = { 
        id: '1', 
        progress: 20, 
        budget: 1000000, 
        accumulatedCost: 200000,
        activeCrisis: null,
        momentum: 50
    } as any as Project;

    const result = advanceProjectProgress(project);
    expect(result.progress).toBeGreaterThan(20); // Progress advanced
    expect(result.accumulatedCost).toBeGreaterThan(200000); // Budget burned
  });
});
