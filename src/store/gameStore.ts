import { create } from 'zustand';
import { GameState, WeekSummary, ArchetypeKey, ProjectContractType, AwardBody } from '@/engine/types';
import { initializeGame } from '@/engine/core/gameInit';
import { advanceWeek } from '@/engine/core/weekAdvance';
import { saveGame, loadGame, getSaveSlots, SaveSlotInfo } from '@/persistence/saveLoad';
import { launchAwardsCampaign } from '@/engine/systems/awards';
import { submitToFestival } from '@/engine/systems/festivals';

import { createProjectSlice, ProjectSlice } from './slices/projectSlice';
import { createFinanceSlice, FinanceSlice } from './slices/financeSlice';
import { createTalentSlice, TalentSlice } from './slices/talentSlice';
import { createRivalSlice, RivalSlice } from './slices/rivalSlice';

interface GameStore extends ProjectSlice, FinanceSlice, TalentSlice, RivalSlice {
  gameState: GameState | null;
  newGame: (studioName: string, archetype: ArchetypeKey) => void;
  doAdvanceWeek: () => WeekSummary;
  saveToSlot: (slot: number) => void;
  loadFromSlot: (slot: number) => boolean;
  getSaveSlots: () => SaveSlotInfo[];
  clearGame: () => void;
  // Re-exporting some specific actions that might be used directly or needed for composition
  submitToFestival: (projectId: string, festivalBody: AwardBody) => void;
  launchAwardsCampaign: (projectId: string, budget: number) => void;
}

export const useGameStore = create<GameStore>((set, get, ...args) => ({
  gameState: null,

  ...createProjectSlice(set, get, ...args),
  ...createFinanceSlice(set, get, ...args),
  ...createTalentSlice(set, get, ...args),
  ...createRivalSlice(set, get, ...args),

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
}));
