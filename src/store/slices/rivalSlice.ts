import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { executeAcquisition, executeSabotage, executePoach } from '@/engine/systems/mergers';

export interface RivalSlice {
  acquireRival: (targetId: string) => void;
  corporateSabotage: (targetId: string) => void;
  poachExec: (targetId: string) => void;
  attemptTakeover: (targetId: string) => void;
}

export const createRivalSlice: StateCreator<GameStore, [], [], RivalSlice> = (set, get) => ({
  acquireRival: (targetId) => {
    set((s) => {
      if (!s.gameState) return s;
      return { gameState: executeAcquisition(s.gameState, targetId) };
    });
  },

  corporateSabotage: (targetId) => {
    set((s) => {
      if (!s.gameState) return s;
      return { gameState: executeSabotage(s.gameState, targetId) };
    });
  },

  poachExec: (targetId) => {
    set((s) => {
      if (!s.gameState) return s;
      return { gameState: executePoach(s.gameState, targetId) };
    });
  },

  attemptTakeover: (targetId) => {
    set((s) => {
      if (!s.gameState) return s;
      return { gameState: executeAcquisition(s.gameState, targetId) };
    });
  },
});

