import { GameState, WeekSummary, StateImpact } from '@/engine/types';
import { WeekCoordinator } from '../services/WeekCoordinator';
import { RandomGenerator } from '../utils/rng';

/**
 * Standard Engine Orchestrator.
 * Delegates all simulation logic to the WeekCoordinator pipeline.
 * Use this as the main-thread entry point for the "Weekly Tick".
 * Note: Keep this an O(1) pass-through. Engine allocations deferred to WeekCoordinator.
 */
export function advanceWeek(state: GameState, rng: RandomGenerator): { newState: GameState; summary: WeekSummary; impacts: StateImpact[] } {
  return WeekCoordinator.execute(state, rng);
}
