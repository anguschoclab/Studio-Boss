import { create } from 'zustand';
import { GameState, WeekSummary, ProjectFormat, BudgetTierKey, ArchetypeKey, TvFormatKey, ReleaseModelKey, ProjectContractType } from '@/engine/types';
import { negotiateContract } from '@/engine/systems/buyers';
import { initializeGame } from '@/engine/core/gameInit';
import { advanceWeek } from '@/engine/core/weekAdvance';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { saveGame, loadGame, getSaveSlots, SaveSlotInfo } from '@/persistence/saveLoad';
import { randRange } from '@/engine/utils';

interface CreateProjectParams {
  title: string;
  format: ProjectFormat;
  genre: string;
  budgetTier: BudgetTierKey;
  targetAudience: string;
  flavor: string;
  attachedTalentIds?: string[];
  tvFormat?: TvFormatKey;
  episodes?: number;
  releaseModel?: ReleaseModelKey;
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
}


function getFilmStats(tier: typeof BUDGET_TIERS[keyof typeof BUDGET_TIERS]) {
  return {
    budget: tier.budget,
    weeklyCost: tier.weeklyCost,
    developmentWeeks: tier.developmentWeeks,
    productionWeeks: tier.productionWeeks,
    renewable: false,
  };
}

function getTvStats(tier: typeof BUDGET_TIERS[keyof typeof BUDGET_TIERS], tvFormatData: typeof TV_FORMATS[keyof typeof TV_FORMATS], episodes: number) {
  const weeklyCost = tier.weeklyCost * tvFormatData.productionCostMultiplier;
  const productionWeeks = Math.ceil(episodes * tvFormatData.productionWeeksPerEpisode);

  return {
    weeklyCost,
    productionWeeks,
    developmentWeeks: Math.ceil(tier.developmentWeeks * tvFormatData.developmentWeeksModifier),
    budget: weeklyCost * productionWeeks + (tier.budget * 0.2), // Rough budget estimate
    renewable: tvFormatData.renewable,
  };
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

    const stats = params.format === 'tv' && params.tvFormat && params.episodes
      ? getTvStats(tier, TV_FORMATS[params.tvFormat], params.episodes)
      : getFilmStats(tier);

    const { budget, weeklyCost, developmentWeeks, productionWeeks, renewable } = stats;

    // Calculate talent costs
    const attachedTalentIds = params.attachedTalentIds || [];
    const attachedTalent = attachedTalentIds
      .map(id => state.talentPool.find(t => t.id === id))
      .filter(t => t !== undefined);

    const talentFees = attachedTalent.reduce((sum, t) => sum + (t?.fee || 0), 0);
    const totalBudget = budget + talentFees;

    const projectId = crypto.randomUUID();

    const newContracts = attachedTalent.map(t => ({
      id: `contract-${crypto.randomUUID()}`,
      talentId: t.id,
      projectId,
      fee: t.fee,
      backendPercent: t.prestige > 80 ? 10 : 0,
    }));

    const project = {
      id: projectId,
      ...params,
      budget: totalBudget,
      weeklyCost,
      status: 'development' as const,
      buzz: Math.floor(randRange(30, 70)),
      weeksInPhase: 0,
      developmentWeeks,
      productionWeeks,
      revenue: 0,
      weeklyRevenue: 0,
      releaseWeek: null,
      season: params.format === 'tv' ? 1 : undefined,
      episodesReleased: params.format === 'tv' ? 0 : undefined,
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
      episodes: opp.episodes,
      releaseModel: opp.releaseModel,
    };

    // Remove the opportunity from the list
    const newOpportunities = state.opportunities.filter(o => o.id !== opportunityId);
    set({ gameState: { ...state, opportunities: newOpportunities } });

    // Re-use the createProject function
    get().createProject(params);
  },
  renewProject: (id: string) => {
    const state = get().gameState;
    if (!state) return;

    set({
      gameState: {
        ...state,
        projects: state.projects.map((p) => {
          if (p.id === id && p.format === 'tv' && p.renewable && p.season !== undefined) {
            return {
              ...p,
              status: 'development',
              weeksInPhase: 0,
              season: p.season + 1,
              revenue: 0,
              weeklyRevenue: 0,
              releaseWeek: null,
              episodesReleased: 0,
            };
          }
          return p;
        }),
      },
    });
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


  pitchProject: (projectId, buyerId, contractType) => {
    const state = get().gameState;
    if (!state) return false;

    const projectIndex = state.projects.findIndex(p => p.id === projectId);
    const buyer = state.buyers.find(b => b.id === buyerId);

    if (projectIndex === -1 || !buyer) return false;

    const project = state.projects[projectIndex];
    const success = negotiateContract(project, buyer, contractType);

    if (success) {
      const updatedProjects = [...state.projects];
      updatedProjects[projectIndex] = {
        ...project,
        status: 'production',
        weeksInPhase: 0,
        buyerId,
        contractType
      };

      const headlineText = `${buyer.name} officially picks up "${project.title}" on a ${contractType} deal.`;

      set({
        gameState: {
          ...state,
          projects: updatedProjects,
          headlines: [{ id: `ph-${crypto.randomUUID()}`, text: headlineText, week: state.week, category: 'market' as const }, ...state.headlines].slice(0, 50)
        }
      });
    }

    return success;
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
}));
