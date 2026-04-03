import { GameState, Project, StateImpact, Contract, Talent } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';
import { TalentMoraleSystem } from './talent/TalentMoraleSystem';

function getAttachedTalent(contracts: Contract[], talentPool: Record<string, Talent>): Talent[] {
  const acc: Talent[] = [];
  for (let i = 0; i < contracts.length; i++) {
    const t = talentPool[contracts[i].talentId];
    if (t) acc.push(t);
  }
  return acc;
}

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
  
  // 1. Progress Increment (with small stochastic variance & Morale Drag)
  const baseProgress = (1 / targetWeeks) * 100;
  const variance = rng.range(0.8, 1.2);
  const actualProgressIncrement = baseProgress * variance; 
  const newProgress = Math.min(100, (project.progress || 0) + actualProgressIncrement);

  // 2. Stochastic Quality Check
  let qualityShift = 0;
  if (rng.next() < 0.2) {
    qualityShift = rng.range(-2, 3);
  }

  // 3. Stage 2.1: Marketing & Buzz Tick
  let buzzGain = 0;
  if (project.state === 'marketing' && project.marketingBudget) {
    // Every $1M in budget generates ~1 point of buzz per week
    buzzGain = (project.marketingBudget / 1_000_000) * rng.range(0.5, 1.5);
  }

  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: project.id,
      update: {
        weeksInPhase: nextWeeksInPhase,
        progress: newProgress,
        reviewScore: Math.min(100, Math.max(0, (project.reviewScore || 50) + qualityShift)),
        buzz: Math.min(100, (project.buzz || 0) + buzzGain)
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

  // ⚡ Bolt: Pre-calculate contract map to avoid O(N) array allocation per project tick
  const contractMap = new Map<string, import('@/engine/types').Contract[]>();
  for (const contract of state.studio.internal.contracts) {
    const list = contractMap.get(contract.projectId) || [];
    list.push(contract);
    contractMap.set(contract.projectId, list);
  }

  // 1. Player Projects
  for (const key in state.studio.internal.projects) {
    const project = state.studio.internal.projects[key];
    const projectContracts = contractMap.get(project.id) || [];
    const attachedTalent = getAttachedTalent(projectContracts, state.industry.talentPool);
    const moraleMult = TalentMoraleSystem.getProductionSpeedMultiplier(attachedTalent);
    
    const projectImpacts = tickProject(project, rng);
    // Apply morale multiplier to the progress increment in the impact
    projectImpacts.forEach(impact => {
       if (impact.type === 'PROJECT_UPDATED' && impact.payload.update.progress !== undefined) {
         const oldProgress = project.progress || 0;
         const increment = impact.payload.update.progress - oldProgress;
         impact.payload.update.progress = oldProgress + (increment * moraleMult);
       }
    });

    allImpacts.push(...projectImpacts);
  }

  // 2. Rival Projects
  for (const rival of state.industry.rivals) {
    if (!rival.projects) continue;
    // ⚡ Bolt: Iterate over project records using for...in to avoid O(N) array allocation per tick
    for (const key in rival.projects) {
      const project = rival.projects[key];
      allImpacts.push(...tickProject(project, rng));
    }
  }

  return allImpacts;
}
