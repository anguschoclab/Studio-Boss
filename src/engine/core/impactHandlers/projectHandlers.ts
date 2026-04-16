import { GameState, StateImpact, Award } from '@/engine/types';

/**
 * Project-related impact handlers
 * Pure functions that apply project-related state impacts
 */

export function handleProjectUpdated(state: GameState, impact: StateImpact): GameState {
  const { projectId, update } = impact.payload;
  if (!state.entities?.projects) return state;
  const projects = { ...state.entities.projects };
  const project = projects[projectId];
  if (project) {
    projects[projectId] = { ...project, ...update };
  }
  return {
    ...state,
    entities: {
      ...state.entities,
      projects
    }
  };
}

export function handleProjectRemoved(state: GameState, impact: StateImpact): GameState {
  const { projectId } = impact.payload;
  if (!state.entities?.projects) return state;
  const projects = { ...state.entities.projects };
  delete projects[projectId];
  return {
    ...state,
    entities: {
      ...state.entities,
      projects
    }
  };
}

export function handleAwardWon(state: GameState, impact: StateImpact): GameState {
  const { projectId, award } = impact.payload;
  if (!state.entities?.projects) return state;
  const projects = { ...state.entities.projects };
  const project = projects[projectId];
  if (project) {
    projects[projectId] = { 
      ...project, 
      awards: [...(project.awards || []), award] 
    };
  }
  return {
    ...state,
    entities: {
      ...state.entities,
      projects
    }
  };
}

export function handlePilotGraduated(state: GameState, impact: StateImpact): GameState {
  const { projectId, nextState } = impact.payload as { projectId: string; nextState?: import('@/engine/types/project.types').ProjectStatus };
  const projects = { ...state.entities.projects };
  const project = projects[projectId];
  if (project) {
    const { stage: _stage, ...rest } = project as any;
    projects[projectId] = { ...rest, state: nextState ?? 'production', weeksInPhase: 0 };
  }
  return {
    ...state,
    entities: {
      ...state.entities,
      projects
    }
  };
}
