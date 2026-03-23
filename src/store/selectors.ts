import { GameState } from '@/engine/types';

export const EMPTY_PROJECTS: GameState['projects'] = [];

export const selectActiveProjectsCount = (state: GameState | null) => {
  if (!state) return 0;
  return state.projects.filter(p => p.status === 'development' || p.status === 'production').length;
};

export const selectReleasedProjects = (state: GameState | null) => {
  if (!state) return EMPTY_PROJECTS;
  return state.projects.filter(p => p.status === 'released' || p.status === 'post_release' || p.status === 'archived');
};
