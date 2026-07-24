import { GameState, WeekSummary, StateImpact } from "@/engine/types";
import { WeekCoordinator } from "../services/WeekCoordinator";
import { getSimMemory } from "./simMemory";

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
  const mem = getSimMemory(state);
  const tickCount = state.tickCount || 0;

  if (
    (state === lastAdvancedStateRef || mem.lastProcessedTickCount === tickCount) &&
    lastResultRef
  ) {
    return lastResultRef;
  }

  const result = WeekCoordinator.execute(state);

  lastAdvancedStateRef = state;
  lastResultRef = result;

  return result;
}
