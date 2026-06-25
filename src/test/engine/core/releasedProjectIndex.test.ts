import { describe, it, expect } from 'vitest';
import { applyStateImpact } from '@/store/storeUtils';
import { createMockGameState } from '@/test/mockFactory';
import { Project, GameState } from '@/engine/types';

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'proj-1',
    title: 'Test Project',
    type: 'FILM',
    format: 'film',
    genre: 'Drama',
    budgetTier: 'mid',
    budget: 10_000_000,
    weeklyCost: 100_000,
    targetAudience: 'Adults',
    flavor: 'Test',
    state: 'development',
    buzz: 50,
    weeksInPhase: 0,
    developmentWeeks: 4,
    productionWeeks: 4,
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: null,
    accumulatedCost: 0,
    momentum: 50,
    progress: 0,
    activeCrisis: null,
    ...overrides,
  } as Project;
}

function makeState(projects: Record<string, Project> = {}, releasedProjectIds: string[] = []): GameState {
  const state = createMockGameState();
  state.entities.projects = projects;
  state.entities.releasedProjectIds = releasedProjectIds;
  return state;
}

describe('releasedProjectIds index maintenance', () => {
  describe('handleProjectUpdated', () => {
    it('adds project to index when state transitions to released', () => {
      const project = makeProject({ id: 'p1', state: 'development' });
      const state = makeState({ p1: project }, []);

      const newState = applyStateImpact(state, {
        type: 'PROJECT_UPDATED',
        payload: { projectId: 'p1', update: { state: 'released', releaseWeek: 10 } },
      });

      expect(newState.entities.releasedProjectIds).toContain('p1');
    });

    it('adds project to index when state transitions to post_release', () => {
      const project = makeProject({ id: 'p1', state: 'released' });
      const state = makeState({ p1: project }, ['p1']);

      const newState = applyStateImpact(state, {
        type: 'PROJECT_UPDATED',
        payload: { projectId: 'p1', update: { state: 'post_release' } },
      });

      expect(newState.entities.releasedProjectIds).toContain('p1');
      expect(newState.entities.releasedProjectIds).toHaveLength(1);
    });

    it('adds project to index when state transitions to archived', () => {
      const project = makeProject({ id: 'p1', state: 'post_release' });
      const state = makeState({ p1: project }, ['p1']);

      const newState = applyStateImpact(state, {
        type: 'PROJECT_UPDATED',
        payload: { projectId: 'p1', update: { state: 'archived' } },
      });

      expect(newState.entities.releasedProjectIds).toContain('p1');
      expect(newState.entities.releasedProjectIds).toHaveLength(1);
    });

    it('removes project from index when state transitions away from released-tier', () => {
      const project = makeProject({ id: 'p1', state: 'released' });
      const state = makeState({ p1: project }, ['p1']);

      const newState = applyStateImpact(state, {
        type: 'PROJECT_UPDATED',
        payload: { projectId: 'p1', update: { state: 'development' } },
      });

      expect(newState.entities.releasedProjectIds).not.toContain('p1');
    });

    it('does not add duplicate when already in index', () => {
      const project = makeProject({ id: 'p1', state: 'released' });
      const state = makeState({ p1: project }, ['p1']);

      const newState = applyStateImpact(state, {
        type: 'PROJECT_UPDATED',
        payload: { projectId: 'p1', update: { state: 'post_release' } },
      });

      expect(newState.entities.releasedProjectIds.filter(id => id === 'p1')).toHaveLength(1);
    });

    it('does not modify index when update does not change state', () => {
      const project = makeProject({ id: 'p1', state: 'released' });
      const state = makeState({ p1: project }, ['p1']);

      const newState = applyStateImpact(state, {
        type: 'PROJECT_UPDATED',
        payload: { projectId: 'p1', update: { buzz: 80 } },
      });

      expect(newState.entities.releasedProjectIds).toEqual(['p1']);
    });

    it('does not modify index when state stays in released-tier', () => {
      const project = makeProject({ id: 'p1', state: 'released' });
      const state = makeState({ p1: project }, ['p1']);

      const newState = applyStateImpact(state, {
        type: 'PROJECT_UPDATED',
        payload: { projectId: 'p1', update: { state: 'released', buzz: 90 } },
      });

      expect(newState.entities.releasedProjectIds).toEqual(['p1']);
    });

    it('handles multiple projects in index correctly', () => {
      const p1 = makeProject({ id: 'p1', state: 'released' });
      const p2 = makeProject({ id: 'p2', state: 'development' });
      const state = makeState({ p1, p2 }, ['p1']);

      const newState = applyStateImpact(state, {
        type: 'PROJECT_UPDATED',
        payload: { projectId: 'p2', update: { state: 'released', releaseWeek: 10 } },
      });

      expect(newState.entities.releasedProjectIds).toContain('p1');
      expect(newState.entities.releasedProjectIds).toContain('p2');
      expect(newState.entities.releasedProjectIds).toHaveLength(2);
    });
  });

  describe('handleProjectRemoved', () => {
    it('removes project from index when project is removed', () => {
      const p1 = makeProject({ id: 'p1', state: 'released' });
      const p2 = makeProject({ id: 'p2', state: 'released' });
      const state = makeState({ p1, p2 }, ['p1', 'p2']);

      const newState = applyStateImpact(state, {
        type: 'PROJECT_REMOVED',
        payload: { projectId: 'p1' },
      });

      expect(newState.entities.releasedProjectIds).not.toContain('p1');
      expect(newState.entities.releasedProjectIds).toContain('p2');
    });

    it('handles removal of project not in index gracefully', () => {
      const p1 = makeProject({ id: 'p1', state: 'development' });
      const state = makeState({ p1 }, []);

      const newState = applyStateImpact(state, {
        type: 'PROJECT_REMOVED',
        payload: { projectId: 'p1' },
      });

      expect(newState.entities.releasedProjectIds).toEqual([]);
    });
  });

  describe('gameInit', () => {
    it('initializes releasedProjectIds as empty array', () => {
      const state = createMockGameState();
      expect(state.entities.releasedProjectIds).toEqual([]);
      expect(Array.isArray(state.entities.releasedProjectIds)).toBe(true);
    });
  });
});
