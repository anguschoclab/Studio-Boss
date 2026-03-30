import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { CreateProjectParams, buildProjectAndContracts, applyStateImpact } from '../storeUtils';
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
  _updateProjectToProduction: (state: GameState, projectId: string, project: Project, headlineText: string, extraProjectUpdates?: Partial<Project>) => void;
  resolveProjectCrisis: (projectId: string, optionIndex: number) => void;
  exploitFranchise: (projectId: string) => void;
  submitToFestival: (projectId: string, festivalBody: AwardBody) => void;
  launchAwardsCampaign: (projectId: string, budget: number) => void;
  lockMarketingCampaign: (projectId: string, level: 'none' | 'basic' | 'blockbuster') => void;
  addProject: (project: any) => void;
  advanceProjectPhase: (projectId: string, newStatus: string) => void;
}

export const createProjectSlice: StateCreator<GameStore, [], [], ProjectSlice> = (set, get) => ({
  createProject: (params) => {
    set((s) => {
      if (!s.gameState) return s;
      const { project, newContracts, talentFees } = buildProjectAndContracts(s.gameState, params);
      
      return {
        gameState: applyStateImpact(s.gameState, {
          cashChange: -talentFees,
          projectUpdates: [], // We are adding a new project
          newHeadlines: [], 
        }) as any // Temporarily casting while finalizing applyStateImpact features
      };
    });
    
    // Explicitly add the project and contracts since applyStateImpact is for updates
    set(s => {
      if (!s.gameState) return s;
      const { project, newContracts } = buildProjectAndContracts(s.gameState, params);
      return {
        gameState: {
          ...s.gameState,
          studio: {
            ...s.gameState.studio,
            internal: {
              ...s.gameState.studio.internal,
              projects: { ...s.gameState.studio.internal.projects, [project.id]: project },
              contracts: [...s.gameState.studio.internal.contracts, ...newContracts]
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

      const p = state.studio.internal.projects[id];
      if (!p) return s;



      if ((p.format === 'tv' || p.format === 'unscripted') && p.renewable && p.season !== undefined) {
        return {
          gameState: applyStateImpact(state, {
            projectUpdates: [{
              projectId: id,
              update: {
                status: 'development',
                weeksInPhase: 0,
                season: p.season + 1,
                revenue: 0,
                weeklyRevenue: 0,
                releaseWeek: null,
                episodesReleased: 0,
              }
            }]
          })
        };
      }
      return s;
    });
  },

  _updateProjectToProduction: (state, projectId, project, headlineText, extraProjectUpdates = {}) => {
    const newCulture = state.studio.culture ? updateCultureFromProject(state.studio.culture, project) : undefined;
    
    const impact = {
      projectUpdates: [{
        projectId: project.id,
        update: {
          ...project,
          status: 'production' as const,
          weeksInPhase: 0,
          ...extraProjectUpdates
        }
      }],
      newHeadlines: [{ id: `ph-${crypto.randomUUID()}`, text: headlineText, week: state.week, category: 'market' as const }]
    };

    const newState = applyStateImpact(state, impact);
    
    set({
      gameState: {
        ...newState,
        studio: {
          ...newState.studio,
          culture: newCulture
        }
      }
    });
  },

  greenlightProject: async (projectId) => {
    const projectsEngine = await import('@/engine/systems/projects');
    const state = get().gameState;
    if (!state) return;

    const project = state.studio.internal.projects[projectId];
      if (!project) return;



    if (project.status !== 'needs_greenlight') return;

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

    const project = state.studio.internal.projects[projectId];

    const buyer = state.market.buyers.find(b => b.id === buyerId);

    if (!project || !buyer) return false;


    const success = negotiateContract(project, buyer, contractType);

    if (success) {
      const projectsEngine = await import('@/engine/systems/projects');
      const { project: updatedProject, update } = projectsEngine.executePitching(project, buyer.name, contractType);

      get()._updateProjectToProduction(
        state,
        projectId,
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

    const project = state.studio.internal.projects[projectId];
    if (!project) return;

    const spinoffParams = exploitIP(project, state);
    if (!spinoffParams) return;

    get().createProject(spinoffParams as any);
  },

  resolveProjectCrisis: (projectId, optionIndex) => {
    const state = get().gameState;
    if (!state) return;

    const project = state.studio.internal.projects[projectId];
    if (!project) return;

    const impact = resolveCrisis(project, optionIndex);
    const newState = applyStateImpact(state, impact);
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
      const project = s.gameState.studio.internal.projects[projectId];
      if (!project) return;

      const impact = launchAwardsCampaign(project, budget);
      const newState = applyStateImpact(s.gameState, impact);
      return { gameState: newState };
    });
  },

  lockMarketingCampaign: (projectId, level) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const project = state.studio.internal.projects[projectId];
      if (!project) return;
      
      let cost = 0;
      let buzzGain = 0;

      if (level === 'basic') {
        cost = Math.floor(project.budget * 0.10);
        buzzGain = 15;
      } else if (level === 'blockbuster') {
        cost = Math.floor(project.budget * 0.50);
        buzzGain = 40;
      }

      return {
        gameState: applyStateImpact(state, {
          cashChange: -cost,
          projectUpdates: [{
            projectId,
            update: {
              marketingLevel: level,
              marketingBudget: cost,
              buzz: Math.min(100, project.buzz + buzzGain),
              status: project.status === 'marketing' ? 'released' : project.status
            }
          }]
        })
      };
    });
  },

  addProject: (project) => {
    set((s) => {
      if (!s.gameState) return s;
      return {
        gameState: {
          ...s.gameState,
          studio: {
            ...s.gameState.studio,
            internal: {
              ...s.gameState.studio.internal,
              projects: { ...s.gameState.studio.internal.projects, [project.id]: project }
            }
          }
        }
      };
    });
  },

  advanceProjectPhase: (projectId, newStatus) => {
    set((s) => {
      if (!s.gameState) return s;
      return {
        gameState: applyStateImpact(s.gameState, {
          projectUpdates: [{
            projectId,
            update: { status: newStatus as any }
          }]
        })
      };
    });
  }
});
