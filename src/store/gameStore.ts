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
  ...createSnapshotSlice(set, get, ...args),

  newGame: (studioName, archetype) => {
    set(() => {
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
    const crisisTitles = new Set<string>();
    if (summary?.events) {
      for (let i = 0; i < summary.events.length; i++) {
        const ev = summary.events[i];
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
      for (const key in projects) {
        const p = projects[key];
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
      const currentAwards = [];
      for (let i = 0; i < allAwards.length; i++) {
        if (allAwards[i].year === year) {
          currentAwards.push(allAwards[i]);
        }
      }
      ui.enqueueModal('AWARDS', { week: finalState.week, year, awards: currentAwards });
    }

    // 3. Week Summary
    ui.enqueueModal('SUMMARY', summary);

    // 4. Yearly Snapshot (Sprint G)
    if (summary && (summary.fromWeek % 52 === 0) && summary.fromWeek > 0) {
      get().captureSnapshot();
      // Future Hook: trigger EndOfYearAwards system here
    }

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
