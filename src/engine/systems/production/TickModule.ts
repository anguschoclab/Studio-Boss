// ⚠️ DEAD CODE: This file is not imported by any active module. The active production tick lives in
// src/engine/systems/productionEngine.ts and src/engine/services/filters/ProductionFilter.ts.
import { GameState, Project, StateImpact, Contract, Talent } from "../../types";
import { RandomGenerator } from "../../utils/rng";
import { TalentMoraleSystem } from "../talent/TalentMoraleSystem";
import { processDirectorDisputes } from "../directors";
import { SchedulingEngine } from "../schedulingEngine";
import { advanceProject } from "../projects";
import { tickScriptDevelopment } from "./ScriptDraftingSystem";
import { getAttachedTalent } from "../../utils/talentHelpers";

function tickProject(
  project: Project,
  projectContracts: Contract[],
  talentPoolMap: Map<string, Talent>,
  rng: RandomGenerator,
  studioPrestige: number,
  currentWeek: number
): StateImpact[] {
  if (project.state === "archived") {
    return [];
  }

  const impacts: StateImpact[] = [];

  const advancementResult = advanceProject(
    project,
    currentWeek,
    studioPrestige,
    projectContracts,
    talentPoolMap,
    50, // default rival strength
    [], // default awards
    1.0, // trend mult
    1.0, // synergy
    0, // fatigue
    rng
  );

  // Add project update impact
  impacts.push({
    type: "PROJECT_UPDATED",
    payload: {
      projectId: project.id,
      update: advancementResult.project,
    },
  });

  // Add talent updates if any
  advancementResult.talentUpdates.forEach((t) => {
    impacts.push({
      type: "TALENT_UPDATED",
      payload: { talentId: t.id, update: t },
    });
  });

  // 1.5 Script Development Evolution
  if (project.state === "development") {
    const draftingImpacts = tickScriptDevelopment(project, rng);
    impacts.push(...draftingImpacts);
  }

  if (project.state === "production") {
    const targetWeeks = Math.max(4, Math.min(30, project.productionWeeks || 20));
    const attachedTalent = getAttachedTalent(projectContracts, Object.fromEntries(talentPoolMap));
    const moraleMult = TalentMoraleSystem.getProductionSpeedMultiplier(attachedTalent);

    attachedTalent.forEach((t) => {
      const newFatigue = SchedulingEngine.updateTalentFatigue(t, true);
      if (newFatigue !== t.fatigue) {
        impacts.push({
          type: "TALENT_UPDATED",
          payload: { talentId: t.id, update: { fatigue: newFatigue } },
        });
      }
    });

    const baseProgress = (1 / targetWeeks) * 100;
    const variance = rng.range(0.8, 1.2);
    const actualProgressIncrement = baseProgress * variance * moraleMult;
    const newProgress = Math.min(100, (project.progress || 0) + actualProgressIncrement);

    let qualityShift = 0;
    if (rng.next() < 0.2) {
      qualityShift = rng.range(-2, 3);
    }

    // Only push progress update if not transitioning to post_production this week
    if (project.weeksInPhase + 1 < targetWeeks) {
      const progressUpdateImpact = {
        type: "PROJECT_UPDATED" as const,
        payload: {
          projectId: project.id,
          update: {
            progress: newProgress,
            reviewScore: Math.min(100, Math.max(0, (project.reviewScore || 50) + qualityShift)),
          },
        },
      };
      impacts.push(progressUpdateImpact);
    }
  }

  return impacts;
}

export function tickProduction(state: GameState, rng: RandomGenerator): StateImpact[] {
  const allImpacts: StateImpact[] = [];
  const contractMap = new Map<string, Contract[]>();
  const activeTalentIds = new Set<string>();

  const contractsObj = state.entities.contracts || {};
  const idx = state.entities.contractsByProjectId || {};
  for (const pid in idx) {
    if (!Object.prototype.hasOwnProperty.call(idx, pid)) continue;
    const contractIds = idx[pid];
    const list: Contract[] = [];
    for (const cId of contractIds) {
      const contract = contractsObj[cId];
      if (contract) {
        list.push(contract);
        activeTalentIds.add(contract.talentId);
      }
    }
    contractMap.set(pid, list);
  }

  const rivalsMap = state.entities.rivals || {};

  const rivalIds = new Set<string>();
  for (const key in rivalsMap) {
    if (Object.prototype.hasOwnProperty.call(rivalsMap, key)) {
      rivalIds.add(rivalsMap[key].id);
    }
  }

  const contractsRaw = state.entities.contracts || {};
  for (const pid in idx) {
    if (!Object.prototype.hasOwnProperty.call(idx, pid)) continue;
    for (const cId of idx[pid]) {
      const contract = contractsRaw[cId];
      if (contract && contract.ownerId && rivalIds.has(contract.ownerId)) {
        const list = contractMap.get(pid) || [];
        list.push(contract);
        contractMap.set(pid, list);
      }
    }
  }

  const allProjects = { ...state.entities.projects };
  let projectsChanged = false;

  const rivalPrestigeMap = new Map<string, number>();
  for (const key in rivalsMap) {
    if (Object.prototype.hasOwnProperty.call(rivalsMap, key)) {
      rivalPrestigeMap.set(rivalsMap[key].id, rivalsMap[key].prestige);
    }
  }

  for (const key in allProjects) {
    const project = allProjects[key];
    const ownerId = project.ownerId || state.studio.id;

    let studioPrestige: number;
    if (ownerId === state.studio.id) {
      studioPrestige = state.studio.prestige;
    } else {
      studioPrestige = rivalPrestigeMap.get(ownerId) || 50;
    }

    const projectContracts = contractMap.get(project.id) || [];
    const talentPoolMap = new Map(Object.entries(state.entities.talents));

    const projectImpacts = tickProject(
      project,
      projectContracts,
      talentPoolMap,
      rng,
      studioPrestige,
      state.week
    );

    projectImpacts.forEach((imp) => {
      if (imp.type === "PROJECT_UPDATED") {
        allProjects[imp.payload.projectId] = {
          ...allProjects[imp.payload.projectId],
          ...imp.payload.update,
        } as Project;
        projectsChanged = true;
      } else {
        allImpacts.push(imp);
      }
    });

    const disputeResult = processDirectorDisputes(project, projectContracts, talentPoolMap, rng);
    if (disputeResult.updates.length > 0 || disputeResult.newCrises.length > 0) {
      allImpacts.push({
        uiNotifications: disputeResult.updates,
        projectUpdates: disputeResult.newCrises.map((c) => ({
          projectId: c.projectId,
          update: { activeCrisis: c.crisis },
        })),
      });
    }
  }

  if (projectsChanged) {
    allImpacts.push({
      type: "INDUSTRY_UPDATE",
      payload: { update: { "entities.projects": allProjects } },
    });
  }

  for (const talentId in state.entities.talents) {
    if (!Object.prototype.hasOwnProperty.call(state.entities.talents, talentId)) continue;
    const talent = state.entities.talents[talentId];
    if (!activeTalentIds.has(talent.id)) {
      const newFatigue = SchedulingEngine.updateTalentFatigue(talent, false);
      if (newFatigue !== talent.fatigue) {
        allImpacts.push({
          type: "TALENT_UPDATED",
          payload: { talentId: talent.id, update: { fatigue: newFatigue } },
        });
      }
    }
  }

  return allImpacts;
}
