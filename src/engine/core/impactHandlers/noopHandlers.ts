import { GameState, StateImpact } from '@/engine/types';

/**
 * No-op handlers for impacts that trigger UI modals/notifications
 * State updates handled through other impact types
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function handleCastingConstraintViolation(state: GameState, _impact: StateImpact): GameState {
  return state;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function handleCastingPremiumDemand(state: GameState, _impact: StateImpact): GameState {
  return state;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function handleCastingAlternativeSuggested(state: GameState, _impact: StateImpact): GameState {
  return state;
}
