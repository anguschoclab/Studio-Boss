import { handleReleasePhaseEntry } from '@/engine/systems/projects';
import { create } from 'zustand';
import { GameState, WeekSummary, ProjectFormat, BudgetTierKey, ArchetypeKey, TvFormatKey, UnscriptedFormatKey, ReleaseModelKey, ProjectContractType, Project } from '@/engine/types';
import { negotiateContract } from '@/engine/systems/buyers';
import { initializeGame } from '@/engine/core/gameInit';
import { advanceWeek } from '@/engine/core/weekAdvance';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { UNSCRIPTED_FORMATS } from '@/engine/data/unscriptedFormats';
import { saveGame, loadGame, getSaveSlots, SaveSlotInfo } from '@/persistence/saveLoad';
import { resolveCrisis } from '@/engine/systems/crises';
import { exploitIP } from '@/engine/systems/franchises';
import { randRange } from '@/engine/utils';

export interface CreateProjectParams {
  title: string;
  format: ProjectFormat;
  genre: string;
  budgetTier: BudgetTierKey;
  targetAudience: string;
  flavor: string;
  attachedTalentIds?: string[];
  tvFormat?: TvFormatKey;
  unscriptedFormat?: UnscriptedFormatKey;
  episodes?: number;
  releaseModel?: ReleaseModelKey;
  parentProjectId?: string;
  isSpinoff?: boolean;
  initialBuzzBonus?: number;
}

interface GameStore {
  gameState: GameState | null;
  newGame: (studioName: string, archetype: ArchetypeKey) => void;
  doAdvanceWeek: () => WeekSummary;
  createProject: (params: CreateProjectParams) => void;
  acquireOpportunity: (opportunityId: string) => void;
  renewProject: (id: string) => void;
  saveToSlot: (slot: number) => void;
  loadFromSlot: (slot: number) => boolean;
  getSaveSlots: () => SaveSlotInfo[];
  clearGame: () => void;
  signContract: (talentId: string, projectId: string) => void;
  pitchProject: (projectId: string, buyerId: string, contractType: ProjectContractType) => boolean;
  greenlightProject: (projectId: string) => void;
  launchMarketingCampaign: (projectId: string, budget: number, domesticPct: number, angle: string) => void;
  _updateProjectToProduction: (state: GameState, projectIndex: number, project: Project, headlineText: string, extraProjectUpdates?: Partial<Project>) => void;
  resolveProjectCrisis: (projectId: string, optionIndex: number) => void;
  exploitFranchise: (projectId: string) => void;
}


import { getFilmStats, getTvStats, getUnscriptedStats } from '@/engine/systems/stats';


function getProjectStats(params: CreateProjectParams, tier: typeof BUDGET_TIERS[keyof typeof BUDGET_TIERS]) {
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

  // O(1) lookup map for talent
  const talentMap = new Map(state.talentPool.map(t => [t.id, t]));
  const attachedTalent = ids.reduce((acc, id) => {
    const t = talentMap.get(id);
    if (t) acc.push(t);
    return acc;
  }, [] as typeof state.talentPool);

  const talentFees = attachedTalent.reduce((sum, t) => sum + (t?.fee || 0), 0);

  const newContracts = attachedTalent.map(t => ({
    id: `contract-${crypto.randomUUID()}`,
    talentId: t.id,
    projectId,
    fee: t.fee,
    backendPercent: t.prestige > 80 ? 10 : 0,
  }));

  return { attachedTalent, talentFees, newContracts };
}
export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,

  newGame: (studioName, archetype) => {
    const gameState = initializeGame(studioName, archetype);
    set({ gameState });
    saveGame(0, gameState);
  },

  doAdvanceWeek: () => {
    const state = get().gameState;
    if (!state) throw new Error('No game in progress');
    const { newState, summary } = advanceWeek(state);
    set({ gameState: newState });
    saveGame(0, newState);
    return summary;
  },

  createProject: (params) => {
    const state = get().gameState;
    if (!state) return;

    const tier = BUDGET_TIERS[params.budgetTier];
    const stats = getProjectStats(params, tier);
    const { budget, weeklyCost, developmentWeeks, productionWeeks, renewable } = stats;

    const projectId = crypto.randomUUID();
    const { talentFees, newContracts } = prepareTalentAndContracts(state, params.attachedTalentIds, projectId);

    const totalBudget = budget + talentFees;

    const initialBuzz = Math.floor(randRange(30, 70)) + (params.initialBuzzBonus || 0);
    const project = {
      id: projectId,
      ...params,
      budget: totalBudget,
      weeklyCost,
      status: 'development' as const,
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
    };

    set({
      gameState: {
        ...state,
        projects: [...state.projects, project],
        contracts: [...state.contracts, ...newContracts],
        cash: state.cash - talentFees // Deduct upfront talent fees immediately
      }
    });
  },


  acquireOpportunity: (opportunityId: string) => {
    const state = get().gameState;
    if (!state) return;

    const opp = state.opportunities.find(o => o.id === opportunityId);
    if (!opp) return;

    // First remove the opportunity and subtract cash
    const newOpportunities = state.opportunities.filter(o => o.id !== opportunityId);
    set({ gameState: { ...state, opportunities: newOpportunities, cash: state.cash - opp.costToAcquire } });

    // Convert opportunity to project parameters
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

    // Re-use the createProject function, it will get the updated state
    get().createProject(params);
  },
  renewProject: (id: string) => {
    const state = get().gameState;
    if (!state) return;

    const projectIndex = state.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) return;

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

      set({
        gameState: {
          ...state,
          projects: updatedProjects,
        },
      });
    }
  },

  saveToSlot: (slot) => {
    const state = get().gameState;
    if (state) saveGame(slot, state);
  },

  loadFromSlot: (slot) => {
    const state = loadGame(slot);
    if (state) {
      set({ gameState: state });
      return true;
    }
    return false;
  },

  getSaveSlots: () => getSaveSlots(),

  clearGame: () => set({ gameState: null }),



  _updateProjectToProduction: (state: GameState, projectIndex: number, project: Project, headlineText: string, extraProjectUpdates: Partial<Project> = {}) => {
    const updatedProjects = [...state.projects];
    updatedProjects[projectIndex] = {
      ...project,
      status: 'production',
      weeksInPhase: 0,
      ...extraProjectUpdates
    };

    set({
      gameState: {
        ...state,
        projects: updatedProjects,
        headlines: [{ id: `ph-${crypto.randomUUID()}`, text: headlineText, week: state.week, category: 'market' as const }, ...state.headlines].slice(0, 50)
      }
    });
  },


  launchMarketingCampaign: (projectId, budget, domesticPct, angle) => {
    const state = get().gameState;
    if (!state) return;

    if (budget > state.cash) return;

    set((s) => {
      const pIndex = s.gameState!.projects.findIndex(p => p.id === projectId);
      if (pIndex === -1) return;
      const p = s.gameState!.projects[pIndex];
      if (p.status !== 'marketing') return;

      s.gameState!.cash -= budget;
      s.gameState!.financeHistory.push({
        id: crypto.randomUUID(),
        week: s.gameState!.week,
        type: 'expense',
        amount: budget,
        category: 'marketing',
        description: `Marketing for "${p.title}"`
      });

      p.marketingBudget = budget;
      p.marketingDomesticSplit = domesticPct;
      p.marketingAngle = angle;

      // Marketing effectiveness
      let buzzBonus = Math.floor(budget / 100000) * 0.1; // small bump from raw spend
      if (budget >= p.budget * 0.5) buzzBonus += 10;
      if (budget >= p.budget) buzzBonus += 20;

      // Add synergy logic
      const genreToAngle: Record<string, string[]> = {
        'Action': ['spectacle', 'thrills'],
        'Comedy': ['humor'],
        'Drama': ['prestige', 'romance'],
        'Horror': ['thrills', 'mystery'],
        'Sci-Fi': ['spectacle', 'mystery'],
        'Romance': ['romance'],
      };

      const matched = genreToAngle[p.genre]?.includes(angle) ? 15 : -10;
      buzzBonus += matched;

      p.buzz = Math.min(100, Math.max(0, p.buzz + buzzBonus));

      // Use the logic from projects.ts to handle release entry
      const contracts = s.gameState!.contracts.filter(c => c.projectId === p.id);
      const talentMap = new Map(s.gameState!.talentPool.map(t => [t.id, t]));
      const result = handleReleasePhaseEntry(p, s.gameState!.week, s.gameState!.studio.prestige, contracts, talentMap);

      if (result.update) {
        s.gameState!.headlines.unshift({
          id: crypto.randomUUID(),
          week: s.gameState!.week,
          category: 'general',
          text: result.update
        });
      }
    });
  },

  greenlightProject: (projectId) => {
    const state = get().gameState;
    if (!state) return;

    const projectIndex = state.projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return;

    const project = state.projects[projectIndex];
    if (project.status !== 'needs_greenlight') return;

    get()._updateProjectToProduction(
      state,
      projectIndex,
      project,
      `"${project.title}" receives full greenlight and enters production.`
    );
  },

  pitchProject: (projectId, buyerId, contractType) => {
    const state = get().gameState;
    if (!state) return false;

    const projectIndex = state.projects.findIndex(p => p.id === projectId);
    const buyer = state.buyers.find(b => b.id === buyerId);

    if (projectIndex === -1 || !buyer) return false;

    const project = state.projects[projectIndex];
    const success = negotiateContract(project, buyer, contractType);

    if (success) {
      get()._updateProjectToProduction(
        state,
        projectIndex,
        project,
        `${buyer.name} officially picks up "${project.title}" on a ${contractType} deal.`,
        { buyerId, contractType }
      );
    }

    return success;
  },

  exploitFranchise: (projectId: string) => {
    const state = get().gameState;
    if (!state) return;

    const project = state.projects.find(p => p.id === projectId);
    if (!project) return;

    const spinoffParams = exploitIP(project, state);
    if (!spinoffParams) return;

    get().createProject(spinoffParams);
  },

  signContract: (talentId, projectId) => {
    const state = get().gameState;
    if (!state) return;

    const talent = state.talentPool.find(t => t.id === talentId);
    if (!talent) return;

    if (state.cash < talent.fee) return;

    const newContract = {
      id: `contract-${crypto.randomUUID()}`,
      talentId,
      projectId,
      fee: talent.fee,
      backendPercent: talent.prestige > 80 ? 10 : 0,
    };

    set({
      gameState: {
        ...state,
        cash: state.cash - talent.fee,
        contracts: [...state.contracts, newContract],
      },
    });
  },

  resolveProjectCrisis: (projectId, optionIndex) => {
    const state = get().gameState;
    if (!state) return;
    const newState = resolveCrisis(state, projectId, optionIndex);
    set({ gameState: newState });
  },
}));
