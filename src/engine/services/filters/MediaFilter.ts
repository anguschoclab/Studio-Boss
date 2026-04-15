import { GameState } from '../../types';
import { TickContext, WeekFilter } from './types';

// System Imports
import { advanceRumors } from '../../systems/rumors';
import { advanceDeals } from '../../systems/deals';

/**
 * Media Filter
 * Handles rumors and deal advancement
 */
export class MediaFilter implements WeekFilter {
  name = 'MediaFilter';

  execute(state: GameState, context: TickContext): void {
    context.impacts.push(advanceRumors(state, context.rng));
    
    // Process all active deals (First-Look & Overall) via global pool
    if (state.deals?.activeDeals && state.deals.activeDeals.length > 0) {
       const dealImpacts = advanceDeals(state.deals.activeDeals, state.week, context.rng);
       dealImpacts.forEach(i => context.impacts.push(i));
    }
  }
}
