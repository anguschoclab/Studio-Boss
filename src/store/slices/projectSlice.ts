import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { CreateProjectParams, buildProjectAndContracts, applyStateImpact } from '../storeUtils';
import * as projectsEngine from '@/engine/systems/projects';
import { updateCultureFromProject } from '@/engine/systems/culture';
import { negotiateContract } from '@/engine/systems/buyers';
import { generateSpinoffProposal } from '@/engine/systems/ip/spinoffFactory';
import { calculateFranchiseFatigue } from '@/engine/systems/ip/fatigueEngine';
import { resolveCrisis } from '@/engine/systems/crises';
import * as festivalsEngine from '@/engine/systems/festivals';
import * as awardsEngine from '@/engine/systems/awards';
import { RandomGenerator } from '@/engine/utils/rng';
import { Project, GameState, AwardBody, ProjectContractType, MarketingCampaign, StateImpact, SeriesProject } from '@/engine/types';

export interface ProjectSlice {
  createProject: (params: CreateProjectParams) => void;
  renewProject: (id: string) => void;
  greenlightProject: (projectId: string) => void;
  pitchProject: (projectId: string, buyerId: string, contractType: ProjectContractType) => Promise<boolean>;
  _updateProjectToProduction: (state: GameState, projectId: string, project: Project, headlineText: string, extraProjectUpdates?: Partial<Project>) => void;
  resolveProjectCrisis: (projectId: string, optionIndex: number) => void;
  exploitFranchise: (projectId: string) => void;
  acquireAndRebootIP: (ipAssetId: string) => void;
  submitToFestival: (projectId: string, festivalBody: AwardBody) => void;
  launchAwardsCampaign: (projectId: string, budget: number) => void;
  lockMarketingCampaign: (projectId: string, level: 'none' | 'basic' | 'blockbuster') => void;
  addProject: (project: any) => void;
  advanceProjectPhase: (projectId: string, newState: string) => void;
  updateProject: (projectId: string, update: Partial<Project>) => void;
}

export const createProjectSlice: StateCreator<GameStore, [], [], ProjectSlice> = (set, get) => ({
  createProject: (params) => {
    set((s) => {
      if (!s.gameState) return s;
      const rng = new RandomGenerator(s.gameState.gameSeed + s.gameState.week + s.gameState.tickCount);
      const { talentFees } = buildProjectAndContracts(s.gameState, params, rng);
      
      return {
        gameState: applyStateImpact(s.gameState, {
          type: 'FUNDS_DEDUCTED',
          payload: { amount: talentFees }
        }) as any 
      };
    });
    
    set(s => {
      if (!s.gameState) return s;
      const rng = new RandomGenerator(s.gameState.gameSeed + s.gameState.week + s.gameState.tickCount);
      const { project, newContracts } = buildProjectAndContracts(s.gameState, params, rng);
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

      if (p.type === 'SERIES') {
        const tv = (p as SeriesProject).tvDetails;
        if (tv && tv.status === 'RENEWED') {
          const nextSeason = (tv.currentSeason || 1) + 1;
          return {
            gameState: applyStateImpact(state, [{
              type: 'PROJECT_UPDATED',
              payload: {
                projectId: id,
                update: {
                  state: 'development',
                  accumulatedCost: 0,
                  releaseWeek: null,
                  buzz: 0,
                  revenue: 0,
                  weeklyRevenue: 0,
                  weeksInPhase: 0,
                  developmentWeeks: 0,
                  productionWeeks: 0,
                  tvDetails: {
                    ...tv,
                    currentSeason: nextSeason,
                    episodesAired: 0,
                    status: 'IN_DEVELOPMENT'
                  }
                }
              }
            }]) as any
          };
        }
      }
      return s;
    });
  },

  _updateProjectToProduction: (state, projectId, project, headlineText, extraProjectUpdates = {}) => {
    const newCulture = state.studio.culture ? updateCultureFromProject(state.studio.culture, project) : undefined;
    const rng = new RandomGenerator(state.gameSeed + state.week + 17);
    
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
          id: rng.uuid('news-prod'),
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
        }
      } as any
    });
  },

  greenlightProject: async (projectId) => {
    const state = get().gameState;
    if (!state) return;

    const project = state.studio.internal.projects[projectId];
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

    const project = state.studio.internal.projects[projectId];
    const buyer = state.market.buyers.find(b => b.id === buyerId);

    if (!project || !buyer) return false;

    const rng = new RandomGenerator(state.gameSeed + state.week + state.tickCount);
    const allProjects = Object.values(state.studio.internal.projects);
    const success = negotiateContract(project, buyer, contractType, state.week, allProjects, rng);

    if (success) {
      const { project: updatedProject, update } = projectsEngine.executePitching(project, buyer.name, contractType);

      // Distribution Effects
      const distributionStatus = buyer.archetype === 'streamer' ? 'streaming' : 'theatrical';
      let upfrontPayment = 0;
      if (contractType === 'upfront') {
        upfrontPayment = Math.floor(project.budget * 1.1); // 10% profit margin for upfront
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

    return success;
  },

  exploitFranchise: (projectId) => {
    const state = get().gameState;
    if (!state) return;

    const project = state.studio.internal.projects[projectId];
    if (!project) return;

    let status: 'HEALTHY' | 'FATIGUED' | 'LEGACY' = 'HEALTHY';
    let relatedCount = 0;

    if (project.franchiseId && state.ip.franchises[project.franchiseId]) {
      const franchise = state.ip.franchises[project.franchiseId];
      relatedCount = franchise.assetIds.length;
      
      const genreSaturation = Object.values(state.studio.internal.projects).filter(p => p.genre === project.genre).length;
      const fatigue = calculateFranchiseFatigue(franchise, genreSaturation, project.genre);
      
      if (fatigue > 0.4) status = 'FATIGUED';
      
      const lastRelease = Math.max(...franchise.lastReleaseWeeks, 0);
      if (state.week - lastRelease > 520) status = 'LEGACY';
    }

    const spinoffParams = generateSpinoffProposal(project, status, relatedCount);
    
    const finalParams = {
      ...spinoffParams,
      franchiseId: project.franchiseId
    };

    get().createProject(finalParams as any);
  },

  acquireAndRebootIP: (ipAssetId) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const asset = state.ip.vault.find(a => a.id === ipAssetId);
      if (!asset || asset.rightsOwner !== 'MARKET') return s;

      if (state.finance.cash < asset.baseValue) {
        return s;
      }

      const rebootParams: CreateProjectParams = {
        title: `${asset.title}`,
        format: 'film',
        genre: 'DRAMA',
        budgetTier: asset.baseValue > 100000000 ? 'blockbuster' : 'high',
        targetAudience: 'GENERAL',
        flavor: 'reboot',
        franchiseId: asset.franchiseId,
        initialBuzzBonus: Math.floor(asset.decayRate * 50) + 20
      };

      const rng = new RandomGenerator(state.gameSeed + (state.week * 100));
      const { project, newContracts } = buildProjectAndContracts(state, rebootParams, rng);

      const impacts: StateImpact[] = [
        {
          type: 'FUNDS_DEDUCTED',
          payload: { amount: asset.baseValue }
        },
        {
          type: 'NEWS_ADDED',
          payload: {
            id: rng.uuid('ip-acq'),
            headline: `STUDIO ACQUIRES "${asset.title}" RIGHTS`,
            description: `Major industry shift as rights for the classic property return to production slate.`
          }
        }
      ];

      const intermediateState = applyStateImpact(state, impacts);

      return {
        gameState: {
          ...intermediateState,
          ip: {
            ...intermediateState.ip,
            vault: state.ip.vault.map(a => a.id === ipAssetId ? { ...a, rightsOwner: 'STUDIO' as const } : a)
          },
          studio: {
            ...intermediateState.studio,
            internal: {
              ...intermediateState.studio.internal,
              projects: { ...intermediateState.studio.internal.projects, [project.id]: project },
              contracts: [...intermediateState.studio.internal.contracts, ...newContracts]
            }
          }
        } as any
      };
    });
  },

  resolveProjectCrisis: (projectId, optionIndex) => {
    const state = get().gameState;
    if (!state) return;

    const project = state.studio.internal.projects[projectId];
    if (!project) return;

    const rng = new RandomGenerator(state.gameSeed + state.week + 88); 
    const impact = resolveCrisis(state, project.id, optionIndex, rng);
    const newState = applyStateImpact(state, impact);
    set({ gameState: newState as any });
  },

  submitToFestival: (projectId, festivalBody) => {
    set((s) => {
      if (!s.gameState) return s;
      const rng = new RandomGenerator(s.gameState.gameSeed + s.gameState.week + 99);
      const impact = festivalsEngine.submitToFestival(s.gameState, projectId, festivalBody, rng);
      if (!impact) return s;
      const newState = applyStateImpact(s.gameState, impact);
      return { gameState: newState as any };
    });
  },

  launchAwardsCampaign: (projectId, budget) => {
    set((s) => {
      if (!s.gameState) return s;
      const rng = new RandomGenerator(s.gameState.gameSeed + s.gameState.week + 111);
      const impact = awardsEngine.launchAwardsCampaign(s.gameState, projectId, budget, rng);
      if (!impact) return s;
      const newState = applyStateImpact(s.gameState, impact);
      return { gameState: newState as any };
    });
  },

  lockMarketingCampaign: (projectId, level) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const project = state.studio.internal.projects[projectId];
      if (!project) return s;
      
      let cost = 0;
      let buzzGain = 0;

      if (level === 'basic') {
        cost = Math.floor(project.budget * 0.10);
        buzzGain = 15;
      } else if (level === 'blockbuster') {
        cost = Math.floor(project.budget * 0.50);
        buzzGain = 40;
      }

      const campaign: MarketingCampaign = {
        primaryAngle: 'SELL_THE_STORY',
        domesticBudget: cost * 0.6,
        foreignBudget: cost * 0.4,
        weeksInMarketing: 1
      };

      return {
        gameState: applyStateImpact(state, [
          {
            type: 'FUNDS_DEDUCTED',
            payload: { amount: cost }
          },
          {
            type: 'PROJECT_UPDATED',
            payload: {
              projectId,
              update: {
                marketingLevel: level,
                marketingBudget: cost,
                marketingCampaign: campaign,
                buzz: Math.min(100, project.buzz + buzzGain),
                state: project.state === 'marketing' ? 'released' : project.state
              }
            }
          }
        ]) as any
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

  advanceProjectPhase: (projectId, newState) => {
    set((s) => {
      if (!s.gameState) return s;
      return {
        gameState: applyStateImpact(s.gameState, {
          type: 'PROJECT_UPDATED',
          payload: {
            projectId,
            update: { state: newState as any }
          }
        }) as any
      };
    });
  },

  updateProject: (projectId, update) => {
    set((s) => {
      if (!s.gameState) return s;
      return {
        gameState: applyStateImpact(s.gameState, {
          type: 'PROJECT_UPDATED',
          payload: {
            projectId,
            update
          }
        }) as any
      };
    });
  }
});
