import { create } from 'zustand';
import { GameState, WeekSummary, ArchetypeKey, FinanceState, NewsState } from '@/engine/types';
import { initializeGame } from '@/engine/core/gameInit';
import { advanceWeek } from '@/engine/core/weekAdvance';
import { RandomGenerator } from '@/engine/utils/rng';
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
  _isProcessingTick: boolean;
  _isSaving: boolean;
  _saveNextState: GameState | null;

  newGame: (studioName: string, archetype: ArchetypeKey) => Promise<void>;
  doAdvanceWeek: () => WeekSummary | null;
  saveToSlot: (slot: number) => Promise<void>;
  loadFromSlot: (slot: number) => Promise<boolean>;
  getSaveSlots: () => Promise<SaveSlotInfo[]>;
  clearGame: () => void;
  devAutoInit: (archetype?: ArchetypeKey) => void;
}

const INITIAL_FINANCE: FinanceState = {
  cash: 0,
  ledger: [],
  weeklyHistory: [],
  marketState: {
    cycle: 'STABLE',
    sentiment: 0,
    baseRate: 0.05,
    debtRate: 0.08,
    savingsYield: 0.02,
    loanRate: 0.08,
    rateHistory: []
  }
};
const INITIAL_NEWS: NewsState = { headlines: [] };

export const useGameStore = create<GameStore>((set, get, ...args) => ({
  gameState: null,
  _isProcessingTick: false,
  _isSaving: false,
  _saveNextState: null,

  ...createProjectSlice(set, get, ...args),
  ...createFinanceSlice(set, get, ...args),
  ...createTalentSlice(set, get, ...args),
  ...createRivalSlice(set, get, ...args),
  ...createNewsSlice(set, get, ...args),
  ...createSnapshotSlice(set, get, ...args),

  newGame: async (studioName, archetype) => {
    const seed = Math.floor(Math.random() * 1_000_000);
    const gameState = initializeGame(studioName, archetype, seed);
    await saveGame(0, gameState);
    set({ 
      gameState,
      finance: gameState.finance,
      news: gameState.news
    });
  },

  doAdvanceWeek: () => {
    if (get()._isProcessingTick) {
        console.warn('[GameStore] Tick already in progress, skipping...');
        return null;
    }

    const state = get().gameState;
    if (!state) throw new Error('No game in progress');

    set({ _isProcessingTick: true });

    try {
        const rng = new RandomGenerator((state.gameSeed || 12345) + (state.tickCount || 0));
        const { newState: nextState, summary, impacts } = advanceWeek(state, rng);
        const finalState = nextState as GameState;

        // Queue background save (Latest-Only pattern)
        const triggerSave = async (stateToSave: GameState) => {
            if (get()._isSaving) {
                set({ _saveNextState: stateToSave });
                return;
            }

            set({ _isSaving: true, _saveNextState: null });
            await saveGame(0, stateToSave);
            set({ _isSaving: false });

            // If a new save was queued while we were saving, trigger it now.
            const next = get()._saveNextState;
            if (next) {
                triggerSave(next);
            }
        };

        triggerSave(finalState);
        
        set({ 
          gameState: finalState,
          finance: finalState.finance,
          news: finalState.news,
          _isProcessingTick: false
        });

        // --- Modal Queue Integration ---
        const ui = useUIStore.getState();

        if (impacts && impacts.length > 0) {
          const modalImpacts = impacts.filter(imp => imp.type === 'MODAL_TRIGGERED');
          if (modalImpacts.length > 0) {
            const sortedModalImpacts = [...modalImpacts].sort((a, b) => (b.payload.priority || 0) - (a.payload.priority || 0));
            for (const imp of sortedModalImpacts) {
              ui.enqueueModal(imp.payload.modalType, imp.payload.payload as Record<string, unknown>);
            }
          }
        }

        if (summary && summary.fromWeek % 52 === 0 && summary.fromWeek > 0) {
          get().captureSnapshot();
        }

        return summary;
    } catch (e) {
        set({ _isProcessingTick: false });
        throw e;
    }
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
        finance: INITIAL_FINANCE,
        news: INITIAL_NEWS
    };
  }),

  devAutoInit: (archetype = 'major') => {
    const seed = 42; // Constant seed for predictable dev testing
    const gameState = initializeGame('Alpha Studios', archetype, seed);
    set({ 
      gameState,
      finance: gameState.finance,
      news: gameState.news
    });
  },
}));
