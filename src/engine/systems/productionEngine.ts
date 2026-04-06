import { GameState, Project, StateImpact, Contract, Talent } from '../types';
import { RandomGenerator } from '../utils/rng';
import { TalentMoraleSystem } from './talent/TalentMoraleSystem';
import { processDirectorDisputes } from './directors';
import { SchedulingEngine } from './schedulingEngine';
import { advanceProject } from './projects';

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
  rng: RandomGenerator,
  studioPrestige: number,
  currentWeek: number
): StateImpact[] {
  if (project.state === 'archived') {
    return [];
  }

  const impacts: StateImpact[] = [];
  // 1. Core Advancement Pulse (Always happens for non-archived)
  const { project: advancedProject, newScandals } = advanceProject(
    project,
    currentWeek,
    studioPrestige,
    projectContracts,
    talentPool,
    rng
  );

  if (newScandals && newScandals.length > 0) {
    newScandals.forEach((scandal: any) => {
      impacts.push({
        type: 'SCANDAL_ADDED',
        payload: { scandal }
      });
    });
  }

  // 2. Production-Specific Logic (Only if in production)
  if (advancedProject.state === 'production') {
    const targetWeeks = Math.max(4, Math.min(30, advancedProject.productionWeeks || 20));
    const attachedTalent = getAttachedTalent(projectContracts, talentPool);
    const moraleMult = TalentMoraleSystem.getProductionSpeedMultiplier(attachedTalent);
    
    // Fatigue logic
    attachedTalent.forEach(t => {
      const newFatigue = SchedulingEngine.updateTalentFatigue(t, true);
      if (newFatigue !== t.fatigue) {
        impacts.push({
          type: 'TALENT_UPDATED',
          payload: { talentId: t.id, update: { fatigue: newFatigue } }
        });
      }
    });

    // Progress Increment
    const baseProgress = (1 / targetWeeks) * 100;
    const variance = rng.range(0.8, 1.2);
    const actualProgressIncrement = baseProgress * variance * moraleMult; 
    const newProgress = Math.min(100, (advancedProject.progress || 0) + actualProgressIncrement);

    // Stochastic Quality Check
    let qualityShift = 0;
    if (rng.next() < 0.2) {
      qualityShift = rng.range(-2, 3);
    }

    advancedProject.progress = newProgress;
    advancedProject.reviewScore = Math.min(100, Math.max(0, (advancedProject.reviewScore || 50) + qualityShift));
  }

  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: advancedProject.id,
      update: advancedProject
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
  
  const contractsList = Object.values(state.entities.contracts || {});
  for (const contract of contractsList) {
    const list = contractMap.get(contract.projectId) || [];
    list.push(contract);
    contractMap.set(contract.projectId, list);
  }

  const rivalsMap = state.entities.rivals || {};
  const rivalsList = Object.values(rivalsMap);

  // collect rival contracts (Not used in the current engine version, but keeping for compatibility)
  for (const rival of rivalsList) {
    if (!rival.contracts) continue;
    for (const contract of rival.contracts) {
      const list = contractMap.get(contract.projectId) || [];
      list.push(contract);
      contractMap.set(contract.projectId, list);
    }
  }

  // 1. Player Projects
  const playerProjects = { ...state.entities.projects };
  let playerChanged = false;

  for (const key in playerProjects) {
    const project = playerProjects[key];
    const projectContracts = contractMap.get(project.id) || [];
    
    // We reuse tickProject logic but handle impacts collection differently
    const projectImpacts = tickProject(project, projectContracts, state.entities.talents, rng, state.studio.prestige, state.week);
    
    projectImpacts.forEach(imp => {
        if (imp.type === 'PROJECT_UPDATED') {
            playerProjects[imp.payload.projectId] = { 
                ...playerProjects[imp.payload.projectId], 
                ...imp.payload.update 
            };
            playerChanged = true;
        } else {
            allImpacts.push(imp);
        }
    });

    const disputeImpact = processDirectorDisputes(project, projectContracts, state.entities.talents, rng);
    if (disputeImpact && (disputeImpact.projectUpdates?.length || disputeImpact.uiNotifications?.length)) {
        allImpacts.push(disputeImpact);
    }
  }

  if (playerChanged) {
      allImpacts.push({
          type: 'INDUSTRY_UPDATE', 
          payload: { update: { 'entities.projects': playerProjects } }
      } as any);
  }

  // Handle Resting Talent Fatigue
  const activeTalentIds = new Set(contractsList.map(c => c.talentId));
  for (const talentId in state.entities.talents) {
    if (!Object.prototype.hasOwnProperty.call(state.entities.talents, talentId)) continue;
    const talent = state.entities.talents[talentId];
    if (!activeTalentIds.has(talent.id)) {
      const newFatigue = SchedulingEngine.updateTalentFatigue(talent, false);
      if (newFatigue !== talent.fatigue) {
        allImpacts.push({
          type: 'TALENT_UPDATED',
          payload: { talentId: talent.id, update: { fatigue: newFatigue } }
        });
      }
    }
  }

  // 2. Rival Projects
  for (const rival of rivalsList) {
    if (!rival.projects) continue;
    const rivalProjects = { ...rival.projects };
    let rivalChanged = false;

    for (const key in rivalProjects) {
      const project = rivalProjects[key];
      const projectImpacts = tickProject(project, [], state.entities.talents, rng, rival.prestige, state.week);
      
      projectImpacts.forEach(imp => {
          if (imp.type === 'PROJECT_UPDATED') {
              rivalProjects[imp.payload.projectId] = {
                  ...rivalProjects[imp.payload.projectId],
                  ...imp.payload.update
              };
              rivalChanged = true;
          } else {
              allImpacts.push(imp);
          }
      });
    }

    if (rivalChanged) {
        allImpacts.push({
            type: 'RIVAL_UPDATED',
            payload: { rivalId: rival.id, update: { projects: rivalProjects } }
        });
    }
  }

  return allImpacts;
}

/**
 * Evaluates pending mergers and resolves them if the deadline is reached.
 */
export function evaluateActiveMergers(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    const activeMergers = state.industry.activeMergers || [];
    
    for (const merger of activeMergers) {
        if (state.week >= (merger.activeUntilWeek || 0)) {
            // Resolution Logic
            impacts.push({
                type: 'MERGER_RESOLVED',
                payload: { mergerId: merger.id, status: 'completed' as const }
            });
            
            impacts.push({
                type: 'NEWS_ADDED',
                payload: {
                    id: rng.uuid('news-merger'),
                    headline: `MERGER FINALIZED: ${merger.id}`,
                    description: `The acquisition process has officially concluded.`,
                    category: 'market'
                }
            });
        }
    }
    
    return impacts;
}
