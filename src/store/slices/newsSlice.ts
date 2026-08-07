import { StateCreator } from "zustand";
import { NewsEvent } from "@/engine/types";
import { GameStore } from "../gameStore";

export interface NewsSlice {
  appendNewsEvents: (events: NewsEvent[]) => void;
}

export const createNewsSlice: StateCreator<GameStore, [], [], NewsSlice> = (set, _get) => ({
  appendNewsEvents: (events) => {
    set((s) => {
      if (!s.gameState) return s;

      const miniSummary = {
        fromWeek: s.gameState.week,
        toWeek: s.gameState.week,
        cashBefore: s.gameState.finance.cash,
        cashAfter: s.gameState.finance.cash,
        totalRevenue: 0,
        totalCosts: 0,
        projectUpdates: [],
        newHeadlines: events,
        newsEvents: events,
        events: [],
      };

      return {
        gameState: {
          ...s.gameState,
          weekSummaries: [
            ...(s.gameState.weekSummaries || []),
            miniSummary,
          ].slice(-200),
        },
      };
    });
  },
});
