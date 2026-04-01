import { GameState, StateImpact, WeekSummary, GameEvent } from '../types';
import { RandomGenerator } from '../utils/rng';
import { applyImpacts } from '../core/impactReducer';

// System Imports
import { tickProduction } from '../systems/productionEngine';
import { tickScriptDevelopment } from '../systems/production/ScriptDraftingSystem';
import { tickPlatforms } from '../systems/television/platformEngine';
import { tickAIMinds } from '../systems/ai/motivationEngine';
import { tickAgencies } from '../systems/ai/AgentBrain';
import { tickAuctions } from '../systems/ai/biddingEngine';
import { tickWorldEvents } from '../systems/ai/WorldSimulator';
import { tickTelevision } from '../systems/television/televisionTick';
import { tickFinance } from '../systems/finance/financeTick';
import { advanceTrends } from '../systems/trends';
import { advanceMarketEvents } from '../systems/marketEvents';
import { advanceScandals, generateScandals } from '../systems/scandals';
import { advanceBuyers } from '../systems/buyerMergers';

// New Industry Systems
import { tickVerticalIntegration } from '../systems/industry/VerticalIntegrationProcessor';
import { tickIndustryUpstarts } from '../systems/industry/IndustryUpstarts';
import { tickConsolidation } from '../systems/industry/ConsolidationEngine';
import { InterestRateSimulator } from '../systems/market/InterestRateSimulator';

/**
 * Studio Boss - Simulation Tick Context
 * Travels through the pipeline to ensure 100% determinism.
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
 * The "Pipe and Filter" Orchestrator.
 * Deconstructs the monolithic simulation into discrete, testable stages.
 */
export class WeekCoordinator {
  /**
   * Main entry point for the weekly simulation tick.
   */
  static execute(state: GameState): { newState: GameState; summary: WeekSummary } {
    // 1. Preparation Phase (The Valve)
    const context: TickContext = {
      week: state.week + 1,
      tickCount: (state.tickCount || 0) + 1,
      rng: new RandomGenerator((state.gameSeed || 12345) + (state.tickCount || 0)),
      timestamp: Date.now(),
      impacts: [],
      events: []
    };

    // 2. The Filter Pipeline
    this.runMarketFilter(state, context);
    this.runProductionFilter(state, context);
    this.runAIFilter(state, context);
    this.runScandalFilter(state, context);
    this.runFinanceFilter(state, context);

    // 3. Consolidation Phase (The Merge)
    const nextState = applyImpacts(state, context.impacts);

    const finalizedState: GameState = {
      ...nextState,
      week: context.week,
      tickCount: context.tickCount,
      eventHistory: [...(state.eventHistory || []), ...context.events].slice(-500)
    };

    return {
      newState: finalizedState,
      summary: this.buildSummary(state, finalizedState, context)
    };
  }

  private static runMarketFilter(state: GameState, context: TickContext) {
    context.impacts.push(...tickPlatforms(state, context.rng));
    context.impacts.push(InterestRateSimulator.advance(state));
    context.impacts.push(...tickWorldEvents(state, context.rng));
    context.impacts.push(...advanceTrends(state.market.trends || []));
    context.impacts.push(...advanceMarketEvents(state));
    context.impacts.push(advanceBuyers(state));
    
    // New Industry Filters
    context.impacts.push(...tickVerticalIntegration(state, context.rng));
    context.impacts.push(...tickIndustryUpstarts(state));
    context.impacts.push(...tickConsolidation(state));
  }

  private static runProductionFilter(state: GameState, context: TickContext) {
    // 1. Core Production Tick
    context.impacts.push(...tickProduction(state, context.rng));
    
    // 2. Script Evolution Tick (Only for Studio Projects in Development)
    Object.values(state.studio.internal.projects).forEach(project => {
      if (project.state === 'development') {
        const result = tickScriptDevelopment(project, context.rng);
        if (result.project !== project) {
          context.impacts.push({
            type: 'PROJECT_UPDATED',
            payload: {
              projectId: project.id,
              update: result.project
            }
          });
          if (result.impact) context.impacts.push(result.impact);
        }
      }
    });

    context.impacts.push(...tickTelevision(state, context.rng));
  }

  private static runAIFilter(state: GameState, context: TickContext) {
    context.impacts.push(...tickAIMinds(state, context.rng));
    context.impacts.push(...tickAgencies(state, context.rng));
    context.impacts.push(...tickAuctions(state, context.rng));
  }

  private static runScandalFilter(state: GameState, context: TickContext) {
    context.impacts.push(...generateScandals(state));
    context.impacts.push(...advanceScandals(state));
  }

  private static runFinanceFilter(state: GameState, context: TickContext) {
    context.impacts.push(...tickFinance(state, context.rng));
  }

  private static buildSummary(before: GameState, after: GameState, context: TickContext): WeekSummary {
    const newsImpacts = context.impacts.filter(i => i.type === 'NEWS_ADDED');
    const ledgerImpact = context.impacts.find(i => i.type === 'LEDGER_UPDATED');
    
    let totalRevenue = 0;
    let totalCosts = 0;

    if (ledgerImpact && ledgerImpact.type === 'LEDGER_UPDATED') {
       const payload = ledgerImpact.payload as import('../types/state.types').LedgerImpact['payload'];
       const report = payload.report;
       totalRevenue = report.revenue.boxOffice + report.revenue.distribution + report.revenue.other;
       totalCosts = report.expenses.production + report.expenses.marketing + report.expenses.overhead;
    }

    const projectUpdates = context.impacts
      .filter((i): i is import('../types/state.types').ProjectUpdateImpact => i.type === 'PROJECT_UPDATED')
      .map(i => i.payload.projectId);

    return {
      fromWeek: before.week,
      toWeek: after.week,
      cashBefore: before.finance.cash,
      cashAfter: after.finance.cash,
      totalRevenue,
      totalCosts,
      projectUpdates: Array.from(new Set(projectUpdates)),
      newHeadlines: newsImpacts.map(i => {
        if (i.type !== 'NEWS_ADDED') return null;
        const payload = i.payload as import('../types/state.types').NewsImpact['payload'];
        return {
          id: context.rng.uuid('news'),
          text: payload.headline || 'Unknown Event',
          week: context.week,
          category: 'general' as import('../types/engine.types').HeadlineCategory
        };
      }).filter((h): h is import('../types/engine.types').Headline => h !== null),
      events: context.events.map(e => e.title),
    };
  }
}
