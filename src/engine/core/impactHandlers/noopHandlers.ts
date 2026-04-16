import { GameState, StateImpact } from '@/engine/types';

/**
 * No-op handlers for impacts that trigger UI modals/notifications
 * State updates handled through other impact types
 */

export function handleCastingConstraintViolation(state: GameState, impact: StateImpact): GameState {
  return state;
}

export function handleCastingPremiumDemand(state: GameState, impact: StateImpact): GameState {
  return state;
}

export function handleCastingAlternativeSuggested(state: GameState, impact: StateImpact): GameState {
  return state;
}
