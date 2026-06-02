import { GameState, Project, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';
import { processDirectorDisputes } from './directors';

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

  // Crisis halt: production is frozen but costs continue accumulating
  if (project.state === 'production' && project.activeCrisis?.haltedProduction) {
    const momentumFactor = 0.5 + ((project.momentum || 50) / 200);
    const haltCostStep = (project.budget * 0.05) / momentumFactor;
    impacts.push({
      type: 'PROJECT_UPDATED',
      payload: {
        projectId: project.id,
        update: {
          weeksInPhase: nextWeeksInPhase,
          momentum: Math.max(0, (project.momentum || 50) - 5),
          accumulatedCost: (project.accumulatedCost || 0) + haltCostStep
        }
      }
    });
    return impacts;
  }

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

  const contractMap = new Map<string, import('@/engine/types').Contract[]>();
  for (const cId in state.entities.contracts) {
    const c = state.entities.contracts[cId];
    const list = contractMap.get(c.projectId) || [];
    list.push(c);
    contractMap.set(c.projectId, list);
  }
  const talentMap = new Map(Object.entries(state.entities.talents));

  // ⚡ Bolt: Iterate over global projects record to advance all active titles (Player & Rivals)
  for (const key in state.entities.projects) {
    const project = state.entities.projects[key];
    allImpacts.push(...tickProject(project, rng));

    if (project.state === 'production' && !project.activeCrisis) {
      const projectContracts = contractMap.get(project.id) || [];
      const disputeResult = processDirectorDisputes(project, projectContracts, talentMap, rng);
      disputeResult.newCrises.forEach(({ projectId, crisis }) => {
        allImpacts.push({
          type: 'PROJECT_UPDATED',
          payload: { projectId, update: { activeCrisis: crisis } }
        });
      });
      if (disputeResult.updates.length > 0) {
        allImpacts.push({
          type: 'NEWS_ADDED',
          payload: { headline: 'ON-SET CRISIS', description: disputeResult.updates[0] }
        });
      }
    }
  }

  return allImpacts;
}
