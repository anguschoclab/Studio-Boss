import { StateCreator } from 'zustand';
import { executeAcquisition } from '@/engine/systems/mergers';

export interface RivalSlice {
  acquireRival: (targetId: string) => void;
}

export const createRivalSlice: StateCreator<any, [], [], RivalSlice> = (set, get) => ({
  acquireRival: (targetId) => {
    set((s: any) => {
      if (!s.gameState) return s;
      return { gameState: executeAcquisition(s.gameState, targetId) };
    });
  },
});
