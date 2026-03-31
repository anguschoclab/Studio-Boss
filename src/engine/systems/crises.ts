import { Project, ActiveCrisis, GameState } from '@/engine/types';
import { pick, secureRandom } from '../utils';
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
      update: { activeCrisis: crisis }
    }],
    uiNotifications: [`CRISIS: "${project.title}" - ${crisis.description}`]
  };
}

export function checkAndTriggerCrisis(project: Project): StateImpact | null {
  // 3% base chance of a production crisis per week
  if (secureRandom() < 0.03) {
    return generateCrisis(project);
  }
  return null;
}

export function resolveCrisis(state: GameState, projectId: string, optionIndex: number): StateImpact {
  const project = state.studio.internal.projects[projectId];
  if (!project || !project.activeCrisis || project.activeCrisis.resolved) {
    return {};
  }

  const option = project.activeCrisis.options[optionIndex];
  if (!option) return {};

  const impact: StateImpact = {
    cashChange: option.cashPenalty ? -option.cashPenalty : 0,
    prestigeChange: option.reputationPenalty ? -option.reputationPenalty : 0,
    projectUpdates: [],
    removeContracts: [],
    newHeadlines: [],
    newsEvents: []
  };

  const projectUpdate: Partial<Project> = {
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

  impact.projectUpdates!.push({
    projectId,
    update: projectUpdate
  });

  if (option.removeTalentId) {
    impact.removeContracts!.push({
      projectId,
      talentId: option.removeTalentId
    });
  }

  impact.newHeadlines!.push({
    category: 'general',
    text: `Crisis resolved for "${project.title}": ${option.text}`
  });

  impact.newsEvents!.push({
    type: 'CRISIS',
    headline: `Crisis at ${project.title}`,
    description: `The production faced a major setback: ${project.activeCrisis.description.slice(0, 100)}... Studio resolved it by: ${option.text}`,
  });

  return impact;
}
