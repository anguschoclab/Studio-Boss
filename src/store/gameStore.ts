import { create } from 'zustand';
import { GameState, WeekSummary, ProjectFormat, BudgetTierKey, ArchetypeKey } from '@/engine/types';
import { initializeGame } from '@/engine/core/gameInit';
import { advanceWeek } from '@/engine/core/weekAdvance';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { saveGame, loadGame, getSaveSlots, SaveSlotInfo } from '@/persistence/saveLoad';
import { randRange } from '@/engine/utils';

interface CreateProjectParams {
  title: string;
  format: ProjectFormat;
  genre: string;
  budgetTier: BudgetTierKey;
  targetAudience: string;
  flavor: string;
}

interface GameStore {
  gameState: GameState | null;
  newGame: (studioName: string, archetype: ArchetypeKey) => void;
  doAdvanceWeek: () => WeekSummary;
  createProject: (params: CreateProjectParams) => void;
  saveToSlot: (slot: number) => void;
  loadFromSlot: (slot: number) => boolean;
  getSaveSlots: () => SaveSlotInfo[];
  clearGame: () => void;
  signContract: (talentId: string, projectId: string) => void;
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
    const project = {
      id: crypto.randomUUID(),
      ...params,
      budget: tier.budget,
      weeklyCost: tier.weeklyCost,
      status: 'development' as const,
      buzz: Math.floor(randRange(30, 70)),
      weeksInPhase: 0,
      developmentWeeks: tier.developmentWeeks,
      productionWeeks: tier.productionWeeks,
      revenue: 0,
      weeklyRevenue: 0,
      releaseWeek: null,
    };
    set({ gameState: { ...state, projects: [...state.projects, project] } });
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
