import { describe, it, expect } from 'vitest';
import { useGameStore } from '@/store/gameStore';

describe('Unscripted Projects', () => {
  it('creates an unscripted project with correct stats', () => {
    useGameStore.getState().newGame('Test Studio', 'major');

    useGameStore.getState().createProject({
      title: 'Real World Test',
      format: 'unscripted',
      unscriptedFormat: 'reality_ensemble',
      genre: 'Ensemble Reality',
      budgetTier: 'mid',
      targetAudience: 'Adults 25-54',
      flavor: 'Drama in a house',
      episodes: 12,
      releaseModel: 'weekly'
    });

    const state = useGameStore.getState().gameState;
    const project = state?.projects.find(p => p.title === 'Real World Test');

    expect(project).toBeDefined();
    expect(project?.format).toBe('unscripted');
    expect(project?.unscriptedFormat).toBe('reality_ensemble');
    expect(project?.episodes).toBe(12);
    expect(project?.season).toBe(1);
    expect(project?.renewable).toBe(true);
  });
});
