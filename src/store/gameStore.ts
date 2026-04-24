import { create } from 'zustand';
import { GameState, WeekSummary, ArchetypeKey, Award } from '@/engine/types';
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
import { createLoanSlice, LoanSlice } from './slices/loanSlice';

export interface GameStore extends ProjectSlice, FinanceSlice, TalentSlice, RivalSlice, NewsSlice, SnapshotSlice, LoanSlice {
  gameState: GameState | null;
  newGame: (studioName: string, archetype: ArchetypeKey) => Promise<void>;
  doAdvanceWeek: () => WeekSummary;
  saveToSlot: (slot: number) => Promise<void>;
  loadFromSlot: (slot: number) => Promise<boolean>;
  getSaveSlots: () => Promise<SaveSlotInfo[]>;
  clearGame: () => void;
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

    set((state) => {
      if (!state.gameState) throw new Error('No game in progress');
      const result = advanceWeek(state.gameState);
      summary = result.summary;
      nextState = result.newState;

      if (state.gameState === result.newState) return state; 

      // The Tech Supervisor: Queue the save in the decoupled while-loop worker
      saveQueue.push(result.newState);
      processSaveQueue();
      
      // ⚡ The Tech Supervisor: Optimize Zustand selectors by maintaining strict object references for all slices
      const newStateObj: Partial<GameStore> = { gameState: result.newState };
      if (state.finance !== result.newState.finance) {
        newStateObj.finance = result.newState.finance as any;
      }
      if (state.news !== result.newState.news) {
        newStateObj.news = result.newState.news as any;
      }
      if (state.projects !== result.newState.entities.projects) {
        newStateObj.projects = result.newState.entities.projects as any;
      }
      if (state.talents !== result.newState.entities.talents) {
        newStateObj.talents = result.newState.entities.talents as any;
      }
      if (state.rivals !== result.newState.entities.rivals) {
        newStateObj.rivals = result.newState.entities.rivals as any;
      }

      return newStateObj;
    });

    if (!summary || !nextState) throw new Error('Failed to advance week');

    // --- Modal Queue Integration ---
    const ui = useUIStore.getState();
    const finalState = nextState as GameState;

    // 1. Crises/Scandals
    const crisisTitles = new Set<string>();
    const summaryCast = summary as WeekSummary;
    if (summaryCast?.events) {
      const events = summaryCast.events as string[];
      for (let i = 0; i < events.length; i++) {
        const ev = events[i];
        if (ev.startsWith('CRISIS: "')) {
          const firstQuote = ev.indexOf('"');
          const secondQuote = ev.indexOf('"', firstQuote + 1);
          if (firstQuote !== -1 && secondQuote !== -1) {
            crisisTitles.add(ev.substring(firstQuote + 1, secondQuote));
          }
        }
      }
    }

    if (crisisTitles.size > 0) {
      const projects = finalState.studio.internal.projects;
      // ⚡ The Tech Supervisor: Optimize for...in with Object.values iteration
      const projectValues = Object.values(projects);
      for (let i = 0; i < projectValues.length; i++) {
        const p = projectValues[i];
        if (p.activeCrisis && !p.activeCrisis.resolved && crisisTitles.has(p.title)) {
          ui.enqueueModal('CRISIS', { projectId: p.id, crisis: p.activeCrisis });
        }
      }
    }

    // 2. Awards Ceremony
    const isAwardsWeek = finalState.week % 52 === 4 || finalState.week % 52 === 36;
    if (isAwardsWeek) {
      const year = Math.floor(finalState.week / 52) + 1;
      const allAwards = finalState.industry.awards || [];
      // ⚡ The Tech Supervisor: O(1) reverse traversal with push/reverse to avoid O(N^2) unshift in loop
      const currentAwards: Award[] = [];
      for (let i = allAwards.length - 1; i >= 0; i--) {
        if (allAwards[i].year === year) {
          currentAwards.push(allAwards[i]);
        } else if (allAwards[i].year < year) {
          break;
        }
      }
      currentAwards.reverse();
      ui.enqueueModal('AWARDS', { week: finalState.week, year, awards: currentAwards });
    }

    // 3. Week Summary
    ui.enqueueModal('SUMMARY', summary);

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
