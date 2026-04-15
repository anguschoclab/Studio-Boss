import { GameState } from '../../types';
import { TickContext, WeekFilter } from './types';

// System Imports
import { advanceScandals, generateScandals } from '../../systems/scandals';

/**
 * Scandal Filter
 * Handles scandal generation and advancement
 */
export class ScandalFilter implements WeekFilter {
  name = 'ScandalFilter';

  execute(state: GameState, context: TickContext): void {
    context.impacts.push(...generateScandals(state, context.rng));
    context.impacts.push(...advanceScandals(state));
  }
}
