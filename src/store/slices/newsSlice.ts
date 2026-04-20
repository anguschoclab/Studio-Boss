import { StateCreator } from 'zustand';
import { NewsEvent, Headline, NewsState } from '@/engine/types';
import { GameStore } from '../gameStore';
import { type NewsId } from '@/engine/types/shared.types';

export interface NewsSlice {
  news: NewsState;
  logNewsEvent: (event: Omit<NewsEvent, 'id' | 'week'>) => void;
  addHeadline: (headline: Partial<Headline>) => void;
}

export const createNewsSlice: StateCreator<GameStore, [], [], NewsSlice> = (set, get) => ({
  news: {
    headlines: [],
  },

  logNewsEvent: (event) => {
    set((s) => {
      if (!s.gameState) return s;
      
      const newEvent = {
        ...event,
        id: `ne-${crypto.randomUUID()}` as NewsId,
        week: s.gameState.week,
        type: event.type || 'STUDIO_EVENT',
        headline: event.headline || '',
        description: event.description || ''
      } as NewsEvent;

      const history = s.gameState.industry.newsHistory || [];
      
      return {
        gameState: {
          ...s.gameState,
          industry: {
            ...s.gameState.industry,
            newsHistory: [newEvent, ...history].slice(0, 100)
          }
        }
      };
    });
  },

  addHeadline: (h) => {
    set((s) => {
      if (!s.gameState) return s;

      const newHeadline: Headline = {
        id: (h.id || crypto.randomUUID()) as NewsId,
        week: h.week || s.gameState.week,
        category: h.category || 'general',
        text: h.text || '',
      };

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
          }
        }
      };
    });
  }
});
