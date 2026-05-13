import { GameState, StateImpact } from "@/engine/types";
import { applySingleImpact as apply, applyImpacts as applyAll } from "./impactHandlers";

/**
 * Legacy entry point for applying state impacts.
 * Now delegates to the strictly typed handler registry in impactHandlers/index.ts.
 */
export function applySingleImpact(state: GameState, impact: StateImpact): GameState {
  return apply(state, impact);
}

/**
 * Pure reducer that processes an array of impacts without mutating original state.
 */
export function applyImpacts(state: GameState, impacts: StateImpact[]): GameState {
  return applyAll(state, impacts);
}
