import { StateCreator } from 'zustand';
import { GameState, Project, AwardBody, ProjectContractType } from '@/engine/types';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { UNSCRIPTED_FORMATS } from '@/engine/data/unscriptedFormats';
import { getFilmStats, getTvStats, getUnscriptedStats } from '@/engine/systems/stats';
import { randRange } from '@/engine/utils';
import { ProductionEngine } from '@/engine/systems/productionEngine';
import { negotiateContract } from '@/engine/systems/buyers';
import { resolveCrisis } from '@/engine/systems/crises';
import { exploitIP } from '@/engine/systems/franchises';

export interface CreateProjectParams {
  title: string;
  format: 'film' | 'tv' | 'unscripted';
  genre: string;
  budgetTier: any;
  targetAudience: string;
  flavor: string;
  attachedTalentIds?: string[];
  tvFormat?: any;
  unscriptedFormat?: any;
  episodes?: number;
  releaseModel?: any;
  parentProjectId?: string;
  isSpinoff?: boolean;
  initialBuzzBonus?: number;
}

export interface ProjectSlice {
  createProject: (params: CreateProjectParams) => void;
  acquireOpportunity: (opportunityId: string) => void;
  renewProject: (id: string) => void;
  greenlightProject: (projectId: string) => void;
  pitchProject: (projectId: string, buyerId: string, contractType: ProjectContractType) => boolean;
  exploitFranchise: (projectId: string) => void;
  resolveProjectCrisis: (projectId: string, optionIndex: number) => void;
}

function getProjectStats(params: CreateProjectParams, tier: any) {
  if (params.format === 'tv' && params.tvFormat && params.episodes) {
    return getTvStats(tier, TV_FORMATS[params.tvFormat], params.episodes);
  } else if (params.format === 'unscripted' && params.unscriptedFormat && params.episodes) {
    return getUnscriptedStats(tier, UNSCRIPTED_FORMATS[params.unscriptedFormat], params.episodes);
  }
  return getFilmStats(tier);
}

function prepareTalentAndContracts(
  state: GameState,
  attachedTalentIds: string[] | undefined,
  projectId: string
) {
  const ids = attachedTalentIds || [];
  const talentMap = new Map(state.talentPool.map(t => [t.id, t]));

  const attachedTalent: any[] = [];
  let talentFees = 0;
  const newContracts: any[] = [];

  for (const id of ids) {
    const t = talentMap.get(id);
    if (t) {
      attachedTalent.push(t);
      talentFees += t.fee || 0;
      newContracts.push({
        id: `contract-${crypto.randomUUID()}`,
        talentId: t.id,
        projectId,
        fee: t.fee,
        backendPercent: t.prestige > 80 ? 10 : 0,
      });
    }
  }

  return { attachedTalent, talentFees, newContracts };
}

function buildProjectAndContracts(state: GameState, params: CreateProjectParams) {
  const tier = BUDGET_TIERS[params.budgetTier];
  const stats = getProjectStats(params, tier);
  const { budget, weeklyCost, developmentWeeks, productionWeeks, renewable } = stats;

  const projectId = crypto.randomUUID();
  const { talentFees, newContracts } = prepareTalentAndContracts(state, params.attachedTalentIds, projectId);

  const totalBudget = budget + talentFees;
  const initialBuzz = Math.floor(randRange(30, 70)) + (params.initialBuzzBonus || 0);

  const project: Project = {
    id: projectId,
    ...params,
    budget: totalBudget,
    weeklyCost,
    status: 'development',
    buzz: Math.min(100, initialBuzz),
    weeksInPhase: 0,
    developmentWeeks,
    productionWeeks,
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: null,
    season: (params.format === 'tv' || params.format === 'unscripted') ? 1 : undefined,
    episodesReleased: (params.format === 'tv' || params.format === 'unscripted') ? 0 : undefined,
    renewable,
  } as Project;

  return { project, newContracts, talentFees };
}

export const createProjectSlice: StateCreator<any, [], [], ProjectSlice> = (set, get) => ({
  createProject: (params) => {
    set((s: any) => {
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

  acquireOpportunity: (opportunityId) => {
    set((s: any) => {
      if (!s.gameState) return s;
      let opp: any;
      const newOpportunities = s.gameState.opportunities.filter((o: any) => {
        if (o.id === opportunityId) {
          opp = o;
          return false;
        }
        return true;
      });

      if (!opp) return s;

      const params: CreateProjectParams = {
        title: opp.title,
        format: opp.format,
        genre: opp.genre,
        budgetTier: opp.budgetTier,
        targetAudience: opp.targetAudience,
        flavor: opp.flavor,
        attachedTalentIds: opp.attachedTalentIds,
        tvFormat: opp.tvFormat,
        unscriptedFormat: opp.unscriptedFormat,
        episodes: opp.episodes,
        releaseModel: opp.releaseModel,
      };

      const { project, newContracts, talentFees } = buildProjectAndContracts(s.gameState, params);

      return {
        gameState: {
          ...s.gameState,
          opportunities: newOpportunities,
          projects: [...s.gameState.projects, project],
          contracts: [...s.gameState.contracts, ...newContracts],
          cash: s.gameState.cash - opp.costToAcquire - talentFees
        }
      };
    });
  },

  renewProject: (id) => {
    set((s: any) => {
      const state = s.gameState;
      if (!state) return s;
      const projectIndex = state.projects.findIndex((p: any) => p.id === id);
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
        return { gameState: { ...state, projects: updatedProjects } };
      }
      return s;
    });
  },

  greenlightProject: (projectId) => {
    const state = get().gameState;
    if (!state) return;
    const project = state.projects.find((p: any) => p.id === projectId);
    if (!project || project.status !== 'needs_greenlight') return;

    const { newState } = ProductionEngine.transitionToProduction(
      state,
      projectId,
      `"${project.title}" receives full greenlight and enters production.`
    );
    set({ gameState: newState });
  },

  pitchProject: (projectId, buyerId, contractType) => {
    const state = get().gameState;
    if (!state) return false;

    const project = state.projects.find((p: any) => p.id === projectId);
    const buyer = state.buyers.find((b: any) => b.id === buyerId);
    if (!project || !buyer) return false;

    const success = negotiateContract(project, buyer, contractType);
    if (success) {
      const { newState } = ProductionEngine.transitionToProduction(
        state,
        projectId,
        `${buyer.name} officially picks up "${project.title}" on a ${contractType} deal.`,
        { buyerId, contractType }
      );
      set({ gameState: newState });
    }
    return success;
  },

  exploitFranchise: (projectId) => {
    const state = get().gameState;
    if (!state) return;
    const project = state.projects.find((p: any) => p.id === projectId);
    if (!project) return;
    const spinoffParams = exploitIP(project, state);
    if (spinoffParams) get().createProject(spinoffParams as any);
  },

  resolveProjectCrisis: (projectId, optionIndex) => {
    const state = get().gameState;
    if (!state) return;
    const newState = resolveCrisis(state, projectId, optionIndex);
    set({ gameState: newState });
  },
});
