import { GameState, Project } from '../../types';
import { evaluateProjectCrises } from '../production/crisisEvaluator';
import { advanceProjectProgress } from '../production/progressCalculator';

/**
 * PURE ORCHESTRATOR: Do not add inline game logic here.
 * Delegate to /production/ helper functions.
 */
export function processProduction(state: GameState): GameState {
  const updatedProjects = state.projects.active.map((project: Project) => {
    // Only process active productions
    if (project.state !== 'production') return project;

    // 1. Evaluate any new or ongoing crises
    let updatedProject = evaluateProjectCrises(project, state.game.currentWeek);
    
    // 2. Advance progress and burn budget based on crisis state
    updatedProject = advanceProjectProgress(updatedProject);

    return updatedProject;
  });

  return { 
    ...state, 
    projects: { 
      ...state.projects, 
      active: updatedProjects 
    } 
  };
}
