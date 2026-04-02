import { create } from 'zustand';
import { GameState, WeekSummary, ArchetypeKey, FinanceState, NewsState } from '@/engine/types';
import { initializeGame } from '@/engine/core/gameInit';
import { advanceWeek } from '@/engine/core/weekAdvance';
import { saveGame, loadGame, getSaveSlots, SaveSlotInfo } from '@/persistence/saveLoad';
import { useUIStore } from './uiStore';

const EMPTY_FINANCE = { cash: 0, ledger: [] };
const EMPTY_NEWS = { headlines: [] };

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
    let summary: WeekSummary | null = null;
    let nextState: GameState | null = null;

    set((state) => {
      if (!state.gameState) throw new Error('No game in progress');
      const result = advanceWeek(state.gameState);
      summary = result.summary;
      nextState = result.newState;

      if (state.gameState === result.newState) return state; 

      // Trigger background save without blocking UI (Fire and forget)
      saveGame(0, result.newState);
      
      return { 
        gameState: result.newState,
        finance: result.newState.finance,
        news: result.newState.news
      };
    });

    if (!summary || !nextState) throw new Error('Failed to advance week');

    // --- Modal Queue Integration ---
    const ui = useUIStore.getState();
    const resultImpacts = finalState.finance.ledger.length > 0 ? [] : []; // We need a way to get the impacts from advanceWeek

    // Actually, doAdvanceWeek gets the full state. 
    // We should probably have advanceWeek return the impacts too, OR 
    // just rely on the fact that WeekCoordinator already pushed them.
    // 
    // Wait, advanceWeek calls WeekCoordinator.execute.
    // Let's check advanceWeek's return signature.

    // 4. Yearly Snapshot (Sprint G)
    if (summary && ((summary as any).fromWeek % 52 === 0) && (summary as any).fromWeek > 0) {
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
        finance: EMPTY_FINANCE as unknown as any,
        news: EMPTY_NEWS as unknown as any
    };
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
