import { GameState, StateImpact } from "@/engine/types";

/**
 * No-op handlers for impacts that trigger UI modals/notifications
 * State updates handled through other impact types
 */

 
export function handleCastingConstraintViolation(
  state: GameState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _impact: StateImpact
): GameState {
  return state;
}

export function handleCastingPremiumDemand(
  state: GameState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _impact: StateImpact
): GameState {
  return state;
}

export function handleCastingAlternativeSuggested(
  state: GameState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _impact: StateImpact
): GameState {
  return state;
}
