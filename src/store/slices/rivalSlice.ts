import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { executeAcquisition, executeSabotage, executePoach } from '@/engine/systems/mergers';
import { RandomGenerator } from '@/engine/utils/rng';
import { applyImpacts } from '@/engine/core/impactReducer';

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
      const rng = new RandomGenerator((s.gameState.gameSeed || 0) + (s.gameState.tickCount || 0) + 777);
      const impact = executeAcquisition(s.gameState, targetId, rng);
      if (!impact) return s;

      // Special case: we need to manually remove the rival because the impact reducer 
      // doesn't have a RIVAL_REMOVED generic impact yet.
      const newState = applyImpacts(s.gameState, [impact]);
      return { 
        gameState: {
          ...newState,
          industry: {
            ...newState.industry,
            rivals: newState.industry.rivals.filter(r => r.id !== targetId)
          }
        } 
      };
    });
  },

  corporateSabotage: (targetId) => {
    set((s) => {
      if (!s.gameState) return s;
      const rng = new RandomGenerator((s.gameState.gameSeed || 0) + (s.gameState.tickCount || 0) + 888);
      const impact = executeSabotage(s.gameState, targetId, rng);
      if (!impact) return s;
      return { gameState: applyImpacts(s.gameState, [impact]) };
    });
  },

  poachExec: (targetId) => {
    set((s) => {
      if (!s.gameState) return s;
      const rng = new RandomGenerator((s.gameState.gameSeed || 0) + (s.gameState.tickCount || 0) + 999);
      const impact = executePoach(s.gameState, targetId, rng);
      if (!impact) return s;
      return { gameState: applyImpacts(s.gameState, [impact]) };
    });
  },

  attemptTakeover: (targetId) => {
    get().acquireRival(targetId);
  },
});

