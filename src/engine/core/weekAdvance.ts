import { GameState, WeekSummary } from '@/engine/types';
import { WeekCoordinator } from '../services/WeekCoordinator';

// The Tech Supervisor: Reference memoization to prevent duplicate ticks during React Strict Mode
let lastAdvancedStateRef: GameState | null = null;
let lastResultRef: { newState: GameState; summary: WeekSummary } | null = null;

/**
 * Standard Engine Orchestrator.
 * Delegates all simulation logic to the WeekCoordinator pipeline.
 * Use this as the main-thread entry point for the "Weekly Tick".
 */
// Audit: O(1) pass-through. Engine allocations deferred to WeekCoordinator.
export function advanceWeek(state: GameState): { newState: GameState; summary: WeekSummary } {
  // The Tech Supervisor: Prevent O(N^2) state cascades by immediately returning cached
  // output if the incoming immutable state reference matches the last processed one.
  if (state === lastAdvancedStateRef && lastResultRef) {
    return lastResultRef;
  }

  const result = WeekCoordinator.execute(state);

  lastAdvancedStateRef = state;
  // ⚡ The Tech Supervisor: Enforce immutability on cached wrapper to guarantee strict equality integrity
  lastResultRef = Object.freeze(result);

  return lastResultRef;
}
