import { create } from 'zustand';
import { GameState, WeekSummary, ArchetypeKey } from '@/engine/types';
import { initializeGame } from '@/engine/core/gameInit';
import { advanceWeek } from '@/engine/core/weekAdvance';
import { saveGame, loadGame, getSaveSlots, SaveSlotInfo } from '@/persistence/saveLoad';
import { useUIStore } from './uiStore';

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
  logNewsEvent: (event: Omit<import('@/engine/types').NewsEvent, 'id' | 'week'>) => void;
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

    // 1. Crises/Scandals (Must be handled first)
    // We check for new crises triggered this week
    finalState.studio.internal.projects.forEach(p => {
      if (p.activeCrisis && !p.activeCrisis.resolved) {
        const isNewCrisis = summary?.events.some(e => e.includes(`CRISIS: "${p.title}"`));
        if (isNewCrisis) {
          ui.enqueueModal('CRISIS', { projectId: p.id, crisis: p.activeCrisis });
        }
      }
    });

    // 2. Awards Ceremony (Specific weeks)
    const isAwardsWeek = finalState.week % 52 === 4 || finalState.week % 52 === 36;
    if (isAwardsWeek) {
      const year = Math.floor(finalState.week / 52) + 1;
      const currentAwards = finalState.industry.awards?.filter(a => a.year === year) || [];
      ui.enqueueModal('AWARDS', { week: finalState.week, year, awards: currentAwards });
    }

    // 3. Week Summary (Final report)
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

  logNewsEvent: (event) => {
    set((s) => {
      if (!s.gameState) return s;
      
      const newEvent = {
        ...event,
        id: `ne-${crypto.randomUUID()}`,
        week: s.gameState.week
      };

      const history = s.gameState.industry.newsHistory || [];
      
      return {
        gameState: {
          ...s.gameState,
          industry: {
            ...s.gameState.industry,
            newsHistory: [newEvent, ...history].slice(0, 100) // Keep last 100 events
          }
        }
      };
    });
  }
}));
