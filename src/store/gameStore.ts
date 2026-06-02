import { create } from 'zustand';
import { GameState, WeekSummary, ArchetypeKey, FinanceState, NewsState } from '@/engine/types';
import { type StudioId, type ProjectId, type NewsId } from '@/engine/types/shared.types';
import { initializeGame } from '@/engine/core/gameInit';
import { advanceWeek } from '@/engine/core/weekAdvance';
import { saveGame, loadGame, getSaveSlots, SaveSlotInfo } from '@/persistence/saveLoad';
import { useUIStore, ModalType } from './uiStore';

const EMPTY_FINANCE = { cash: 0, ledger: [] };
const EMPTY_NEWS = { headlines: [] };

import { createProjectSlice, ProjectSlice } from './slices/projectSlice';
import { createFinanceSlice, FinanceSlice } from './slices/financeSlice';
import { createTalentSlice, TalentSlice } from './slices/talentSlice';
import { createRivalSlice, RivalSlice } from './slices/rivalSlice';
import { createNewsSlice, NewsSlice } from './slices/newsSlice';
import { createSnapshotSlice, SnapshotSlice } from './slices/snapshotSlice';
import { createLoanSlice, LoanSlice } from './slices/loanSlice';

/**
 * The main game store interface, combining multiple slices for state management.
 * Manages the top-level game state, week advancement, and persistence.
 */
export interface GameStore extends ProjectSlice, FinanceSlice, TalentSlice, RivalSlice, NewsSlice, SnapshotSlice, LoanSlice {
  /** The current game state object. Null if no game is in progress. */
  gameState: GameState | null;
  /** Initializes a new game with the given studio name and archetype. */
  newGame: (studioName: string, archetype: ArchetypeKey) => Promise<void>;
  /** Advances the game world by one week, resolving all systems and projects. */
  doAdvanceWeek: () => WeekSummary;
  /** Saves the current game state to a specific slot. */
  saveToSlot: (slot: number) => Promise<void>;
  /** Loads the game state from a specific slot. */
  loadFromSlot: (slot: number) => Promise<boolean>;
  /** Retrieves metadata for all available save slots. */
  getSaveSlots: () => Promise<SaveSlotInfo[]>;
  /** Clears the current game state from the store. */
  clearGame: () => void;
  /** Developer utility to automatically initialize a game for testing. */
  devAutoInit: (archetype?: ArchetypeKey) => void;
}

// The Tech Supervisor: Background save queue using a decoupled while-loop to avoid tail-call recursion/memory leaks
const saveQueue: GameState[] = [];
let isSaving = false;
const processSaveQueue = async () => {
  if (isSaving) return;
  isSaving = true;
  while (saveQueue.length > 0) {
    const stateToSave = saveQueue.shift();
    if (stateToSave) {
      try {
        await saveGame(0, stateToSave);
      } catch (err) {
        console.error('[GameStore] Background autosave failed:', err);
      }
    }
  }
  isSaving = false;
};

export const useGameStore = create<GameStore>((set, get, ...args) => ({
  gameState: null,

  ...createProjectSlice(set, get, ...args),
  ...createFinanceSlice(set, get, ...args),
  ...createTalentSlice(set, get, ...args),
  ...createRivalSlice(set, get, ...args),
  ...createNewsSlice(set, get, ...args),
  ...createSnapshotSlice(set, get, ...args),
  ...createLoanSlice(set, get, ...args),

  newGame: async (studioName, archetype) => {
    const gameState = initializeGame(studioName, archetype, Date.now()); // Added seed
    await saveGame(0, gameState);
    set({ 
      gameState,
      finance: gameState.finance as any, // Cast for slice compatibility
      news: gameState.news
    });
  },

  doAdvanceWeek: () => {
    let summary: WeekSummary | null = null;
    let nextState: GameState | null = null;
    let weekImpacts: import('@/engine/types').StateImpact[] = [];

    set((state) => {
      if (!state.gameState) throw new Error('No game in progress');
      const result = advanceWeek(state.gameState);
      summary = result.summary;
      nextState = result.newState;
      weekImpacts = result.impacts;

      if (state.gameState === result.newState) return state; 

      // The Tech Supervisor: Queue the save in the decoupled while-loop worker
      saveQueue.push(result.newState);
      processSaveQueue();
      
      // The Tech Supervisor: Maintain strict object references for unchanged slices
      const newStateObj: Partial<GameStore> = { gameState: result.newState };
      if (state.finance !== result.newState.finance) {
        newStateObj.finance = result.newState.finance as any;
      }
      if (state.news !== result.newState.news) {
        newStateObj.news = result.newState.news as any;
      }

      return newStateObj;
    });

    if (!summary || !nextState) throw new Error('Failed to advance week');

    // --- Modal Queue Integration ---
    // Route all MODAL_TRIGGERED impacts from the engine pipeline to the UI modal queue.
    // This covers: CRISIS, AWARDS, SUMMARY, UPFRONTS, FESTIVAL_MARKET, BIDDING_WAR,
    // BREAKOUT_BIDDING_WAR, REBOOT_OPPORTUNITY, RELEASE_STRATEGY, DIRECTORS_CUT_AVAILABLE,
    // ACHIEVEMENT_UNLOCKED, GAME_OVER, PACKAGE_DEAL_OFFERED, and CASTING_CONSTRAINT.
    const ui = useUIStore.getState();
    for (const impact of weekImpacts) {
      if (impact.type === 'MODAL_TRIGGERED') {
        const { modalType, ...rest } = impact.payload as { modalType: string; [key: string]: unknown };
        ui.enqueueModal(modalType as ModalType, rest);
      }
    }

    // Yearly Snapshot (Sprint G)
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
