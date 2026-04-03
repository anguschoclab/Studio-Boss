import { pick } from '../utils';
import { Project, ActiveCrisis, GameState } from '@/engine/types';
import { StateImpact } from '../types/state.types';
import { CRISIS_POOLS } from '../data/crises.data';
import { RandomGenerator } from '../utils/rng';

/**
 * Procedural Crisis Generation (Hardened)
 * Returns a StateImpact that adds a crisis to a project.
 */
export function generateCrisis(project: Project, rng: RandomGenerator): StateImpact | null {
  const template = (rng && rng.pick ? rng.pick.bind(rng) : pick)(CRISIS_POOLS);
  if (!template) return null;

  const crisis: ActiveCrisis = {
    crisisId: (rng && rng.uuid ? rng.uuid.bind(rng) : (prefix) => `${prefix}-${Math.random()}`)('crisis'),
    triggeredWeek: 0, // Will be set by the coordinator or reducer
    haltedProduction: false,
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

/**
 * Weekly roll for a production crisis. 
 * Integrated into the WeekCoordinator pipeline.
 */
export function checkAndTriggerCrisis(project: Project, rng: RandomGenerator): StateImpact | null {
  // 3% base chance of a production crisis per week
  if ((rng && rng.next ? rng.next() : Math.random()) < 0.03) {
    return generateCrisis(project, rng);
  }
  return null;
}

/**
 * Resolves a crisis through player (or AI) choice.
 * Always returns a deterministic impact based on the selected option.
 */
export function resolveCrisis(state: GameState, projectId: string, optionIndex: number, rng: RandomGenerator): StateImpact {
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
    projectUpdate.buzz = Math.max(0, (project.buzz || 0) - option.buzzPenalty);
  }

  impact.projectUpdates!.push({
    projectId,
    update: projectUpdate
  });

  if (option.removeTalentId) {
    impact.removeContracts!.push(`${projectId}:${option.removeTalentId}`);
  }

  impact.newHeadlines!.push({
    id: (rng && rng.uuid ? rng.uuid.bind(rng) : (prefix) => `${prefix}-${Math.random()}`)('hl'),
    week: state.week,
    category: 'general',
    text: `Crisis resolved for "${project.title}": ${option.text}`
  });

  impact.newsEvents!.push({
    id: (rng && rng.uuid ? rng.uuid.bind(rng) : (prefix) => `${prefix}-${Math.random()}`)('news'),
    week: state.week,
    type: 'CRISIS',
    headline: `Crisis at ${project.title}`,
    description: `The production faced a major setback: ${project.activeCrisis.description.slice(0, 100)}... Studio resolved it by: ${option.text}`,
  });

  return impact;
}
