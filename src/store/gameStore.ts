import { create } from 'zustand';
import { GameState, WeekSummary, ArchetypeKey } from '@/engine/types';
import { initializeGame } from '@/engine/core/gameInit';
import { advanceWeek } from '@/engine/core/weekAdvance';
import { saveGame, loadGame, getSaveSlots, SaveSlotInfo } from '@/persistence/saveLoad';

import { createProjectSlice, ProjectSlice } from './slices/projectSlice';
import { createFinanceSlice, FinanceSlice } from './slices/financeSlice';
import { createTalentSlice, TalentSlice } from './slices/talentSlice';
import { createRivalSlice, RivalSlice } from './slices/rivalSlice';

export interface GameStore extends ProjectSlice, FinanceSlice, TalentSlice, RivalSlice {
  gameState: GameState | null;
  newGame: (studioName: string, archetype: ArchetypeKey) => void;
  doAdvanceWeek: () => WeekSummary;
  saveToSlot: (slot: number) => void;
  loadFromSlot: (slot: number) => boolean;
  getSaveSlots: () => SaveSlotInfo[];
  clearGame: () => void;
}

export const useGameStore = create<GameStore>((set, get, ...args) => ({
  gameState: null,

  ...createProjectSlice(set, get, ...args),
  ...createFinanceSlice(set, get, ...args),
  ...createTalentSlice(set, get, ...args),
  ...createRivalSlice(set, get, ...args),

  newGame: (studioName, archetype) => {
    set((s) => {
      const gameState = initializeGame(studioName, archetype);
      saveGame(0, gameState);
      return { gameState };
    });
  },

  doAdvanceWeek: () => {
    let summary: WeekSummary | null = null;

    set((state) => {
      if (!state.gameState) throw new Error('No game in progress');
      const result = advanceWeek(state.gameState);
      summary = result.summary;

      if (state.gameState === result.newState) return state; // Prevent unnecessary re-renders

      saveGame(0, result.newState);
      return { gameState: result.newState };
    });

    if (!summary) throw new Error('Failed to advance week');
    return summary;
  },

  saveToSlot: (slot) => {
    const state = get().gameState;
    if (state) saveGame(slot, state);
  },

  loadFromSlot: (slot) => {
    const state = loadGame(slot);
    if (state) {
      set((s) => {
        // Prevent unnecessary re-renders if state hasn't changed referentially
        if (s.gameState === state) return s;
        return { gameState: state };
      });
      return true;
    }
    return false;
  },

  getSaveSlots: () => getSaveSlots(),

  clearGame: () => set((state) => {
    if (state.gameState === null) return state;
    return { gameState: null };
  }),
}));
