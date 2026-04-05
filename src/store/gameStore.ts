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

            // Queue background save
            const triggerSave = async (stateToSave: GameState) => {
                if (get()._isSaving) {
                    set({ _saveNextState: stateToSave });
                    return;
                }

                set({ _isSaving: true, _saveNextState: null });
                await saveGame(0, stateToSave);
                set({ _isSaving: false });

                const next = get()._saveNextState;
                if (next) triggerSave(next);
            };

            triggerSave(finalState);
            
            set({ 
              gameState: finalState,
              finance: finalState.finance,
              news: finalState.news,
              _isProcessingTick: false
            });

            // Modals
            const ui = useUIStore.getState();
            if (impacts && impacts.length > 0) {
              const modalImpacts = impacts.filter((imp: any) => imp.type === 'MODAL_TRIGGERED');
              if (modalImpacts.length > 0) {
                const sortedModalImpacts = [...modalImpacts].sort((a, b) => (b.payload.priority || 0) - (a.payload.priority || 0));
                for (const imp of sortedModalImpacts) {
                  ui.enqueueModal(imp.payload.modalType, imp.payload.payload as Record<string, unknown>);
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
