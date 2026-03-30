import { Project, ActiveCrisis, GameState } from '@/engine/types';
import { pick } from '../utils';
import { StateImpact } from '../types/state.types';
import { CRISIS_POOLS } from '../data/crises.data';

export function generateCrisis(project: Project): StateImpact | null {
  const template = pick(CRISIS_POOLS);
  if (!template) return null;

  const crisis: ActiveCrisis = {
    description: template.description,
    options: template.options,
    resolved: false,
    severity: 'medium'
  };

  return {
    projectUpdates: [{
      projectId: project.id,
      updates: { activeCrisis: crisis }
    }],
    notifications: [`CRISIS: "${project.title}" - ${crisis.description}`]
  };
}

export function resolveCrisis(state: GameState, projectId: string, optionIndex: number): GameState {
  const project = state.studio.internal.projects[projectId];
  const projectIndex = project ? 1 : -1;
  if (projectIndex === -1) return state;


  if (!project.activeCrisis || project.activeCrisis.resolved) return state;

  const option = project.activeCrisis.options[optionIndex];
  if (!option) return {};

  const impact: StateImpact = {
    cashDelta: option.cashPenalty ? -option.cashPenalty : 0,
    prestigeDelta: option.reputationPenalty ? -option.reputationPenalty : 0,
    projectUpdates: [],
    talentUpdates: [],
    headlines: [],
    newsEvents: []
  };

  const projectUpdate: any = {
    activeCrisis: {
      ...project.activeCrisis,
      resolved: true
    }
  };

  if (option.weeksDelay) {
    projectUpdate.productionWeeks = (project.productionWeeks || 0) + option.weeksDelay;
  }

  if (option.buzzPenalty) {
    projectUpdate.buzz = Math.max(0, project.buzz - option.buzzPenalty);
  }

  // Mark resolved
  updatedProject.activeCrisis = {
    ...project.activeCrisis,
    resolved: true
  };

  const newProjects = { ...state.studio.internal.projects };
  newProjects[projectId] = updatedProject;

  if (option.removeTalentId) {
    impact.contractsToRemove = [{
      projectId,
      talentId: option.removeTalentId
    }];
  }

  impact.headlines!.push({
    category: 'general',
    text: `Crisis resolved for "${project.title}": ${option.text}`
  });

  impact.newsEvents!.push({
    type: 'CRISIS',
    headline: `Crisis at ${project.title}`,
    description: `The production faced a major setback: ${project.activeCrisis.description.slice(0, 100)}... Studio resolved it by: ${option.text}`,
    impact: option.effectDescription
  });

  return impact;
}
