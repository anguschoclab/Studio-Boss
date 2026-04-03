import { advanceProjectProgress } from '@/engine/systems/production/progressCalculator';
import { Project } from '@/engine/types';

describe('advanceProjectProgress', () => {
  it('halts progress and burns budget if a crisis is active and halting', () => {
    const project = { 
        id: '1', 
        state: 'production',
        progress: 20, 
        budget: 1000000, 
        accumulatedCost: 200000,
        activeCrisis: { crisisId: 'halt', haltedProduction: true },
        momentum: 50
    } as Project;

    const result = advanceProjectProgress(project);
    expect(result.progress).toBe(20); // No progress
    expect(result.accumulatedCost).toBeGreaterThan(200000); // Budget burned
  });

  it('advances progress normally when no crisis is active', () => {
    const project = { 
        id: '1', 
        state: 'production',
        progress: 20, 
        budget: 1000000, 
        accumulatedCost: 200000,
        activeCrisis: null,
        momentum: 50
    } as Project;

    const result = advanceProjectProgress(project);
    expect(result.progress).toBeGreaterThan(20); // Progress advanced
    expect(result.accumulatedCost).toBeGreaterThan(200000); // Budget burned
  });
});

describe('advanceProjectProgress - Edge Cases', () => {
  it('should handle zero momentum', () => {
    const project = {
        id: '1',
        title: 'Project 1',
        type: 'FILM',
        format: 'film',
        genre: 'Action',
        budgetTier: 'mid',
        budget: 1000000,
        weeklyCost: 100000,
        targetAudience: 'General',
        flavor: 'Action-packed',
        state: 'production',
        buzz: 50,
        weeksInPhase: 0,
        developmentWeeks: 10,
        productionWeeks: 10,
        revenue: 0,
        weeklyRevenue: 0,
        releaseWeek: null,
        accumulatedCost: 0,
        momentum: 0,
        progress: 0,
        activeCrisis: null,
        contentFlags: [],
        scriptHeat: 50,
        activeRoles: [],
        scriptEvents: []
    } as Project;
    const result = advanceProjectProgress(project);
    // momentumFactor = 0.5, actualProgress = 10 * 0.5 = 5
    expect(result.progress).toBe(5);
    // costStep = (1000000 * 0.10) / 0.5 = 200000
    expect(result.accumulatedCost).toBe(200000);
  });

  it('should handle negative budget without failing', () => {
    const project = {
        id: '1',
        title: 'Project 1',
        type: 'FILM',
        format: 'film',
        genre: 'Action',
        budgetTier: 'mid',
        budget: -500000,
        weeklyCost: 100000,
        targetAudience: 'General',
        flavor: 'Action-packed',
        state: 'production',
        buzz: 50,
        weeksInPhase: 0,
        developmentWeeks: 10,
        productionWeeks: 10,
        revenue: 0,
        weeklyRevenue: 0,
        releaseWeek: null,
        accumulatedCost: 0,
        momentum: 100,
        progress: 0,
        activeCrisis: null,
        contentFlags: [],
        scriptHeat: 50,
        activeRoles: [],
        scriptEvents: []
    } as Project;
    const result = advanceProjectProgress(project);
    // momentumFactor = 1.0
    // costStep = (-500000 * 0.10) / 1.0 = -50000
    expect(result.accumulatedCost).toBe(-50000);
  });

  it('should max out progress at 100', () => {
    const project = {
        id: '1',
        title: 'Project 1',
        type: 'FILM',
        format: 'film',
        genre: 'Action',
        budgetTier: 'mid',
        budget: 1000000,
        weeklyCost: 100000,
        targetAudience: 'General',
        flavor: 'Action-packed',
        state: 'production',
        buzz: 50,
        weeksInPhase: 0,
        developmentWeeks: 10,
        productionWeeks: 10,
        revenue: 0,
        weeklyRevenue: 0,
        releaseWeek: null,
        accumulatedCost: 0,
        momentum: 200,
        progress: 98,
        activeCrisis: null,
        contentFlags: [],
        scriptHeat: 50,
        activeRoles: [],
        scriptEvents: []
    } as Project;
    const result = advanceProjectProgress(project);
    expect(result.progress).toBe(100);
  });
});
