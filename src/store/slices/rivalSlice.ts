import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { executeAcquisition } from '@/engine/systems/mergers';

export interface RivalSlice {
  acquireRival: (targetId: string) => void;
}

export const createRivalSlice: StateCreator<GameStore, [], [], RivalSlice> = (set, get) => ({
  acquireRival: (targetId) => {
    set((s) => {
      if (!s.gameState) return s;
      return { gameState: executeAcquisition(s.gameState, targetId) };
    });
  },
});
