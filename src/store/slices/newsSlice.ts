import { StateCreator } from 'zustand';
import { NewsEvent } from '@/engine/types/index';
import { GameStore } from '../gameStore';

export interface NewsSlice {
  logNewsEvent: (event: Omit<NewsEvent, 'id' | 'week'>) => void;
}

export const createNewsSlice: StateCreator<GameStore, [], [], NewsSlice> = (set, get) => ({
  logNewsEvent: (event) => {
    set((s) => {
      if (!s.gameState) return s;
      
      const newEvent = {
        ...event,
        id: `ne-${crypto.randomUUID()}`,
        week: s.gameState.week
      };

      const history = s.gameState.industry.newsHistory || [];
      
      return {
        gameState: {
          ...s.gameState,
          industry: {
            ...s.gameState.industry,
            newsHistory: [newEvent, ...history].slice(0, 100) // Keep last 100 events
          }
        }
      };
    });
  }
});
