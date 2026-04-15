import { GameState } from '../../types';
import { TickContext, WeekFilter } from './types';

// System Imports
import { tickAIMinds } from '../../systems/ai/motivationEngine';
import { tickAgencies } from '../../systems/ai/AgentBrain';
import { tickAuctions, tickTalentCompetition } from '../../systems/ai/biddingEngine';

/**
 * AI Filter
 * Handles AI decision-making for rival studios, agencies, and talent competition
 */
export class AIFilter implements WeekFilter {
  name = 'AIFilter';

  execute(state: GameState, context: TickContext): void {
    context.impacts.push(...tickAIMinds(state, context.rng));
    context.impacts.push(...tickAgencies(state, context.rng));
    context.impacts.push(...tickAuctions(state, context.rng));
    context.impacts.push(...tickTalentCompetition(state, context.rng));
  }
}
