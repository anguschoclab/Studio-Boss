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
import { createNewsSlice, NewsSlice } from './slices/newsSlice';
import { createSnapshotSlice, SnapshotSlice } from './slices/snapshotSlice';

export interface GameStore extends ProjectSlice, FinanceSlice, TalentSlice, RivalSlice, NewsSlice, SnapshotSlice {
  gameState: GameState | null;
  newGame: (studioName: string, archetype: ArchetypeKey) => Promise<void>;
  doAdvanceWeek: () => WeekSummary;
  saveToSlot: (slot: number) => Promise<void>;
  loadFromSlot: (slot: number) => Promise<boolean>;
  getSaveSlots: () => Promise<SaveSlotInfo[]>;
  clearGame: () => void;
  devAutoInit: (archetype?: ArchetypeKey) => void;
}

const EMPTY_FINANCE = { cash: 0, ledger: [] };
const EMPTY_NEWS = { headlines: [] };

export const useGameStore = create<GameStore>((set, get, ...args) => ({
  gameState: null,

  ...createProjectSlice(set, get, ...args),
  ...createFinanceSlice(set, get, ...args),
  ...createTalentSlice(set, get, ...args),
  ...createRivalSlice(set, get, ...args),
  ...createNewsSlice(set, get, ...args),
  ...createSnapshotSlice(set, get, ...args),

  newGame: async (studioName, archetype) => {
    const gameState = initializeGame(studioName, archetype);
    await saveGame(0, gameState);
    set({ 
      gameState,
      finance: gameState.finance,
      news: gameState.news
    });
  },

  doAdvanceWeek: () => {
    const state = get().gameState;
    if (!state) throw new Error('No game in progress');

    const { newState: nextState, summary, impacts } = advanceWeek(state);
    const finalState = nextState as GameState;

    // Trigger background save without blocking UI (Fire and forget)
    saveGame(0, finalState);
    
    set({ 
      gameState: finalState,
      finance: finalState.finance,
      news: finalState.news
    });

    // --- Modal Queue Integration ---
    const ui = useUIStore.getState();

    // Process simulation impacts for UI triggers (Modals, etc.)
    if (impacts && impacts.length > 0) {
      // Filter modal triggers first, then sort
      const modalImpacts = impacts.filter(i => i.type === 'MODAL_TRIGGERED');

      const sortedImpacts = modalImpacts.sort((a, b) => {
        return ((b.payload as any).priority || 0) - ((a.payload as any).priority || 0);
      });

      for (const impact of sortedImpacts) {
        ui.enqueueModal((impact.payload as any).modalType, (impact.payload as any).payload as Record<string, unknown>);
      }
    }

    // 4. Yearly Snapshot (Sprint G)
    if (summary && summary.fromWeek % 52 === 0 && summary.fromWeek > 0) {
      get().captureSnapshot();
    }

    return summary;
  },

  saveToSlot: async (slot) => {
    const state = get().gameState;
    if (state) await saveGame(slot, state);
  },

  loadFromSlot: async (slot) => {
    const state = await loadGame(slot);
    if (state) {
      set({ 
        gameState: state,
        finance: state.finance,
        news: state.news
      });
      return true;
    }
    return false;
  },

  getSaveSlots: async () => await getSaveSlots(),

  clearGame: () => set((state) => {
    if (state.gameState === null) return state;
    return { 
        gameState: null,
        finance: EMPTY_FINANCE as any,
        news: EMPTY_NEWS as any
    } as any;
  }),

  devAutoInit: (archetype = 'major') => {
    const gameState = initializeGame('Alpha Studios', archetype);
    set({ 
      gameState,
      finance: gameState.finance,
      news: gameState.news
    });
  },
}));
