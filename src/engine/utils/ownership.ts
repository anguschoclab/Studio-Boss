import { GameState } from "../types";

/**
 * Centralized player ownership check.
 * Replaces scattered `ownerId === 'player'` / `ownerId === 'PLAYER'` magic-string
 * checks with a single source of truth that compares against the player's
 * real generated studio ID (`state.studio.id`).
 */
export function isPlayerOwner(state: GameState, ownerId: string | undefined | null): boolean {
  if (!ownerId) return false;
  return ownerId === state.studio.id;
}

/**
 * Tolerant player-project predicate for entity scans. Player projects may
 * lack `ownerId` (legacy paths never stamped it); rival projects always
 * carry their rival's id.
 */
export function isPlayerProject(
  state: GameState,
  project: { ownerId?: string | null }
): boolean {
  return project.ownerId === undefined || isPlayerOwner(state, project.ownerId);
}

/** Player-owned projects from the canonical `entities.projects` map. */
export function playerProjectsList<T extends { ownerId?: string | null }>(
  state: GameState,
  projects: Record<string, T>
): T[] {
  const out: T[] = [];
  for (const id in projects) {
    if (!Object.prototype.hasOwnProperty.call(projects, id)) continue;
    const p = projects[id];
    if (isPlayerProject(state, p)) out.push(p);
  }
  return out;
}

/**
 * Returns the player's studio ID for use in assignments.
 */
export function getPlayerId(state: GameState): string {
  return state.studio.id;
}
