import {GameState, WeekSummary, StateImpact} from "@/engine/types";
import {WeekCoordinator} from "../services/WeekCoordinator";

let lastAdvancedStateRef: GameState | null = null;
let lastResultRef: { newState: GameState; summary: WeekSummary; impacts: StateImpact[] } | null =
  null;

export function resetAdvanceWeekCache(): void {
  lastAdvancedStateRef = null;
  lastResultRef = null;
}

/**
 * Standard Engine Orchestrator.
 * Delegates all simulation logic to the WeekCoordinator pipeline.
 * Use this as the main-thread entry point for the "Weekly Tick".
 */
export function advanceWeek(state: GameState): {
  newState: GameState;
  summary: WeekSummary;
  impacts: StateImpact[];
} {
  // Identity-only dedup: the previous tick-count clause compared a state's own
  // lastProcessedTickCount to its own tickCount — never true after a real tick
  // (lp is written as input.tickCount while the result increments tickCount),
  // and on crafted states it returned a cached result from a DIFFERENT game.
  if (state === lastAdvancedStateRef && lastResultRef) {
    return lastResultRef;
  }

  const result = WeekCoordinator.execute(state);

  lastAdvancedStateRef = state;
  lastResultRef = result;

  return result;
}
