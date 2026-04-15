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
  const advancementImpacts = advanceProject(
    project,
    currentWeek,
    studioPrestige,
    projectContracts,
    talentPool,
    rng
  );
  
  // Collect all advancement impacts
  impacts.push(...advancementImpacts);

  // 2. Production-Specific Logic (Only if in production)
  if (project.state === 'production') {
    const targetWeeks = Math.max(4, Math.min(30, project.productionWeeks || 20));
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
    const newProgress = Math.min(100, (project.progress || 0) + actualProgressIncrement);

    // Stochastic Quality Check
    let qualityShift = 0;
    if (rng.next() < 0.2) {
      qualityShift = rng.range(-2, 3);
    }

    // Add production-specific progress update
    // Note: We need to merge this with any existing PROJECT_UPDATED impacts
    const progressUpdateImpact = {
      type: 'PROJECT_UPDATED' as const,
      payload: {
        projectId: project.id,
        update: {
          progress: newProgress,
          reviewScore: Math.min(100, Math.max(0, (project.reviewScore || 50) + qualityShift))
        }
      }
    };
    impacts.push(progressUpdateImpact);
  }

  return impacts;
}

/**
 * Unified Production Engine.
 * Processes all projects (player and rival) from state.entities.projects with ownerId filtering.
 */
export function tickProduction(state: GameState, rng: RandomGenerator): StateImpact[] {
  const allImpacts: StateImpact[] = [];
  const contractMap = new Map<string, Contract[]>();
  const activeTalentIds = new Set<string>();

  // Build contract map from state.entities.contracts (unified storage)
  const contractsObj = state.entities.contracts || {};
  for (const key in contractsObj) {
    if (!Object.prototype.hasOwnProperty.call(contractsObj, key)) continue;
    const contract = contractsObj[key];
    const list = contractMap.get(contract.projectId) || [];
    list.push(contract);
    contractMap.set(contract.projectId, list);
    activeTalentIds.add(contract.talentId);
  }

  const rivalsMap = state.entities.rivals || {};

  const rivalIds = new Set<string>();
  for (const key in rivalsMap) {
    if (Object.prototype.hasOwnProperty.call(rivalsMap, key)) {
      rivalIds.add(rivalsMap[key].id);
    }
  }

  // Unified contract storage: Collect all contracts from state.entities.contracts
  const contractsRaw = state.entities.contracts;
  for (const key in contractsRaw) {
    if (Object.prototype.hasOwnProperty.call(contractsRaw, key)) {
      const contract = contractsRaw[key];
      // Only add contracts for rival studios
      if (contract.ownerId && rivalIds.has(contract.ownerId)) {
        const list = contractMap.get(contract.projectId) || [];
        list.push(contract);
        contractMap.set(contract.projectId, list);
      }
    }
  }

  // Unified project storage: Process all projects from state.entities.projects
  const allProjects = { ...state.entities.projects };
  let projectsChanged = false;

  // Build rival prestige map for studio-specific logic
  const rivalPrestigeMap = new Map<string, number>();
  for (const key in rivalsMap) {
    if (Object.prototype.hasOwnProperty.call(rivalsMap, key)) {
      rivalPrestigeMap.set(rivalsMap[key].id, rivalsMap[key].prestige);
    }
  }

  // Process all projects with ownerId filtering
  for (const key in allProjects) {
    const project = allProjects[key];
    const ownerId = project.ownerId || 'player'; // Default to player for backward compatibility

    // Determine studio prestige based on ownerId
    let studioPrestige: number;
    if (ownerId === 'player') {
      studioPrestige = state.studio.prestige;
    } else {
      studioPrestige = rivalPrestigeMap.get(ownerId) || 50; // Default to 50 if not found
    }

    const projectContracts = contractMap.get(project.id) || [];

    // We reuse tickProject logic but handle impacts collection differently
    const projectImpacts = tickProject(project, projectContracts, state.entities.talents, rng, studioPrestige, state.week);

    projectImpacts.forEach(imp => {
        if (imp.type === 'PROJECT_UPDATED') {
            allProjects[imp.payload.projectId] = {
                ...allProjects[imp.payload.projectId],
                ...imp.payload.update
            };
            projectsChanged = true;
        } else {
            allImpacts.push(imp);
        }
    });

    const disputeImpact = processDirectorDisputes(project, projectContracts, state.entities.talents, rng);
    if (disputeImpact && (disputeImpact.projectUpdates?.length || disputeImpact.uiNotifications?.length)) {
        allImpacts.push(disputeImpact);
    }
  }

  if (projectsChanged) {
      allImpacts.push({
          type: 'INDUSTRY_UPDATE',
          payload: { update: { 'entities.projects': allProjects } }
      } as any);
  }

  // Handle Resting Talent Fatigue
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
                    id: rng.uuid('NWS'),
                    headline: `MERGER FINALIZED: ${merger.id}`,
                    description: `The acquisition process has officially concluded.`,
                    category: 'market'
                }
            });
        }
    }
    
    return impacts;
}
