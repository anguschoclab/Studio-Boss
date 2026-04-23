import { GameState, StateImpact, WeekSummary, GameEvent } from '../types';
import { RandomGenerator } from '../utils/rng';
import { applyImpacts } from '../core/impactReducer';
import { setDeterministicSeed } from '../utils';

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
import { tickLoans } from '../systems/finance/LoanSystem';
import { tickReleaseStrategy } from '../systems/ReleaseStrategySystem';
import { tickStudioIdentity } from '../systems/StudioIdentitySystem';
import { checkAchievements } from '../systems/AchievementsSystem';

// New Game Systems
import { tickReleaseStrategy } from '../systems/ReleaseStrategySystem';
import { tickPostProduction } from '../systems/PostProductionSystem';
import { tickStudioIdentity } from '../systems/StudioIdentitySystem';
import { checkAchievements } from '../systems/AchievementsSystem';
import { tickMorale } from '../systems/talent/MoraleTick';

// Talent Lifecycle Systems
import { tickRelationshipSystem } from '../systems/talent/RelationshipSystem';
import { tickCliqueSystem } from '../systems/talent/CliqueSystem';
import { tickTalentDiscoverySystem } from '../systems/talent/TalentDiscoverySystem';
import { tickDeathSystem } from '../systems/talent/DeathSystem';
import { tickDynastySystem } from '../systems/talent/DynastySystem';
import { tickOrganicEvents } from '../systems/talent/OrganicEventEnhancer';
import { tickMarketingPromotionSystem } from '../systems/talent/MarketingPromotionSystem';
import { tickBiographyGenerator } from '../systems/talent/BiographyGenerator';
import { tickProductionEnhancementSystem } from '../systems/talent/ProductionEnhancementSystem';
import { tickTVRecommendationSystem } from '../systems/talent/TVRecommendationSystem';

// Production Support Systems
import { checkAndTriggerCrisis } from '../systems/crises';
import { advanceDeals } from '../systems/deals';
import { advanceRivals } from '../systems/rivals';
import { runAwardsCeremony } from '../systems/awards/CeremonyRunner';
import { processRazzies } from '../systems/awards/RazzieProcessor';
import { tickPilots } from '../systems/television/pilotEvaluator';
import { runUpfronts } from '../systems/television/upfrontsEngine';
import { tickPostProduction } from '../systems/PostProductionSystem';

// AI Competition Systems
import { tickTalentCompetition } from '../systems/ai/bidding/CompetitionModule';
import { runFestivalMarket } from '../systems/festivals/festivalAuctionEngine';

// IP Systems
import { tickIPVault } from '../systems/ip/IPVaultManager';
import { advanceIPRights } from '../systems/ipRetention';
import { updateFranchiseHub } from '../systems/ip/franchiseCoordinator';

// Market Systems
import { advanceRumors } from '../systems/rumors';

// Rival Systems
import { RivalRevenueCalculator } from '../systems/rivals/RivalRevenueCalculator';

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
    const tickSeed = (state.gameSeed || 12345) + (state.tickCount || 0);
    setDeterministicSeed(tickSeed);

    const context: TickContext = {
      week: state.week + 1,
      tickCount: (state.tickCount || 0) + 1,
      rng: new RandomGenerator(tickSeed),
      timestamp: 1713552000000 + (state.week * 604800000), // Deterministic: 2024-04-20 + weeks
      impacts: [],
      events: []
    };

    // 2. The Filter Pipeline
    this.runMarketFilter(state, context);
    this.runProductionFilter(state, context);
    this.runTalentFilter(state, context);
    this.runIPFilter(state, context);
    this.runAIFilter(state, context);
    this.runScandalFilter(state, context);
    this.runFinanceFilter(state, context);

    // 2.5 Weekly Summary Trigger
    context.impacts.push({
      type: 'MODAL_TRIGGERED',
      payload: { modalType: 'SUMMARY' }
    });

    // 2.6 Achievements Check
    context.impacts.push(...checkAchievements(state));

    // 3. Consolidation Phase (The Merge)
    let nextState = applyImpacts(state, context.impacts);

    // 3.5 Check for franchise breakouts on newly released projects
    const releasedProjects = Object.values(nextState.entities.projects).filter(
      p => p.state === 'released' && p.releaseWeek === context.week
    );
    for (const p of releasedProjects) {
      nextState = updateFranchiseHub(nextState, p);
    }

    const finalizedState: GameState = {
      ...nextState,
      week: context.week,
      tickCount: context.tickCount,
      eventHistory: [...(state.eventHistory || []), ...context.events].slice(-500)
    };

    return {
      newState: finalizedState,
      summary: this.buildSummary(state, finalizedState, context),
      impacts: context.impacts
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
    context.impacts.push(...tickReleaseStrategy(state));
    context.impacts.push(...tickStudioIdentity(state));

    // Rumors
    context.impacts.push(advanceRumors(state, context.week, context.rng));
  }

  private static runProductionFilter(state: GameState, context: TickContext) {
    // 0. Production Enhancement (on-set chemistry bonuses) — runs before core production
    context.impacts.push(...tickProductionEnhancementSystem(state, context.rng));

    // 0.5 Post-Production Tick
    context.impacts.push(...tickPostProduction(state, context.rng));

    // 1. Core Production Tick
    context.impacts.push(...tickProduction(state, context.rng));
    context.impacts.push(...tickPostProduction(state, context.rng));
    context.impacts.push(...tickReleaseStrategy(state));

    // 1a. Crisis auto-trigger for active production projects
    Object.values(state.entities.projects).forEach(project => {
      if (project.state === 'production') {
        const crisis = checkAndTriggerCrisis(project);
        if (crisis) context.impacts.push(crisis);
      }
    });

    // 2. Script Evolution Tick (Only for Studio Projects in Development)
    Object.values(state.entities.projects).forEach(project => {
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

    // 3. Pilot Evaluator
    context.impacts.push(...tickPilots(state, context.rng));

    // 4. TV Recommendations
    context.impacts.push(...tickTVRecommendationSystem(state, context.rng));

    // 5. Upfronts — once per year (every 52 weeks)
    if (context.week % 52 === 0) {
      context.impacts.push(...runUpfronts(state, context.rng));
    }

    // 6. Awards ceremonies — run every week (CeremonyRunner checks internal calendar)
    const awardsYear = Math.floor(context.week / 52) + 1;
    context.impacts.push(...runAwardsCeremony(state, context.week, awardsYear, context.rng));

    // 7. Razzies — once per year
    if (context.week % 52 === 2) {
      context.impacts.push(...processRazzies(state, context.week, context.rng));
    }
  }

  private static runTalentFilter(state: GameState, context: TickContext) {
    // Talent lifecycle systems — all follow (state, rng) → StateImpact[] pattern
    context.impacts.push(...tickRelationshipSystem(state, context.rng));
    context.impacts.push(...tickCliqueSystem(state, context.rng));
    context.impacts.push(...tickTalentDiscoverySystem(state, context.rng));
    context.impacts.push(...tickDeathSystem(state, context.rng));
    context.impacts.push(...tickDynastySystem(state, context.rng));
    context.impacts.push(...tickOrganicEvents(state, context.rng));
    context.impacts.push(...tickMarketingPromotionSystem(state, context.rng));
    context.impacts.push(...tickBiographyGenerator(state, context.rng));
    context.impacts.push(...tickMorale(state, context.rng));
  }

  private static runIPFilter(state: GameState, context: TickContext) {
    context.impacts.push(...tickIPVault(state));
    context.impacts.push(advanceIPRights(Object.values(state.entities.projects), context.week));
  }

  private static runAIFilter(state: GameState, context: TickContext) {
    context.impacts.push(...tickAIMinds(state, context.rng));
    context.impacts.push(...tickAgencies(state, context.rng));
    context.impacts.push(...tickAuctions(state, context.rng));

    // Talent competition between rivals
    context.impacts.push(...tickTalentCompetition(state, context.rng));

    // Festival market
    context.impacts.push(...runFestivalMarket(state, context.rng));

    // Rival studio status tick
    context.impacts.push(advanceRivals(state));

    // First-look deal expiry
    const deals = (state.studio as any).firstLookDeals || [];
    if (deals.length > 0) {
      context.impacts.push(...advanceDeals(deals));
    }
  }

  private static runScandalFilter(state: GameState, context: TickContext) {
    context.impacts.push(...generateScandals(state, context.rng));
    context.impacts.push(...advanceScandals(state));
  }

  private static runFinanceFilter(state: GameState, context: TickContext) {
    context.impacts.push(...tickFinance(state, context.rng));
    context.impacts.push(...tickStudioIdentity(state));
    context.impacts.push(...checkAchievements(state));

    // Loan payments + bankruptcy check
    context.impacts.push(...tickLoans(state, context.rng));
    // Decrement weeksRemaining on loans and remove paid-off ones
    const currentLoans: any[] = (state.studio as any).loans || [];
    if (currentLoans.length > 0) {
      const updatedLoans = currentLoans
        .map((l: any) => ({ ...l, weeksRemaining: l.weeksRemaining - 1 }))
        .filter((l: any) => l.weeksRemaining > 0);
      context.impacts.push({
        type: 'SYSTEM_TICK' as any,
        payload: { __studioUpdate: { loans: updatedLoans } }
      });
    }

    // Calculate and update rival studio revenues
    Object.values(state.entities.rivals || {}).forEach(rival => {
      const revenue = RivalRevenueCalculator.calculateWeeklyRevenue(rival, context.week, context.rng, state);
      if (revenue.total > 0) {
        context.impacts.push({
          type: 'RIVAL_UPDATED',
          payload: {
            rivalId: rival.id,
            update: {
              cash: (rival.cash || 0) + revenue.total,
            }
          }
        });
      }
    });
  }

  private static buildSummary(before: GameState, after: GameState, context: TickContext): WeekSummary {
    // ⚡ The Framerate Fanatic: Refactored array .find() and .filter() to a single O(n) pass.
    const newsImpacts: import('../types/state.types').StateImpact[] = [];
    const projectUpdatesSet = new Set<string>();
    const narrativeEvents: import('../types/engine.types').NarrativeEvent[] = [];
    
    let totalRevenue = 0;
    let totalCosts = 0;

    for (const impact of context.impacts) {
      if (impact.type === 'NEWS_ADDED') {
        newsImpacts.push(impact);
      } else if (impact.type === 'LEDGER_UPDATED') {
        const payload = impact.payload as import('../types/state.types').LedgerImpact['payload'];
        const report = payload.report;
        totalRevenue += report.revenue.boxOffice + report.revenue.distribution + report.revenue.other;
        totalCosts += report.expenses.production + report.expenses.marketing + report.expenses.overhead;
      } else if (impact.type === 'PROJECT_UPDATED') {
        projectUpdatesSet.add((impact as import('../types/state.types').ProjectUpdateImpact).payload.projectId);
      }

      if (impact.uiNotifications) {
        for (const notification of impact.uiNotifications) {
          narrativeEvents.push({
            type: notification.startsWith('CRISIS') ? 'crisis' : 'general',
            title: notification,
            description: notification,
            severity: notification.startsWith('CRISIS') ? 'high' : 'low'
          });
        }
      }
    }

    const projectUpdates = Array.from(projectUpdatesSet);

    // Quiet week detection
    const isQuietWeek = 
      projectUpdates.length === 0 &&
      narrativeEvents.length === 0 &&
      newsImpacts.length <= 2 &&
      Math.abs(totalRevenue - totalCosts) < 500_000;

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
      narrativeEvents,
      isQuietWeek
    };
  }
}
