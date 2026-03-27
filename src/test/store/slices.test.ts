import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/store/gameStore';

describe('Store Slice Isolation', () => {
  beforeEach(() => {
    useGameStore.getState().newGame('Test Studio', 'major');
  });

  describe('Finance Slice Isolation', () => {
    it('should update funds without mutating project or talent state', () => {
      const initialState = useGameStore.getState();
      if (!initialState.gameState) throw new Error('Game not initialized');
      
      const initialProjects = [...initialState.gameState.studio.internal.projects];
      const initialCash = initialState.gameState.cash;
      
      // Action
      useGameStore.getState().addFunds(5000);
      
      const newState = useGameStore.getState();
      if (!newState.gameState) throw new Error('Game missing after action');
      
      // Verification
      expect(newState.gameState.cash).toBe(initialCash + 5000);
      expect(newState.gameState.studio.internal.projects).toStrictEqual(initialProjects); // Deep equality check
    });
  });

  describe('Project Slice Isolation', () => {
    it('should advance a specific project status immutably', () => {
      // Add mock projects
      useGameStore.getState().addProject({ id: 'p1', status: 'development', title: 'P1' });
      useGameStore.getState().addProject({ id: 'p2', status: 'production', title: 'P2' });
      
      // Action
      useGameStore.getState().advanceProjectPhase('p1', 'production');
      
      const newState = useGameStore.getState();
      if (!newState.gameState) throw new Error('Game missing');
      
      const p1 = newState.gameState.studio.internal.projects.find(p => p.id === 'p1');
      const p2 = newState.gameState.studio.internal.projects.find(p => p.id === 'p2');
      
      // Verification
      expect(p1?.status).toBe('production');
      expect(p2?.status).toBe('production'); // Ensure adjacent objects were not mutated
    });
  });
});
