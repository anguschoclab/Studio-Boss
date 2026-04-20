import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { applyStateImpact } from '../storeUtils';
import { Project, GameState } from '@/engine/types';
import { type ProjectId } from '@/engine/types/shared.types';

export interface ProjectUtilsSlice {
  addProject: (project: Project) => void;
  advanceProjectPhase: (projectId: ProjectId, newState: Project['state']) => void;
  updateProject: (projectId: ProjectId, update: Partial<Project>) => void;
}

export const createProjectUtilsSlice: StateCreator<GameStore, [], [], ProjectUtilsSlice> = (set) => ({
  addProject: (project) => {
    set((s) => {
      if (!s.gameState) return s;
      return {
        gameState: {
          ...s.gameState,
          entities: {
            ...s.gameState.entities,
            projects: { ...s.gameState.entities.projects, [project.id as ProjectId]: project }
          }
        }
      };
    });
  },

  advanceProjectPhase: (projectId, newState) => {
    set((s) => {
      if (!s.gameState) return s;
      return {
        gameState: applyStateImpact(s.gameState, {
          type: 'PROJECT_UPDATED',
          payload: {
            projectId,
            update: { state: newState as import('@/engine/types').Project['state'] }
          }
        })
      };
    });
  },

  updateProject: (projectId, update) => {
    set((s) => {
      if (!s.gameState) return s;
      return {
        gameState: applyStateImpact(s.gameState, {
          type: 'PROJECT_UPDATED',
          payload: {
            projectId,
            update
          }
        })
      };
    });
  }
});
