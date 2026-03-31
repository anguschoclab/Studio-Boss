import { Project } from '../../types';

/**
 * Pure function to advance production progress and calculate costs.
 * Respects crisis states (halted production).
 */
export function advanceProjectProgress(project: Project): Project {
  // Use momentum to modify base progress/burn
  const momentumFactor = 0.5 + (project.momentum / 200); // 0.55 to 1.0 multiplier

  if (project.activeCrisis?.haltedProduction) {
    // Burn budget (5% penalty), no progress
    return {
      ...project,
      accumulatedCost: project.accumulatedCost + (project.budget * 0.05)
    };
  }

  // Advance normally (approx 10% progress per week)
  // Modified by momentum
  const progressStep = 10 * momentumFactor;
  const costStep = (project.budget * 0.10) / momentumFactor; // High momentum makes cost more efficient

  return {
    ...project,
    progress: Math.min(100, project.progress + progressStep),
    accumulatedCost: project.accumulatedCost + costStep
  };
}
