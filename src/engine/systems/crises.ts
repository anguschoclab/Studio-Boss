import { pick } from '../utils';
import { Project, ActiveCrisis, GameState } from '@/engine/types';
import { StateImpact } from '../types/state.types';
import { CRISIS_POOLS } from '../data/crises.data';
import { RandomGenerator } from '../utils/rng';
import { BardResolver } from './bardResolver';

/**
 * Procedural Crisis Generation (Hardened)
 * Returns a StateImpact that adds a crisis to a project.
 */
export function generateCrisis(project: Project, rng: RandomGenerator): StateImpact | null {
  const template = pick(CRISIS_POOLS, rng);
  if (!template) return null;

  const crisis: ActiveCrisis = {
    id: rng.uuid('CRS'), 
    crisisId: template.id,       
    triggeredWeek: 0, 
    haltedProduction: false,
    description: BardResolver.resolve({
      domain: 'Crisis',
      subDomain: template.description, // e.g., 'PR' or 'Production'
      intensity: 75,
      context: { project: project.title },
      rng
    }),
    options: template.options.map(opt => ({
      ...opt,
      text: BardResolver.resolve({
        domain: 'Crisis',
        subDomain: `${template.description}.Options`, // e.g., 'PR.Options'
        variant: opt.text, // e.g., 'Aggressive'
        intensity: 50,
        rng
      })
    })),
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
export function checkAndTriggerCrisis(project: Project, state: GameState, rng: RandomGenerator): StateImpact | null {
  const studioProjectsCount = Object.keys(state.entities.projects || {}).length;
  const contractCount = Object.keys(state.entities.contracts || {}).length;
  // The PR Spin Doctor: Heavily scale crises with studio size
  // Adjusted: Base 5% chance, plus 5.0% for every concurrent project and 2.5% for every contract
  const baseChance = Math.min(0.8, 0.05 + (studioProjectsCount * 0.050) + (contractCount * 0.025));

  if (rng.next() < baseChance) {
    return generateCrisis(project, rng);
  }
  return null;
}

/**
 * Resolves a crisis through player (or AI) choice.
 * Always returns a deterministic impact based on the selected option.
 */
export function resolveCrisis(state: GameState, projectId: string, optionIndex: number, rng: RandomGenerator): StateImpact {
  const project = state.entities.projects[projectId];
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
    id: rng.uuid('NWS'),
    week: state.week,
    category: 'general',
    text: `Crisis resolved for "${project.title}": ${option.text}`
  });

  impact.newsEvents!.push({
    id: rng.uuid('NWS'),
    week: state.week,
    type: 'CRISIS',
    headline: `Crisis at ${project.title}`,
    description: `The production faced a major setback: ${project.activeCrisis.description.slice(0, 100)}... Studio resolved it by: ${option.text}`,
  });

  return impact;
}
