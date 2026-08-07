import { StateCreator } from "zustand";
import { NewsEvent, Headline, NewsState } from "@/engine/types";
import { GameStore } from "../gameStore";

export interface NewsSlice {
  news: NewsState;
  logNewsEvent: (event: Omit<NewsEvent, "id" | "week">) => void;
  addHeadline: (headline: Partial<Headline>) => void;
  appendNewsEvents: (events: NewsEvent[]) => void;
}

export const createNewsSlice: StateCreator<GameStore, [], [], NewsSlice> = (set, _get) => ({
  news: {
    headlines: [],
  },

  logNewsEvent: (event) => {
    set((s) => {
      if (!s.gameState) return s;

      const history = s.gameState.industry.newsHistory || [];
      const newEvent = {
        ...event,
        id: `ne-${s.gameState.week}-${history.length}`,
        week: s.gameState.week,
        type: event.type || "STUDIO_EVENT",
        headline: event.headline || "",
        description: event.description || "",
      } as NewsEvent;

      return {
        gameState: {
          ...s.gameState,
          industry: {
            ...s.gameState.industry,
            newsHistory: [newEvent, ...history].slice(0, 100),
          },
        },
      };
    });
  },

  addHeadline: (h) => {
    set((s) => {
      if (!s.gameState) return s;

      const newHeadline: Headline = {
        id: h.id || `hl-${s.gameState.week}-${s.news.headlines.length}`,
        week: h.week || s.gameState.week,
        category: h.category || "general",
        type: h.type || "STUDIO_EVENT",
        headline: h.headline || "",
        description: h.description || "",
      } as unknown as Headline;

      const headlines = [newHeadline, ...s.news.headlines].slice(0, 50);

      return {
        news: {
          ...s.news,
          headlines,
        },
        gameState: {
          ...s.gameState,
          news: {
            ...s.gameState.news,
            headlines,
          },
        },
      };
    });
  },

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
