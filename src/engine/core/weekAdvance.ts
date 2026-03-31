import { GameState, WeekSummary, StateImpact } from '@/engine/types';
import { tickProduction } from '../systems/productionEngine';
import { tickPlatforms } from '../systems/television/platformEngine';
import { tickAIMinds } from '../systems/ai/motivationEngine';
import { tickAgencies } from '../systems/ai/AgentBrain';
import { tickAuctions } from '../systems/ai/biddingEngine';
import { tickWorldEvents } from '../systems/ai/WorldSimulator';
import { tickTelevision } from '../systems/television/televisionTick';
import { tickFinance } from '../systems/finance/financeTick';
import { applyImpacts } from './impactReducer';

/**
 * Weekly Simulation Orchestrator (Phase A-C).
 * Coordinates all simulation systems in a pure, functional pipeline.
 */
export function advanceWeek(state: GameState): { newState: GameState; summary: WeekSummary } {
  // 1. Collect all impacts from decoupled systems (Strategy: Collect -> Merge -> Apply)
  const impacts: StateImpact[] = [
    ...tickProduction(state),
    ...tickPlatforms(state),
    ...tickAIMinds(state),
    ...tickAgencies(state),
    ...tickAuctions(state),
    ...tickWorldEvents(state),
    ...tickTelevision(state),
    ...tickFinance(state),
  ];

  // 2. Reduce impacts into the next state
  const nextState = applyImpacts(state, impacts);

  // 3. Increment Week & Metadata
  const finalizedState: GameState = {
    ...nextState,
    week: (state.week || 0) + 1,
  };

  return { newState: finalizedState, summary: buildSummary(state, finalizedState, impacts) };
}

/**
 * Builds the news and financial summary for the executive review.
 */
function buildSummary(before: GameState, after: GameState, impacts: StateImpact[]): WeekSummary {
  return {
    fromWeek: before.week,
    toWeek: after.week,
    cashBefore: before.finance.cash,
    cashAfter: after.finance.cash,
    totalRevenue: 0, 
    totalCosts: 0,
    projectUpdates: impacts.filter(i => i.type === 'PROJECT_UPDATED').map(i => i.payload.projectId),
    newHeadlines: impacts.filter(i => i.type === 'NEWS_ADDED').map(i => i.payload.headline),
    events: [],
  };
}
