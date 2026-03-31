import { Project, ActiveCrisis } from '../../types';

/**
 * Pure function to evaluate RNG-based production crises.
 * Ensures a project with an active crisis does not trigger another.
 */
export function evaluateProjectCrises(project: Project, currentWeek: number, rngRoll = Math.random()): Project {
  // Guard: Only process active productions
  if (project.state !== 'production') return project;
  
  // Guard: If a crisis is already active, don't trigger another one
  if (project.activeCrisis) return project;

  // Potential for future expansion: check assigned talent scandal risk or ego
  if (rngRoll > 0.95) {
    const crisis: ActiveCrisis = {
      crisisId: 'onset_altercation', // Mapping to CRISIS_POOLS eventually
      triggeredWeek: currentWeek,
      haltedProduction: true,
    };

    return {
      ...project,
      activeCrisis: crisis,
      momentum: Math.max(0, project.momentum - 20)
    };
  }

  return project;
}
