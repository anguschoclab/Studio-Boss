import { GameState, StateImpact, GameEvent } from '../../types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Simulation Tick Context
 * Passed to all filters during weekly simulation
 */
export interface TickContext {
  week: number;
  tickCount: number;
  rng: RandomGenerator;
  timestamp: number;
  impacts: StateImpact[];
  events: GameEvent[];
}

/**
 * Week Filter Interface
 * All weekly simulation filters must implement this interface
 */
export interface WeekFilter {
  name: string;
  execute(state: GameState, context: TickContext): void;
}
