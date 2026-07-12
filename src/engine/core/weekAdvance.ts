import { GameState, WeekSummary, StateImpact } from "@/engine/types";
import { WeekCoordinator } from "../services/WeekCoordinator";

// The Tech Supervisor: Reference memoization to prevent duplicate ticks during React Strict Mode
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
// Audit: O(1) pass-through. Engine allocations deferred to WeekCoordinator.
export function advanceWeek(state: GameState): {
  newState: GameState;
  summary: WeekSummary;
  impacts: StateImpact[];
} {
  // The Tech Supervisor: Prevent O(N^2) state cascades by immediately returning cached
  // output if the incoming immutable state reference matches the last processed one.
  if (state === lastAdvancedStateRef && lastResultRef) {
    return lastResultRef;
  }

  const result = WeekCoordinator.execute(state);

  lastAdvancedStateRef = state;
  lastResultRef = result;

  return result;
}
