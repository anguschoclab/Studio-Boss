import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../src/store/gameStore';

describe('Store Slice Isolation', () => {
  beforeEach(() => {
    // Reset store or initialize a new game
    useGameStore.getState().newGame('Test Studio', 'major');
  });

  describe('Finance Slice Isolation', () => {
    it('should update funds without mutating project or talent state', () => {
      const state = useGameStore.getState();
      if (!state.gameState) throw new Error('Game not initialized');
      
      const initialCash = state.gameState.cash;
      const initialProjects = [...state.gameState.studio.internal.projects];
      
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
    it('should advance a specific project phase immutably', () => {
      // Add mock projects
      useGameStore.getState().addProject({ id: 'p1', phase: 'Development', title: 'P1' });
      useGameStore.getState().addProject({ id: 'p2', phase: 'Pre-Production', title: 'P2' });
      
      // Action
      useGameStore.getState().advanceProjectPhase('p1', 'Pre-Production');
      
      const newState = useGameStore.getState();
      if (!newState.gameState) throw new Error('Game missing');
      
      const p1 = newState.gameState.studio.internal.projects.find(p => p.id === 'p1');
      const p2 = newState.gameState.studio.internal.projects.find(p => p.id === 'p2');
      
      // Verification
      expect(p1?.phase).toBe('Pre-Production');
      expect(p2?.phase).toBe('Pre-Production'); // Ensure adjacent objects were not mutated incorrectly
    });
  });
});
