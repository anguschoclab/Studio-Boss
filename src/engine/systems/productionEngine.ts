import { GameState, Project, StateImpact } from '@/engine/types';

/**
 * Pure function to advance a single project's weekly production logic.
 * Handlers are kept under 50 lines per mandate.
 */
function tickProject(project: Project): StateImpact[] {
  if (project.state === 'archived' || project.state === 'released' || project.state === 'post_release') {
    return [];
  }

  const impacts: StateImpact[] = [];
  const nextWeeksInPhase = (project.weeksInPhase || 0) + 1;

  // 1. Progress Increment
  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: project.id,
      update: {
        weeksInPhase: nextWeeksInPhase,
        // Simple linear progress for now, will be refined in Phase B
        progress: Math.min(100, (nextWeeksInPhase / (project.productionWeeks || 20)) * 100)
      }
    }
  });

  return impacts;
}

/**
 * Unified Production Engine (Target A2).
 * Iterates over all projects (Player & Rivals) with identical math.
 */
export function tickProduction(state: GameState): StateImpact[] {
  const allImpacts: StateImpact[] = [];

  // 1. Player Projects
  const playerProjects = Object.values(state.studio.internal.projects);
  for (const project of playerProjects) {
    allImpacts.push(...tickProject(project));
  }

  // 2. Rival Projects
  for (const rival of state.industry.rivals) {
    const rivalProjects = Object.values(rival.projects || {});
    for (const project of rivalProjects) {
      allImpacts.push(...tickProject(project));
    }
  }

  return allImpacts;
}
