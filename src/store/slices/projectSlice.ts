import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { CreateProjectParams, buildProjectAndContracts } from '../storeUtils';
import { handleReleasePhaseEntry } from '@/engine/systems/projects';
import { updateCultureFromProject } from '@/engine/systems/culture';
import { negotiateContract } from '@/engine/systems/buyers';
import { exploitIP } from '@/engine/systems/franchises';
import { resolveCrisis } from '@/engine/systems/crises';
import { submitToFestival } from '@/engine/systems/festivals';
import { launchAwardsCampaign } from '@/engine/systems/awards';
import { Project, GameState, AwardBody, ProjectContractType } from '@/engine/types';

export interface ProjectSlice {
  createProject: (params: CreateProjectParams) => void;
  renewProject: (id: string) => void;
  greenlightProject: (projectId: string) => void;
  pitchProject: (projectId: string, buyerId: string, contractType: ProjectContractType) => Promise<boolean>;
  _updateProjectToProduction: (state: GameState, projectIndex: number, project: Project, headlineText: string, extraProjectUpdates?: Partial<Project>) => void;
  resolveProjectCrisis: (projectId: string, optionIndex: number) => void;
  exploitFranchise: (projectId: string) => void;
  submitToFestival: (projectId: string, festivalBody: AwardBody) => void;
  launchAwardsCampaign: (projectId: string, budget: number) => void;
}

export const createProjectSlice: StateCreator<GameStore, [], [], ProjectSlice> = (set, get) => ({
  createProject: (params) => {
    set((s) => {
      if (!s.gameState) return s;

      const { project, newContracts, talentFees } = buildProjectAndContracts(s.gameState, params);

      return {
        gameState: {
          ...s.gameState,
          cash: s.gameState.cash - talentFees,
          studio: {
            ...s.gameState.studio,
            internal: {
              ...s.gameState.studio.internal,
              projects: [...s.gameState.studio.internal.projects, project],
              contracts: [...s.gameState.studio.internal.contracts, ...newContracts],
            }
          }
        }
      };
    });
  },

  renewProject: (id) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const projectIndex = state.studio.internal.projects.findIndex(p => p.id === id);
      if (projectIndex === -1) return s;

      const p = state.studio.internal.projects[projectIndex];
      if ((p.format === 'tv' || p.format === 'unscripted') && p.renewable && p.season !== undefined) {
        const updatedProjects = [...state.studio.internal.projects];
        updatedProjects[projectIndex] = {
          ...p,
          status: 'development',
          weeksInPhase: 0,
          season: p.season + 1,
          revenue: 0,
          weeklyRevenue: 0,
          releaseWeek: null,
          episodesReleased: 0,
        };

        return {
          gameState: {
            ...state,
            studio: {
              ...state.studio,
              internal: {
                ...state.studio.internal,
                projects: updatedProjects,
              }
            }
          },
        };
      }
      return s;
    });
  },

  _updateProjectToProduction: (state, projectIndex, project, headlineText, extraProjectUpdates = {}) => {
    const updatedProjects = [...state.studio.internal.projects];
    updatedProjects[projectIndex] = {
      ...project,
      status: 'production',
      weeksInPhase: 0,
      ...extraProjectUpdates
    };

    const newCulture = state.studio.culture ? updateCultureFromProject(state.studio.culture, project) : undefined;

    set({
      gameState: {
        ...state,
        studio: {
          ...state.studio,
          culture: newCulture,
          internal: {
            ...state.studio.internal,
            projects: updatedProjects,
          }
        },
        industry: {
          ...state.industry,
          headlines: [{ id: `ph-${crypto.randomUUID()}`, text: headlineText, week: state.week, category: 'market' as const }, ...state.industry.headlines].slice(0, 50)
        }
      }
    });
  },


  greenlightProject: async (projectId) => {
    const projectsEngine = await import('@/engine/systems/projects');
    const state = get().gameState;
    if (!state) return;

    const projectIndex = state.studio.internal.projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return;

    const project = state.studio.internal.projects[projectIndex];
    if (project.status !== 'needs_greenlight') return;

    const { project: updatedProject, update } = projectsEngine.executeGreenlight(project);

    get()._updateProjectToProduction(
      state,
      projectIndex,
      updatedProject,
      update
    );
  },

  pitchProject: async (projectId, buyerId, contractType) => {
    const state = get().gameState;
    if (!state) return false;

    const projectIndex = state.studio.internal.projects.findIndex(p => p.id === projectId);
    const buyer = state.market.buyers.find(b => b.id === buyerId);

    if (projectIndex === -1 || !buyer) return false;

    const project = state.studio.internal.projects[projectIndex];
    const success = negotiateContract(project, buyer, contractType);

    if (success) {
      const projectsEngine = await import('@/engine/systems/projects');
      const { project: updatedProject, update } = projectsEngine.executePitching(project, buyer.name, contractType);

      get()._updateProjectToProduction(
        state,
        projectIndex,
        updatedProject,
        update,
        { buyerId, contractType }
      );
    }

    return success;
  },

  exploitFranchise: (projectId) => {
    const state = get().gameState;
    if (!state) return;

    const project = state.studio.internal.projects.find(p => p.id === projectId);
    if (!project) return;

    const spinoffParams = exploitIP(project, state);
    if (!spinoffParams) return;

    get().createProject(spinoffParams as any);
  },

  resolveProjectCrisis: (projectId, optionIndex) => {
    const state = get().gameState;
    if (!state) return;
    const newState = resolveCrisis(state, projectId, optionIndex);
    set({ gameState: newState });
  },

  submitToFestival: (projectId, festivalBody) => {
    set((s) => {
      if (!s.gameState) return s;
      const newState = submitToFestival(s.gameState, projectId, festivalBody);
      return newState ? { gameState: newState } : s;
    });
  },

  launchAwardsCampaign: (projectId, budget) => {
    set((s) => {
      if (!s.gameState) return s;
      const newState = launchAwardsCampaign(s.gameState, projectId, budget);
      return newState ? { gameState: newState } : s;
    });
  }
});
