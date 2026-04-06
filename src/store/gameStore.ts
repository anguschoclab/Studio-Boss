import { create } from 'zustand';
import { GameState, WeekSummary, ArchetypeKey, FinanceState, NewsState } from '@/engine/types';
import { saveGame, loadGame, getSaveSlots, SaveSlotInfo } from '@/persistence/saveLoad';
import { useUIStore } from './uiStore';

import { createProjectSlice, ProjectSlice } from './slices/projectSlice';
import { createFinanceSlice, FinanceSlice } from './slices/financeSlice';
import { createTalentSlice, TalentSlice } from './slices/talentSlice';
import { createRivalSlice, RivalSlice } from './slices/rivalSlice';
import { createNewsSlice, NewsSlice } from './slices/newsSlice';
import { createSnapshotSlice, SnapshotSlice } from './slices/snapshotSlice';
import { createCampaignSlice, CampaignSlice } from './slices/campaignSlice';

export interface GameStore extends ProjectSlice, FinanceSlice, TalentSlice, RivalSlice, NewsSlice, SnapshotSlice, CampaignSlice {
  gameState: GameState | null;
  _isProcessingTick: boolean;
  _isSaving: boolean;
  _saveNextState: GameState | null;

  newGame: (studioName: string, archetype: ArchetypeKey) => Promise<void>;
  doAdvanceWeek: () => Promise<WeekSummary | null>;
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

// Initialize Web Worker
const engineWorker = new Worker(new URL('../engine/engine.worker.ts', import.meta.url), { type: 'module' });

// Module-level background save queue
let _saveQueue: GameState | null = null;
let _isBackgroundSaving = false;

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
  ...createCampaignSlice(set, get, ...args),

  newGame: async (studioName: string, archetype: ArchetypeKey) => {
    const seed = Math.floor(Math.random() * 1_000_000);
    
    return new Promise<void>((resolve) => {
      const handler = (e: MessageEvent) => {
        if (e.data.type === 'INIT_RESULT') {
          const gameState = e.data.payload as GameState;
          saveGame(0, gameState);
          set({ 
            gameState,
            finance: gameState.finance,
            news: gameState.news
          });
          engineWorker.removeEventListener('message', handler);
          resolve();
        }
      };
      engineWorker.addEventListener('message', handler);
      engineWorker.postMessage({ type: 'INIT_GAME', payload: { studioName, archetype, seed } });
    });
  },

  doAdvanceWeek: async () => {
    if (get()._isProcessingTick) {
        console.warn('[GameStore] Tick already in progress, skipping...');
        return null;
    }

    const state = get().gameState;
    if (!state) throw new Error('No game in progress');

    set({ _isProcessingTick: true });

    return new Promise<WeekSummary | null>((resolve, reject) => {
      const handler = async (e: MessageEvent) => {
        if (e.data.type === 'ADVANCE_RESULT') {
          try {
            const { newState: nextState, summary, impacts } = e.data.payload;
            const finalState = nextState as GameState;

            // ⚡ Bolt: Refactored background save queue to use a module-level queue
            // bypassing Zustand completely. This prevents multiple cascading React re-renders per tick.
            const triggerSave = async (stateToSave: GameState) => {
                if (_isBackgroundSaving) {
                    _saveQueue = stateToSave;
                    return;
                }

                _isBackgroundSaving = true;
                _saveQueue = null;
                await saveGame(0, stateToSave);
                _isBackgroundSaving = false;

                if (_saveQueue) triggerSave(_saveQueue);
            };

            triggerSave(finalState);
            
            set({ 
              gameState: finalState,
              finance: finalState.finance,
              news: finalState.news,
              _isProcessingTick: false
            });

            // Modals
            // ⚡ Bolt: Refactored array filter and spread sort into a single-pass extraction loop to minimize memory allocations.
            const ui = useUIStore.getState();
            if (impacts && impacts.length > 0) {
              const modalImpacts = [];
              for (let i = 0; i < impacts.length; i++) {
                if (impacts[i].type === 'MODAL_TRIGGERED') {
                  modalImpacts.push(impacts[i]);
                }
              }
              if (modalImpacts.length > 0) {
                modalImpacts.sort((a, b) => ((b.payload as any).priority || 0) - ((a.payload as any).priority || 0));
                for (let i = 0; i < modalImpacts.length; i++) {
                  const imp = modalImpacts[i];
                  ui.enqueueModal((imp.payload as any).modalType, (imp.payload as any).payload as Record<string, unknown>);
                }
              }
            }

            if (summary && (summary as WeekSummary).fromWeek % 52 === 0 && (summary as WeekSummary).fromWeek > 0) {
              get().captureSnapshot();
            }

            engineWorker.removeEventListener('message', handler);
            resolve(summary as WeekSummary);
          } catch (err) {
            set({ _isProcessingTick: false });
            engineWorker.removeEventListener('message', handler);
            reject(err);
          }
        }
      };
      
      engineWorker.addEventListener('message', handler);
      engineWorker.postMessage({ type: 'ADVANCE_WEEK', payload: { state } });
    });
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
    const seed = 42;
    const handler = (e: MessageEvent) => {
      if (e.data.type === 'INIT_RESULT') {
        const gameState = e.data.payload;
        set({ 
          gameState,
          finance: gameState.finance,
          news: gameState.news
        });
        engineWorker.removeEventListener('message', handler);
      }
    };
    engineWorker.addEventListener('message', handler);
    engineWorker.postMessage({ type: 'INIT_GAME', payload: { studioName: 'Alpha Studios', archetype, seed } });
  },
}));
