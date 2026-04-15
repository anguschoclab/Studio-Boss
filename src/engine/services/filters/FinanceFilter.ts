import { GameState } from '../../types';
import { TickContext, WeekFilter } from './types';

// System Imports
import { tickFinance } from '../../systems/finance/financeTick';

/**
 * Finance Filter
 * Handles weekly financial calculations and reporting
 */
export class FinanceFilter implements WeekFilter {
  name = 'FinanceFilter';

  execute(state: GameState, context: TickContext): void {
    // Pass context.impacts so the Weekly Report can account for news/awards/festival transactions
    const financeImpacts = tickFinance(state, context.rng, context.impacts);
    context.impacts.push(...financeImpacts);
  }
}
