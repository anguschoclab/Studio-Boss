import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { CreateProjectParams } from '../gameStore';
import { handleReleasePhaseEntry } from '@/engine/systems/projects';
import { buildProjectAndContracts } from '../gameStore';
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
  launchMarketingCampaign: (projectId: string, budget: number, domesticPct: number, angle: string) => Promise<void>;
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
          projects: [...s.gameState.projects, project],
          contracts: [...s.gameState.contracts, ...newContracts],
          cash: s.gameState.cash - talentFees
        }
      };
    });
  },

  renewProject: (id) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const projectIndex = state.projects.findIndex(p => p.id === id);
      if (projectIndex === -1) return s;

      const p = state.projects[projectIndex];
      if ((p.format === 'tv' || p.format === 'unscripted') && p.renewable && p.season !== undefined) {
        const updatedProjects = [...state.projects];
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
            projects: updatedProjects,
          },
        };
      }
      return s;
    });
  },

  _updateProjectToProduction: (state, projectIndex, project, headlineText, extraProjectUpdates = {}) => {
    const updatedProjects = [...state.projects];
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
          culture: newCulture
        },
        projects: updatedProjects,
        headlines: [{ id: `ph-${crypto.randomUUID()}`, text: headlineText, week: state.week, category: 'market' as const }, ...state.headlines].slice(0, 50)
      }
    });
  },

  launchMarketingCampaign: async (projectId, budget, domesticPct, angle) => {
    const projectsEngine = await import('@/engine/systems/projects');
    set((s) => {
      if (!s.gameState) return s;

      const state = s.gameState;
      if (budget > state.cash) return s;

      const pIndex = state.projects.findIndex(p => p.id === projectId);
      if (pIndex === -1) return s;

      const originalProject = state.projects[pIndex];
      if (originalProject.status !== 'marketing') return s;

      const newCash = state.cash - budget;

      const { project: p } = projectsEngine.executeMarketing(originalProject, budget, domesticPct, angle);

      const contracts = state.contracts.filter(c => c.projectId === p.id);
      const talentMap = new Map(state.talentPool.map(t => [t.id, t]));
      const result = handleReleasePhaseEntry(p, state.week, state.studio.prestige, contracts, talentMap);

      const newHeadlines = [...state.headlines];
      if (result.update) {
        newHeadlines.unshift({
          id: crypto.randomUUID(),
          week: state.week,
          category: 'general',
          text: result.update
        });
      }

      const updatedProjects = [...state.projects];
      updatedProjects[pIndex] = p;

      return {
        gameState: {
          ...state,
          cash: newCash,
          projects: updatedProjects,
          headlines: newHeadlines,
        }
      };
    });
  },

  greenlightProject: async (projectId) => {
    const projectsEngine = await import('@/engine/systems/projects');
    const state = get().gameState;
    if (!state) return;

    const projectIndex = state.projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return;

    const project = state.projects[projectIndex];
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

    const projectIndex = state.projects.findIndex(p => p.id === projectId);
    const buyer = state.buyers.find(b => b.id === buyerId);

    if (projectIndex === -1 || !buyer) return false;

    const project = state.projects[projectIndex];
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

    const project = state.projects.find(p => p.id === projectId);
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
