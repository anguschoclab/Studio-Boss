import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { applyStateImpact } from '../storeUtils';
import * as projectsEngine from '@/engine/systems/projects';
import { updateCultureFromProject } from '@/engine/systems/culture';
import { negotiateContract } from '@/engine/systems/buyers';
import { RandomGenerator } from '@/engine/utils/rng';
import { Project, GameState, ProjectContractType, StateImpact } from '@/engine/types';

export interface ProjectWorkflowSlice {
  greenlightProject: (projectId: string) => void;
  pitchProject: (projectId: string, buyerId: string, contractType: ProjectContractType) => Promise<boolean>;
  _updateProjectToProduction: (state: GameState, projectId: string, project: Project, headlineText: string, extraProjectUpdates?: Partial<Project>) => void;
}

export const createProjectWorkflowSlice: StateCreator<GameStore, [], [], ProjectWorkflowSlice> = (set, get) => ({
  greenlightProject: async (projectId) => {
    const state = get().gameState;
    if (!state) return;

    const project = state.entities.projects[projectId];
    if (!project) return;

    if (project.state !== 'needs_greenlight') return;

    const { project: updatedProject, update } = projectsEngine.executeGreenlight(project);

    get()._updateProjectToProduction(
      state,
      projectId,
      updatedProject,
      update
    );
  },

  pitchProject: async (projectId, buyerId, contractType) => {
    const state = get().gameState;
    if (!state) return false;

    const project = state.entities.projects[projectId];
    const buyer = state.market.buyers.find(b => b.id === buyerId);

    if (!project || !buyer) return false;

    const rng = new RandomGenerator(state.rngState);
    const allProjects = state.entities.projects;
    const success = negotiateContract(project, buyer, contractType, state.week, allProjects, rng);

    if (success) {
      const { project: updatedProject, update } = projectsEngine.executePitching(project, buyer.name, contractType);

      const distributionStatus = buyer.archetype === 'streamer' ? 'streaming' : 'theatrical';
      let upfrontPayment = 0;
      if (contractType === 'upfront') {
        upfrontPayment = Math.floor(project.budget * 1.1);
      }

      get()._updateProjectToProduction(
        state,
        projectId,
        updatedProject,
        update,
        { 
          buyerId, 
          contractType, 
          distributionStatus,
          revenue: project.revenue + upfrontPayment
        }
      );

      if (upfrontPayment > 0) {
        get().addFunds(upfrontPayment);
      }
    }

    if (success) {
      set({ gameState: { ...get().gameState!, rngState: rng.getState() } });
    }
    return success;
  },

  _updateProjectToProduction: (state, projectId, project, headlineText, extraProjectUpdates = {}) => {
    const newCulture = state.studio.culture ? updateCultureFromProject(state.studio.culture, project) : undefined;
    const rng = new RandomGenerator(state.rngState);
    
    const impacts: StateImpact[] = [
      {
        type: 'PROJECT_UPDATED',
        payload: {
          projectId: project.id,
          update: {
            ...project,
            state: 'production' as const,
            weeksInPhase: 0,
            ...extraProjectUpdates
          }
        }
      },
      {
        type: 'NEWS_ADDED',
        payload: {
          id: rng.uuid('NWS'),
          headline: headlineText,
          description: `Strategic shift: ${project.title} enters production.`
        }
      }
    ];

    const newState = applyStateImpact(state, impacts);
    
    set({
      gameState: {
        ...newState,
        studio: {
          ...newState.studio,
          culture: newCulture
        },
        rngState: rng.getState()
      }
    });
  }
});
