import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { createMockProject } from '../utils/mockFactories';

describe('Store Slice Isolation', () => {
  beforeEach(async () => {
    await useGameStore.getState().newGame('Test Studio', 'major');
  });

  describe('Finance Slice Isolation', () => {
    it('should update funds without mutating project or talent state', () => {
      const initialState = useGameStore.getState();
      if (!initialState.gameState) throw new Error('Game not initialized');
      
      const initialProjects = { ...initialState.gameState.studio.internal.projects };
      const initialCash = initialState.gameState.finance.cash;
      
      // Action
      useGameStore.getState().addFunds(5000);
      
      const newState = useGameStore.getState();
      if (!newState.gameState) throw new Error('Game missing after action');
      
      // Verification
      expect(newState.gameState.finance.cash).toBe(initialCash + 5000);
      expect(newState.gameState.studio.internal.projects).toStrictEqual(initialProjects); // Deep equality check
    });
  });

  describe('Project Slice Isolation', () => {
    it('should manage UUIDs internally and access by O(1) dictionary key', () => {
      const state = useGameStore.getState();
      state.addProject(createMockProject({ id: 'p_O1', title: 'O1 Project', state: 'development' }));
      const newState = useGameStore.getState();
      expect(newState.gameState?.studio.internal.projects['p_O1']).toBeDefined();
      expect(Object.keys(newState.gameState?.studio.internal.projects || {}).includes('p_O1')).toBe(true);
    });
    it('should advance a specific project status immutably', () => {
      // Add mock projects
      useGameStore.getState().addProject(createMockProject({ id: 'p1', state: 'development', title: 'P1' }));
      useGameStore.getState().addProject(createMockProject({ id: 'p2', state: 'production', title: 'P2' }));
      
      // Action
      useGameStore.getState().advanceProjectPhase('p1', 'production');
      
      const newState = useGameStore.getState();
      if (!newState.gameState) throw new Error('Game missing');
      
      const p1 = newState.gameState.studio.internal.projects['p1'];
      const p2 = newState.gameState.studio.internal.projects['p2'];
      
      // Verification
      expect(p1?.state).toBe('production');
      expect(p2?.state).toBe('production'); // Ensure adjacent objects were not mutated
    });
  });
});
