import { create } from 'zustand';
import { GameState, WeekSummary, ArchetypeKey, NewsEvent } from '@/engine/types/index';
import { initializeGame } from '@/engine/core/gameInit';
import { advanceWeek } from '@/engine/core/weekAdvance';
import { saveGame, loadGame, getSaveSlots, SaveSlotInfo } from '@/persistence/saveLoad';
import { useUIStore } from './uiStore';

import { createProjectSlice, ProjectSlice } from './slices/projectSlice';
import { createFinanceSlice, FinanceSlice } from './slices/financeSlice';
import { createTalentSlice, TalentSlice } from './slices/talentSlice';
import { createRivalSlice, RivalSlice } from './slices/rivalSlice';
import { createNewsSlice, NewsSlice } from './slices/newsSlice';

export interface GameStore extends ProjectSlice, FinanceSlice, TalentSlice, RivalSlice, NewsSlice {
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
  ...createNewsSlice(set, get, ...args),

  newGame: (studioName, archetype) => {
    set((s) => {
      const gameState = initializeGame(studioName, archetype);
      saveGame(0, gameState);
      return { gameState };
    });
  },

  doAdvanceWeek: () => {
    let summary: WeekSummary | null = null;
    let nextState: GameState | null = null;

    set((state) => {
      if (!state.gameState) throw new Error('No game in progress');
      const result = advanceWeek(state.gameState);
      summary = result.summary;
      nextState = result.newState;

      if (state.gameState === result.newState) return state; // Prevent unnecessary re-renders

      saveGame(0, result.newState);
      return { gameState: result.newState };
    });

    if (!summary || !nextState) throw new Error('Failed to advance week');

    // --- Modal Queue Integration ---
    const ui = useUIStore.getState();

    const finalState = nextState as GameState;

    // 1. Crises/Scandals
    finalState.studio.internal.projects.forEach(p => {
      if (p.activeCrisis && !p.activeCrisis.resolved) {
        const isNewCrisis = summary?.events.some(e => e.includes(`CRISIS: "${p.title}"`));
        if (isNewCrisis) {
          ui.enqueueModal('CRISIS', { projectId: p.id, crisis: p.activeCrisis });
        }
      }
    });

    // 2. Awards Ceremony
    const isAwardsWeek = finalState.week % 52 === 4 || finalState.week % 52 === 36;
    if (isAwardsWeek) {
      const year = Math.floor(finalState.week / 52) + 1;
      const currentAwards = finalState.industry.awards?.filter(a => a.year === year) || [];
      ui.enqueueModal('AWARDS', { week: finalState.week, year, awards: currentAwards });
    }

    // 3. Week Summary
    ui.enqueueModal('SUMMARY', summary);

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
