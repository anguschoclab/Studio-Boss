import { create } from 'zustand';
import { GameState, WeekSummary, ArchetypeKey, NewsState, ModalType } from '@/engine/types';
import { saveGame, loadGame, getSaveSlots, SaveSlotInfo } from '@/persistence/saveLoad';
import { useUIStore } from './uiStore';

import { createProjectSlice, ProjectSlice } from './slices/projectSlice';
import { createFinanceSlice, FinanceSlice } from './slices/financeSlice';
import { createTalentSlice, TalentSlice } from './slices/talentSlice';
import { createRivalSlice, RivalSlice } from './slices/rivalSlice';
import { createNewsSlice, NewsSlice } from './slices/newsSlice';
import { createSnapshotSlice, SnapshotSlice } from './slices/snapshotSlice';
import { createMarketingSlice, MarketingSlice } from './slices/marketingSlice';
import { DEFAULT_FINANCE_STATE } from './selectors';

export interface GameStore extends ProjectSlice, FinanceSlice, TalentSlice, RivalSlice, NewsSlice, SnapshotSlice, MarketingSlice {
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

const INITIAL_FINANCE = DEFAULT_FINANCE_STATE;
const INITIAL_NEWS: NewsState = { headlines: [] };

// Check if running in Electron environment
const isElectron = typeof window !== 'undefined' && 'electronAPI' in window;

// Initialize Web Worker (used in renderer process)
const engineWorker = new Worker(new URL('../engine/engine.worker.ts', import.meta.url), { type: 'module' });

// Module-level background save queue
let _saveQueue: GameState | null = null;
let _isBackgroundSaving = false;

// Shared background save queue handler (used by both Electron IPC and Web Worker paths)
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

interface Impact {
  type: string;
  payload: {
    modalType: ModalType;
    priority?: number;
    payload?: Record<string, unknown>;
  };
}

// Shared modal processing logic
const processModals = (impacts: Impact[]) => {
  if (typeof useUIStore.getState !== 'function') return;
  const ui = useUIStore.getState();
  if (impacts && impacts.length > 0) {
    const modalImpacts = impacts.filter(imp => imp.type === 'MODAL_TRIGGERED');
    
    if (modalImpacts.length > 0) {
      modalImpacts.sort((a, b) => (b.payload.priority || 0) - (a.payload.priority || 0));
      for (let i = 0; i < modalImpacts.length; i++) {
        const imp = modalImpacts[i];
        ui.enqueueModal(imp.payload.modalType, imp.payload.payload || null);
      }
    }
  }
};

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
  ...createMarketingSlice(set, get, ...args),

  newGame: (studioName: string, archetype: ArchetypeKey) => {
    const seed = Math.floor(Math.random() * 1_000_000);
    
    return new Promise<void>((resolve) => {
      const initElectron = async () => {
        if (isElectron && window.electronAPI) {
          try {
            const gameState = await window.electronAPI.initGame(studioName, archetype, seed);
            if (gameState) {
              const state = gameState as GameState;
              saveGame(0, state);
              set({ 
                gameState: state,
                finance: state.finance,
                news: state.news
              });
              resolve();
              return true;
            }
          } catch (e) {
            console.error('Electron IPC init-game failed, falling back to worker:', e);
          }
        }
        return false;
      };

      initElectron().then((success) => {
        if (success) return;

        // Fallback to Web Worker
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
    });
  },

  doAdvanceWeek: () => {
    if (get()._isProcessingTick) {
        return Promise.resolve(null);
    }

    const state = get().gameState;
    if (!state) return Promise.reject(new Error('No game in progress'));

    set({ _isProcessingTick: true });

    return new Promise<WeekSummary | null>((resolve, reject) => {
      const advanceElectron = async () => {
        if (isElectron && window.electronAPI) {
          try {
            const result = await window.electronAPI.advanceWeek(state);
            if (result) {
              const { newState: nextState, summary, impacts } = result as { newState: GameState, summary: WeekSummary, impacts: Impact[] };
              const finalState = nextState;

              triggerSave(finalState);
              
              set({ 
                gameState: finalState,
                finance: finalState.finance,
                news: finalState.news,
                _isProcessingTick: false
              });

              processModals(impacts);

              if (summary && summary.fromWeek % 52 === 0 && summary.fromWeek > 0) {
                get().captureSnapshot();
              }

              resolve(summary);
              return true;
            }
          } catch (e) {
            console.error('Electron IPC advance-week failed, falling back to worker:', e);
          }
        }
        return false;
      };

      advanceElectron().then((success) => {
        if (success) return;

        // Fallback to Web Worker
        const handler = async (e: MessageEvent) => {
          if (e.data.type === 'ADVANCE_RESULT') {
            try {
              const { newState: nextState, summary, impacts } = e.data.payload;
              const finalState = nextState as GameState;

              triggerSave(finalState);
              
              set({ 
                gameState: finalState,
                finance: finalState.finance,
                news: finalState.news,
                _isProcessingTick: false
              });

              processModals(impacts);

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
