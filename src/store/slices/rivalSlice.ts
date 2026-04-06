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
      const state = s.gameState;
      if (!state) return s;
      const rng = new RandomGenerator(state.rngState);
      const impact = executeAcquisition(state, targetId, rng);
      if (!impact) return s;

      const newState = applyImpacts(state, [impact]);
      
      const rivals = { ...newState.entities.rivals };
      delete rivals[targetId];

      return { 
        gameState: {
          ...newState,
          entities: {
            ...newState.entities,
            rivals
          },
          rngState: rng.getState()
        } 
      };
    });
  },

  corporateSabotage: (targetId) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;
      const rng = new RandomGenerator(state.rngState);
      const impact = executeSabotage(state, targetId, rng);
      if (!impact) return s;
      const newState = applyImpacts(state, [impact]);
      
      return { 
        gameState: {
          ...newState,
          rngState: rng.getState()
        } 
      };
    });
  },

  poachExec: (targetId) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;
      const rng = new RandomGenerator(state.rngState);
      const impact = executePoach(state, targetId, rng);
      if (!impact) return s;
      const newState = applyImpacts(state, [impact]);
      
      return { 
        gameState: {
          ...newState,
          rngState: rng.getState()
        } 
      };
    });
  },

  attemptTakeover: (targetId) => {
    get().acquireRival(targetId);
  },
});
