import { GameState, Project, Headline } from '../types';
import { updateCultureFromProject } from './culture';

export interface ProductionTransitionResult {
  newState: GameState;
  headline?: Headline;
}

export const ProductionEngine = {
  /**
   * Transitions a project to the production phase.
   */
  transitionToProduction(
    state: GameState,
    projectId: string,
    headlineText: string,
    extraProjectUpdates: Partial<Project> = {}
  ): ProductionTransitionResult {
    const projectIndex = state.studio.internal.projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return { newState: state };

    const project = state.studio.internal.projects[projectIndex];
    const updatedProjects = [...state.studio.internal.projects];
    updatedProjects[projectIndex] = {
      ...project,
      status: 'production',
      weeksInPhase: 0,
      ...extraProjectUpdates
    };

    const newCulture = state.studio.culture ? updateCultureFromProject(state.studio.culture, project) : undefined;
    const headline: Headline = {
      id: `ph-${crypto.randomUUID()}`,
      text: headlineText,
      week: state.week,
      category: 'market' as const
    };

    const newState: GameState = {
      ...state,
      studio: {
        ...state.studio,
        culture: newCulture,
        internal: {
          ...state.studio.internal,
          projects: updatedProjects
        }
      },
      industry: {
        ...state.industry,
        headlines: [headline, ...state.industry.headlines].slice(0, 50)
      }
    };

    return { newState, headline };
  },

  /**
   * Handles weekly budget burns and production specific logic.
   * (Currently many of these are in projects.ts, but can be moved here if they become more complex)
   */
  processProductionTick(project: Project): Project {
    // Placeholder for future complex production logic (e.g. daily rushes, reshoots)
    return project;
  }
};
