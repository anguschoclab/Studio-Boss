import { GameState, WeekSummary } from '@/engine/types';
import { WeekCoordinator } from '../services/WeekCoordinator';

/**
 * Standard Engine Orchestrator.
 * Delegates all simulation logic to the WeekCoordinator pipeline.
 * Use this as the main-thread entry point for the "Weekly Tick".
 */
export function advanceWeek(state: GameState): { newState: GameState; summary: WeekSummary } {
  return WeekCoordinator.execute(state);
}
