import { GameState } from '../../types';
import { TickContext, WeekFilter } from './types';

// System Imports
import { tickPlatforms } from '../../systems/television/platformEngine';
import { InterestRateSimulator } from '../../systems/market/InterestRateSimulator';
import { tickWorldEvents } from '../../systems/ai/WorldSimulator';
import { advanceTrends } from '../../systems/trends';
import { advanceMarketEvents } from '../../systems/marketEvents';
import { advanceBuyers } from '../../systems/buyerMergers';
import { tickVerticalIntegration } from '../../systems/industry/VerticalIntegrationProcessor';
import { tickIndustryUpstarts } from '../../systems/industry/IndustryUpstarts';
import { tickConsolidation } from '../../systems/industry/ConsolidationEngine';
import { OpportunitySystem } from '../../systems/market/OpportunitySystem';

/**
 * Market Filter
 * Handles market-wide dynamics including platforms, interest rates, world events, trends, and opportunities
 */
export class MarketFilter implements WeekFilter {
  name = 'MarketFilter';

  execute(state: GameState, context: TickContext): void {
    context.impacts.push(...tickPlatforms(state, context.rng));
    context.impacts.push(InterestRateSimulator.advance(state, context.rng));
    context.impacts.push(...tickWorldEvents(state, context.rng));
    context.impacts.push(...advanceTrends(state.market.trends || [], context.rng));
    context.impacts.push(...advanceMarketEvents(state, context.rng));
    context.impacts.push(advanceBuyers(state, context.rng));
    context.impacts.push(...tickVerticalIntegration(state, context.rng));
    context.impacts.push(...tickIndustryUpstarts(state, context.rng));
    context.impacts.push(...tickConsolidation(state, context.rng));
    context.impacts.push(...OpportunitySystem.tick(state, context.rng));
  }
}
