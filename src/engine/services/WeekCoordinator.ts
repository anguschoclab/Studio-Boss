import { GameState, StateImpact, WeekSummary, GameEvent } from '../types';
import { RandomGenerator } from '../utils/rng';
import { applyImpacts } from '../core/impactReducer';
import { clamp } from '../utils';

// Filter Imports
import { WeekFilter, TickContext } from './filters/types';
import { MarketFilter } from './filters/MarketFilter';
import { AIFilter } from './filters/AIFilter';
import { MediaFilter } from './filters/MediaFilter';
import { ScandalFilter } from './filters/ScandalFilter';
import { FinanceFilter } from './filters/FinanceFilter';
import { IndustryFilter } from './filters/IndustryFilter';
import { ProductionFilter } from './filters/ProductionFilter';
import { TalentFilter } from './filters/TalentFilter';
import { SummaryBuilder } from './filters/SummaryBuilder';

/**
 * The "Pipe and Filter" Orchestrator.
 */
export const WeekCoordinator = {

  execute(state: GameState, rng: RandomGenerator): { newState: GameState; summary: WeekSummary; impacts: StateImpact[] } {
    const context: TickContext = {
      week: state.week + 1,
      tickCount: (state.tickCount || 0) + 1,
      rng,
      timestamp: (state.tickCount || 0) * 1000,
      impacts: [],
      events: []
    };

    // 1. Run Filters
    const filters: WeekFilter[] = [
      MarketFilter,
      ProductionFilter,
      AIFilter,
      IndustryFilter,
      TalentFilter,
      MediaFilter,
      ScandalFilter,
      FinanceFilter,
    ];

    for (const filter of filters) {
      filter.execute(state, context);
    }

    // 2. Consolidation & State Application
    const nextState = applyImpacts(state, context.impacts);

    const updatedMarketState = {
      ...nextState.finance.marketState,
      sentiment: clamp((nextState.finance.marketState?.sentiment || 50) + (context.rng.next() - 0.5) * 5, -100, 100),
      cycle: (nextState.finance.marketState?.baseRate || 0) > 0.08 ? 'RECESSION' : (nextState.finance.marketState?.baseRate || 0) > 0.06 ? 'BEAR' : 'STABLE'
    };

    const finalizedState: GameState = {
      ...nextState,
      week: context.week,
      tickCount: context.tickCount,
      rngState: context.rng.getState(),
      eventHistory: context.events.length > 0 ? [...(state.eventHistory || []), ...context.events].slice(-52) : (state.eventHistory || []),
      finance: {
        ...nextState.finance,
        marketState: updatedMarketState as import('../types/state.types').MarketState
      }
    };

    const summary = SummaryBuilder.build(state, finalizedState, context);

    context.impacts.push({
      type: 'MODAL_TRIGGERED',
      payload: {
        modalType: 'SUMMARY',
        priority: 0,
        payload: summary as unknown as Record<string, unknown>
      }
    });

    return {
      newState: finalizedState,
      summary,
      impacts: context.impacts
    };
  }
};
