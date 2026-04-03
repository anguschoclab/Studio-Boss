import { GameState, StateImpact, WeekSummary, GameEvent } from '../types';
import { RandomGenerator } from '../utils/rng';
import { applyImpacts } from '../core/impactReducer';
import { clamp } from '../utils';

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
import { checkAndTriggerCrisis } from '../systems/crises';

// New Industry Systems
import { tickVerticalIntegration } from '../systems/industry/VerticalIntegrationProcessor';
import { tickIndustryUpstarts } from '../systems/industry/IndustryUpstarts';
import { tickConsolidation } from '../systems/industry/ConsolidationEngine';
import { InterestRateSimulator } from '../systems/market/InterestRateSimulator';
import { calculateFranchiseEvolutionImpacts, tickIPVault } from '../systems/ip/franchiseCoordinator';

// Integrated Hardening Systems
import { runAwardsCeremony, processRazzies } from '../systems/awards';
import { TalentSystem } from '../systems/TalentSystem';
import { resolveFestivals } from '../systems/festivals';
import { advanceRumors } from '../systems/rumors';
import { advanceDeals } from '../systems/deals';

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
  static execute(state: GameState): { newState: GameState; summary: WeekSummary; impacts: StateImpact[] } {
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
    this.runIndustryFilter(state, context);
    this.runTalentFilter(state, context);
    this.runMediaFilter(state, context);
    this.runScandalFilter(state, context);
    this.runFinanceFilter(state, context);

    // 3. Consolidation Phase (The Merge)
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
      eventHistory: [...(state.eventHistory || []), ...context.events].slice(-52),
      finance: {
        ...nextState.finance,
        marketState: updatedMarketState as import('../types/state.types').MarketState
      }
    };

    const summary = this.buildSummary(state, finalizedState, context);

    // Ensure SUMMARY is last in priority (Priority 0)
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

  private static runMarketFilter(state: GameState, context: TickContext) {
    context.impacts.push(...tickPlatforms(state, context.rng));
    context.impacts.push(InterestRateSimulator.advance(state, context.rng));
    context.impacts.push(...tickWorldEvents(state, context.rng));
    context.impacts.push(...advanceTrends(state.market.trends || [], context.rng));
    context.impacts.push(...advanceMarketEvents(state, context.rng));
    context.impacts.push(advanceBuyers(state, context.rng));
    
    // New Industry Filters
    context.impacts.push(...tickVerticalIntegration(state, context.rng));
    context.impacts.push(...tickIndustryUpstarts(state, context.rng));
    context.impacts.push(...tickConsolidation(state, context.rng));
  }

  private static runProductionFilter(state: GameState, context: TickContext) {
    // 1. Core Production Tick
    context.impacts.push(...tickProduction(state, context.rng));
    
    // 2. Script Evolution Tick
    // ⚡ Bolt: Iterate over project records using for...in to avoid O(N) array allocation per tick
    for (const key in state.studio.internal.projects) {
      const project = state.studio.internal.projects[key];
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
    }

    // 3. Crisis Filter (New Integration)
    this.runCrisisFilter(state, context);

    context.impacts.push(...tickTelevision(state, context.rng));
    context.impacts.push(...calculateFranchiseEvolutionImpacts(state, context.rng));
    context.impacts.push(...tickIPVault(state));
  }

  private static runCrisisFilter(state: GameState, context: TickContext) {
    // Roll for crises for studio projects in active production stages
    // ⚡ Bolt: Iterate over project records using for...in to avoid O(N) array allocation per tick
    for (const key in state.studio.internal.projects) {
      const project = state.studio.internal.projects[key];
      const activeStages = ['prep', 'production', 'post_production', 'marketing'];
      if (!project.activeCrisis && activeStages.includes(project.state)) {
        const impact = checkAndTriggerCrisis(project, context.rng);
        if (impact) context.impacts.push(impact);
      }
    }

    // Roll for rival projects
    state.industry.rivals.forEach(rival => {
      // ⚡ Bolt: Iterate over project records using for...in to avoid O(N) array allocation per tick
      const projects = rival.projects || {};
      for (const key in projects) {
        const project = projects[key];
        const activeStages = ['prep', 'production', 'post_production', 'marketing'];
        if (!project.activeCrisis && activeStages.includes(project.state)) {
           const impact = checkAndTriggerCrisis(project, context.rng);
           if (impact) context.impacts.push(impact);
        }
      }
    });
  }

  private static runAIFilter(state: GameState, context: TickContext) {
    context.impacts.push(...tickAIMinds(state, context.rng));
    context.impacts.push(...tickAgencies(state, context.rng));
    context.impacts.push(...tickAuctions(state, context.rng));
  }

  private static runIndustryFilter(state: GameState, context: TickContext) {
    const { year } = InterestRateSimulator.getWeekDisplay(context.week);
    
    // 1. Awards Ceremony
    const awardsImpact = runAwardsCeremony(state, context.week, year, context.rng);
    context.impacts.push(awardsImpact);
    
    // Trigger Awards Modal ONLY if there are new awards or nominations
    if (awardsImpact.newAwards && awardsImpact.newAwards.length > 0) {
      context.impacts.push({
        type: 'MODAL_TRIGGERED',
        payload: {
          modalType: 'AWARDS',
          priority: 50, // Higher priority than summary
          payload: { 
            week: context.week,
            year,
            awards: awardsImpact.newAwards,
            body: awardsImpact.newAwards[0]?.body || 'Annual Industry Awards'
          }
        }
      });
    }
    
    // 2. Razzies (Week 4)
    const weekDisplay = context.week % 52 === 0 ? 52 : context.week % 52;
    if (weekDisplay === 4) {
      const razzieImpact = processRazzies(state, context.week, context.rng);
      context.impacts.push(razzieImpact);
    }

    // 3. Film Festivals
    context.impacts.push(resolveFestivals(state, context.rng));
  }

  private static runTalentFilter(state: GameState, context: TickContext) {
    context.impacts.push(TalentSystem.advance(state, context.rng));
  }

  private static runMediaFilter(state: GameState, context: TickContext) {
    context.impacts.push(advanceRumors(state, context.rng));
    context.impacts.push(...advanceDeals(state.studio.internal.firstLookDeals || [], context.rng));
  }

  private static runScandalFilter(state: GameState, context: TickContext) {
    context.impacts.push(...generateScandals(state, context.rng));
    context.impacts.push(...advanceScandals(state));
  }

  private static runFinanceFilter(state: GameState, context: TickContext) {
    context.impacts.push(...tickFinance(state, context.rng));
  }

  private static buildSummary(before: GameState, after: GameState, context: TickContext): WeekSummary {
    const allHeadlines: import('../types/engine.types').Headline[] = [];
    const newsEvents: import('../types/engine.types').NewsEvent[] = [];
    
    context.impacts.forEach(impact => {
      // 1. Action-style NEWS_ADDED
      if (impact.type === 'NEWS_ADDED') {
        const payload = impact.payload as import('../types/state.types').NewsImpact['payload'];
        allHeadlines.push({
          id: context.rng.uuid('news'),
          text: payload.headline || 'Breaking News',
          week: context.week,
          category: payload.category || 'general'
        });
      }
      
      // 2. Bag-style arrays
      if (impact.newHeadlines) {
        allHeadlines.push(...impact.newHeadlines);
      }
      if (impact.newsEvents) {
        newsEvents.push(...impact.newsEvents);
      }
    });

    newsEvents.forEach(e => {
       allHeadlines.push({
         id: e.id,
         text: `${e.headline}: ${e.description}`,
         week: e.week || context.week,
         category: (e.type?.toLowerCase() === 'crisis' ? 'talent' : 'general') as import('../types/engine.types').HeadlineCategory
       });
    });


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

    context.impacts.forEach(i => {
      if (i.projectUpdates) {
        i.projectUpdates.forEach(pu => projectUpdates.push(pu.projectId));
      }
    });

    return {
      fromWeek: before.week,
      toWeek: after.week,
      cashBefore: before.finance.cash,
      cashAfter: after.finance.cash,
      totalRevenue,
      totalCosts,
      projectUpdates: Array.from(new Set(projectUpdates)),
      newHeadlines: allHeadlines,
      events: context.events.map(e => e.title),
    };
  }
}
