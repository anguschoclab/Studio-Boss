import { GameState, Project, StateImpact, Contract, Talent, TalentPact, TalentRole } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';
import { TalentMoraleSystem } from './talent/TalentMoraleSystem';
import { processDirectorDisputes } from './directors';
import { getProjectEstimatedWindow, isSeriesProject } from '../utils/projectUtils';
import { SchedulingEngine } from './schedulingEngine';

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
 */
function tickProject(
  project: Project, 
  projectContracts: Contract[],
  talentPool: Record<string, Talent>,
  rng: RandomGenerator
): StateImpact[] {
  if (project.state === 'archived' || project.state === 'released' || project.state === 'post_release') {
    return [];
  }

  const impacts: StateImpact[] = [];
  
  // Handle Turnaround logic
  if (project.state === 'turnaround') {
    const nextTurnaround = (project.turnaroundStartWeek || 0) + 1;
    impacts.push({
      type: 'PROJECT_UPDATED',
      payload: {
        projectId: project.id,
        update: { turnaroundStartWeek: nextTurnaround }
      }
    });

    // Option: If project stays in turnaround too long, it might get cancelled?
    // Not implemented yet, just tracking the time.
    return impacts;
  }

  const nextWeeksInPhase = (project.weeksInPhase || 0) + 1;
  const targetWeeks = Math.max(4, Math.min(30, project.productionWeeks || 20));
  
  // Production efficiency influenced by talent fatigue and morale
  const attachedTalent = getAttachedTalent(projectContracts, talentPool);
  const moraleMult = TalentMoraleSystem.getProductionSpeedMultiplier(attachedTalent);
  
  // Fatigue logic: increase fatigue for all attached talent
  attachedTalent.forEach(t => {
    const newFatigue = SchedulingEngine.updateTalentFatigue(t, true);
    if (newFatigue !== t.fatigue) {
      impacts.push({
        type: 'TALENT_UPDATED',
        payload: {
          talentId: t.id,
          update: { fatigue: newFatigue }
        }
      });
    }
  });

  // 1. Progress Increment
  const baseProgress = (1 / targetWeeks) * 100;
  const variance = rng.range(0.8, 1.2);
  const actualProgressIncrement = baseProgress * variance * moraleMult; 
  const newProgress = Math.min(100, (project.progress || 0) + actualProgressIncrement);

  // 2. Stochastic Quality Check
  let qualityShift = 0;
  if (rng.next() < 0.2) {
    qualityShift = rng.range(-2, 3);
  }

  // 3. Marketing & Buzz Tick
  let buzzGain = 0;
  if (project.state === 'marketing' && project.marketingBudget) {
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
 * Unified Production Engine.
 */
export function tickProduction(state: GameState, rng: RandomGenerator): StateImpact[] {
  const allImpacts: StateImpact[] = [];
  const contractMap = new Map<string, Contract[]>();
  
  for (const contract of state.studio.internal.contracts) {
    const list = contractMap.get(contract.projectId) || [];
    list.push(contract);
    contractMap.set(contract.projectId, list);
  }

  // 1. Player Projects
  for (const key in state.studio.internal.projects) {
    const project = state.studio.internal.projects[key];
    const projectContracts = contractMap.get(project.id) || [];
    
    allImpacts.push(...tickProject(project, projectContracts, state.industry.talentPool, rng));

    const disputeImpact = processDirectorDisputes(project, projectContracts, new Map(Object.entries(state.industry.talentPool)), rng);
    if (disputeImpact) allImpacts.push(disputeImpact);
  }

  // Handle Resting Talent Fatigue (Those not assigned to any active production)
  const activeTalentIds = new Set(state.studio.internal.contracts.map(c => c.talentId));
  Object.values(state.industry.talentPool).forEach(talent => {
    if (!activeTalentIds.has(talent.id)) {
      const newFatigue = SchedulingEngine.updateTalentFatigue(talent, false);
      if (newFatigue !== talent.fatigue) {
        allImpacts.push({
          type: 'TALENT_UPDATED',
          payload: { talentId: talent.id, update: { fatigue: newFatigue } }
        });
      }
    }
  });

  // 2. Rival Projects
  for (const rival of state.industry.rivals) {
    if (!rival.projects) continue;
    for (const key in rival.projects) {
      const project = rival.projects[key];
      // Note: Rivals might need their own contract mapping if we track them deeply.
      // For now, simple tick.
      allImpacts.push(...tickProject(project, [], state.industry.talentPool, rng));
    }
  }

  return allImpacts;
}
