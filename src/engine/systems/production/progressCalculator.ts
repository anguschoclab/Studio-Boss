// @DEPRECATED - This file is unused and will be removed
// Progress calculation is handled by productionEngine.ts
// This function is only used in test files

import { Project } from '../../types';

/**
 * @DEPRECATED - Use productionEngine.ts for progress calculation
 */
export function advanceProjectProgress(project: Project): Project {
  // Use momentum to modify base progress/burn
  const momentumFactor = 0.5 + (project.momentum / 200); // 0.55 to 1.0 multiplier
  
  const p = { ...project };

  if (p.state !== 'production') return p;

  // Halt logic: Still burns budget (overheads/delay costs) but no progress
  if (p.activeCrisis?.haltedProduction) {
    p.momentum = Math.max(0, p.momentum - 5);
    const costStep = (project.budget * 0.05) / momentumFactor; 
    p.accumulatedCost += costStep;
    return p;
  }

  // Progress logic
  const baseProgress = 10; // 10% per week base
  const actualProgress = baseProgress * momentumFactor;
  p.progress = Math.min(100, p.progress + actualProgress);

  // Budget burn logic (Accelerated by low momentum)
  const costStep = (project.budget * 0.10) / momentumFactor; 
  p.accumulatedCost += costStep;
  
  p.weeksInPhase += 1;

  return p;
}
