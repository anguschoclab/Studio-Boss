import { Project } from '../../types';

/**
 * Pure function to evaluate if a project triggers a crisis.
 * Threshold is currently 5% per week (rngRoll > 0.95).
 */
export function evaluateProjectCrises(project: Project, currentWeek: number, rngRoll = Math.random()): Project {
  // If a crisis is already active, don't trigger another one
  if (project.activeCrisis) return project;

  // Potential for future expansion: check assigned talent scandal risk or ego
  if (rngRoll > 0.95) {
    return {
      ...project,
      activeCrisis: {
        crisisId: 'onset_altercation', // Base template for Phase 2
        triggeredWeek: currentWeek,
        haltedProduction: true
      }
    };
  }

  return project;
}
