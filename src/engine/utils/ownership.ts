import { GameState } from '../types';

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
 * Returns the player's studio ID for use in assignments.
 */
export function getPlayerId(state: GameState): string {
  return state.studio.id;
}
