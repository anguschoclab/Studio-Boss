import { GameState, StateImpact } from "@/engine/types";

/**
 * Project-related impact handlers
 * Pure functions that apply project-related state impacts
 */

const RELEASED_STATES = new Set<string>(["released", "post_release", "archived"]);

export function handleProjectUpdated(state: GameState, impact: StateImpact): GameState {
  const { projectId, update } = impact.payload;
  if (!state.entities?.projects) return state;
  const projects = { ...state.entities.projects };
  const project = projects[projectId];
  if (project) {
    projects[projectId] = { ...project, ...update };
  }

  let releasedProjectIds = state.entities.releasedProjectIds;
  if (update && typeof update.state === "string") {
    const newState = update.state as string;
    const isInIndex = releasedProjectIds.indexOf(projectId) !== -1;
    if (RELEASED_STATES.has(newState)) {
      if (!isInIndex) {
        releasedProjectIds = [...releasedProjectIds, projectId];
      }
    } else if (isInIndex) {
      releasedProjectIds = releasedProjectIds.filter((id) => id !== projectId);
    }
  }

  return {
    ...state,
    entities: {
      ...state.entities,
      projects,
      releasedProjectIds,
    },
  };
}

export function handleProjectRemoved(state: GameState, impact: StateImpact): GameState {
  const { projectId } = impact.payload;
  if (!state.entities?.projects) return state;
  const projects = { ...state.entities.projects };
  delete projects[projectId];
  const releasedProjectIds = state.entities.releasedProjectIds.filter((id) => id !== projectId);
  return {
    ...state,
    entities: {
      ...state.entities,
      projects,
      releasedProjectIds,
    },
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
      awards: [...(project.awards || []), award],
    };
  }
  return {
    ...state,
    entities: {
      ...state.entities,
      projects,
    },
  };
}

export function handlePilotGraduated(state: GameState, impact: StateImpact): GameState {
  const { projectId, nextState } = impact.payload as {
    projectId: string;
    nextState?: import("@/engine/types/project.types").ProjectStatus;
  };
  const projects = { ...state.entities.projects };
  const project = projects[projectId];
  if (project) {
    // Remove stage and update state for graduating pilots
    const updatedProject = { ...project };
    if ("stage" in updatedProject) {
      delete (updatedProject as unknown as Record<string, unknown>).stage; // stage is pilot-specific, but not in strict Project result
    }
    projects[projectId] = {
      ...updatedProject,
      state: nextState ?? "production",
      weeksInPhase: 0,
    };
  }
  return {
    ...state,
    entities: {
      ...state.entities,
      projects,
    },
  };
}
