import { GameState, Project, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';

/**
 * Pure function to advance a single project's weekly production logic.
 * Handlers are kept under 50 lines per mandate.
 */
function tickProject(project: Project, rng: RandomGenerator): StateImpact[] {
  if (project.state === 'archived' || project.state === 'released' || project.state === 'post_release') {
    return [];
  }

  const impacts: StateImpact[] = [];
  const nextWeeksInPhase = (project.weeksInPhase || 0) + 1;
  const targetWeeks = project.productionWeeks || 20;
  
  // 1. Progress Increment (with small stochastic variance)
  const baseProgress = (1 / targetWeeks) * 100;
  const variance = rng.range(0.8, 1.2);
  const actualProgressIncrement = baseProgress * variance;
  const newProgress = Math.min(100, (project.progress || 0) + actualProgressIncrement);

  // 2. Stochastic Quality Check
  // Each week has a chance to slightly shift the reviewScore based on progress milestones
  let qualityShift = 0;
  if (rng.next() < 0.2) {
    qualityShift = rng.range(-2, 3); // Slightly biased towards improvement
  }

  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: project.id,
      update: {
        weeksInPhase: nextWeeksInPhase,
        progress: newProgress,
        reviewScore: Math.min(100, Math.max(0, (project.reviewScore || 50) + qualityShift))
      }
    }
  });

  return impacts;
}

/**
 * Unified Production Engine (Target A2).
 * Iterates over all projects (Player & Rivals) with identical math.
 */
export function tickProduction(state: GameState, rng: RandomGenerator): StateImpact[] {
  const allImpacts: StateImpact[] = [];

  // ⚡ Bolt: Iterate over global projects record to advance all active titles (Player & Rivals)
  for (const key in state.entities?.projects || {}) {
    const project = state.entities.projects[key];
    allImpacts.push(...tickProject(project, rng));
  }

  return allImpacts;
}
