import { GameState, Project, StateImpact, ProjectUpdateImpact } from '@/engine/types';

/**
 * Strategy Pattern for Crisis Resolution (Target A3).
 * Each handler processes a specific type of impact from a crisis option.
 */
const CrisisHandlers: Record<string, (project: Project, option: any) => StateImpact[]> = {
  CASH: (project, option) => 
    option.cashPenalty ? [{ type: 'FUNDS_CHANGED', payload: { amount: -option.cashPenalty } }] : [],

  DELAY: (project, option) => 
    option.weeksDelay ? [{ 
      type: 'PROJECT_UPDATED', 
      payload: { projectId: project.id, update: { productionWeeks: (project.productionWeeks || 0) + option.weeksDelay } } 
    }] : [],

  BUZZ: (project, option) => 
    option.buzzPenalty ? [{ 
      type: 'PROJECT_UPDATED', 
      payload: { projectId: project.id, update: { buzz: Math.max(0, project.buzz - option.buzzPenalty) } } 
    }] : [],

  PRESTIGE: (project, option) => 
    option.reputationPenalty ? [{ type: 'PRESTIGE_CHANGED', payload: { amount: -option.reputationPenalty } }] : [],

  NEWS: (project, option) => [{
    type: 'NEWS_ADDED',
    payload: { 
      headline: `Crisis resolved for "${project.title}"`, 
      description: `Studio opted to: ${option.text}` 
    }
  }]
};

/**
 * Resolves a project crisis using the registered handlers.
 * Kept under 50 lines per mandate.
 */
export function resolveCrisisWithHandlers(state: GameState, projectId: string, optionIndex: number): StateImpact[] {
  const project = state.studio.internal.projects[projectId];
  if (!project?.activeCrisis || project.activeCrisis.resolved) return [];

  const option = project.activeCrisis.options[optionIndex];
  if (!option) return [];

  const rawImpacts = Object.values(CrisisHandlers).flatMap(handler => handler(project, option));
  
  // Merge all PROJECT_UPDATED impacts for this specific project into one
  const projectImpacts = rawImpacts.filter(
    (i): i is ProjectUpdateImpact => i.type === 'PROJECT_UPDATED' && i.payload.projectId === projectId
  );

  const mergedUpdate = projectImpacts.reduce<Partial<Project>>(
    (acc, i) => ({ ...acc, ...i.payload.update }),
    { activeCrisis: { ...project.activeCrisis, resolved: true } }
  );

  const otherImpacts = rawImpacts.filter(
    i => !(i.type === 'PROJECT_UPDATED' && (i as ProjectUpdateImpact).payload.projectId === projectId)
  );

  return [
    ...otherImpacts,
    { type: 'PROJECT_UPDATED', payload: { projectId, update: mergedUpdate } }
  ];
}
