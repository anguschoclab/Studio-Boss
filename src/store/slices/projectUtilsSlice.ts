import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { applyStateImpact } from '../storeUtils';
import { Project, GameState } from '@/engine/types';

export interface ProjectUtilsSlice {
  addProject: (project: Project) => void;
  advanceProjectPhase: (projectId: string, newState: string) => void;
  updateProject: (projectId: string, update: Partial<Project>) => void;
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
            projects: { ...s.gameState.entities.projects, [project.id]: project }
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
