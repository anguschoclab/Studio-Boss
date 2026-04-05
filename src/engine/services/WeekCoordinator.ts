import { GameState, StateImpact, WeekSummary, GameEvent, RatingMarket } from '../types';
import { RandomGenerator } from '../utils/rng';
import { applyImpacts } from '../core/impactReducer';
import { RegulatorSystem } from '../systems/industry/RegulatorSystem';
import { clamp } from '../utils';

// System Imports
import { tickProduction } from '../systems/productionEngine';
import { tickScriptDevelopment } from '../systems/production/ScriptDraftingSystem';
import { tickPlatforms } from '../systems/television/platformEngine';
import { tickAIMinds } from '../systems/ai/motivationEngine';
import { tickAgencies } from '../systems/ai/AgentBrain';
import { tickAuctions, tickTalentCompetition } from '../systems/ai/biddingEngine';
import { tickWorldEvents } from '../systems/ai/WorldSimulator';
import { tickTelevision } from '../systems/television/televisionTick';
import { tickFinance } from '../systems/finance/financeTick';
import { advanceTrends } from '../systems/trends';
import { advanceMarketEvents } from '../systems/marketEvents';
import { advanceScandals, generateScandals } from '../systems/scandals';
import { advanceBuyers } from '../systems/buyerMergers';
import { checkAndTriggerCrisis } from '../systems/crises';
import { OpportunitySystem } from '../systems/market/OpportunitySystem';
import { advanceDeals } from '../systems/deals';

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
import { SchedulingEngine } from '../systems/schedulingEngine';

// Rating Systems
import { evaluateRatingForProject, evaluateRegionalRatings, checkDirectorsCutEligibility } from '../systems/ratings';
import { generateMarketBanScandal } from '../systems/scandals';

// Phase 2 Systems
import { runUpfronts } from '../systems/television/upfrontsEngine';
import { runFestivalMarket } from '../systems/festivals/festivalAuctionEngine';
import { TalentLifecycleSystem } from '../systems/talent/TalentLifecycleSystem';
import { shouldAttemptHostileTakeover } from '../systems/ai/AgentBrain';

/**
 * Studio Boss - Simulation Tick Context
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
 */
export class WeekCoordinator {
  static execute(state: GameState, rng: RandomGenerator): { newState: GameState; summary: WeekSummary; impacts: StateImpact[] } {
    const context: TickContext = {
      week: state.week + 1,
      tickCount: (state.tickCount || 0) + 1,
      rng,
      timestamp: (state.tickCount || 0) * 1000,
      impacts: [],
      events: []
    };

    // 1. Run Filters
    this.runMarketFilter(state, context);
    this.runProductionFilter(state, context);
    this.runAIFilter(state, context);
    this.runIndustryFilter(state, context);
    this.runTalentFilter(state, context);
    this.runMediaFilter(state, context);
    this.runScandalFilter(state, context);
    this.runFinanceFilter(state, context);

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
      eventHistory: context.events.length > 0 ? [...(state.eventHistory || []), ...context.events].slice(-52) : (state.eventHistory || []),
      finance: {
        ...nextState.finance,
        marketState: updatedMarketState as import('../types/state.types').MarketState
      }
    };

    const summary = this.buildSummary(state, finalizedState, context);

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
    context.impacts.push(...tickVerticalIntegration(state, context.rng));
    context.impacts.push(...tickIndustryUpstarts(state, context.rng));
    context.impacts.push(...tickConsolidation(state, context.rng));
    context.impacts.push(...OpportunitySystem.tick(state, context.rng));
  }

  private static runProductionFilter(state: GameState, context: TickContext) {
    context.impacts.push(...tickProduction(state, context.rng));
    const activeStages = ['prep', 'production', 'post_production', 'marketing'];

    for (const key in state.studio.internal.projects) {
      const project = state.studio.internal.projects[key];

      // 1. Script drafting and crisis triggering
      if (project.state === 'development') {
        const result = tickScriptDevelopment(project, context.rng);
        if (result.project !== project) {
          context.impacts.push({
            type: 'PROJECT_UPDATED',
            payload: { projectId: project.id, update: result.project }
          });
          if (result.impact) context.impacts.push(result.impact);
        }
      } else if (!project.activeCrisis && activeStages.includes(project.state)) {
        const impact = checkAndTriggerCrisis(project, state, context.rng);
        if (impact) context.impacts.push(impact);
      }

      // 2. Director's cut eligibility
      if ((project.state === 'post_release' || project.state === 'released') && !project.directorsCutNotified) {
        const { eligible } = checkDirectorsCutEligibility(project, context.week);
        if (eligible) {
          // Mark as notified to prevent re-triggering every week
          context.impacts.push({
            type: 'PROJECT_UPDATED',
            payload: { projectId: project.id, update: { directorsCutNotified: true } }
          });
          context.impacts.push({
            type: 'MODAL_TRIGGERED',
            payload: {
              modalType: 'DIRECTORS_CUT_AVAILABLE',
              priority: 20,
              payload: { projectId: project.id, projectTitle: project.title }
            }
          });
        }
      }

      // 3. Auto-evaluate rating for projects with flags but no rating yet
      if (project.contentFlags?.length && !project.rating) {
        const newRating = evaluateRatingForProject(project.contentFlags, project.type);
        const newRegional = evaluateRegionalRatings(project.contentFlags, newRating);
        context.impacts.push({
          type: 'PROJECT_UPDATED',
          payload: { projectId: project.id, update: { rating: newRating, regionalRatings: newRegional } }
        });
      }

      // 4. Shopping expiry
      if (
        project.state === 'shopping' &&
        project.shoppingExpiresWeek !== undefined &&
        context.week >= project.shoppingExpiresWeek
      ) {
        context.impacts.push({
          type: 'PROJECT_UPDATED',
          payload: {
            projectId: project.id,
            update: { state: 'archived' as const }
          }
        });
        context.impacts.push({
          type: 'NEWS_ADDED',
          payload: {
            id: `shop-expired-${project.id}`,
            headline: `"${project.title}" shopping window closes without a deal`,
            description: `The show has been shelved after failing to find a new network home.`,
            category: 'cancellation'
          }
        });
      }

      // 5. Scan released projects for newly banned markets
      if (project.regionalRatings && (project.state === 'released' || project.state === 'post_release')) {
        const bannedMarkets: RatingMarket[] = [];
        for (let i = 0; i < project.regionalRatings.length; i++) {
          if (project.regionalRatings[i].isBanned) {
            bannedMarkets.push(project.regionalRatings[i].market as RatingMarket);
          }
        }
        if (bannedMarkets.length > 0) {
          const banImpact = generateMarketBanScandal(project, bannedMarkets, context.week, state, context.rng);
          if (banImpact) context.impacts.push(banImpact);
        }
      }
    }

    context.impacts.push(...tickTelevision(state, context.rng));
    context.impacts.push(...calculateFranchiseEvolutionImpacts(state, context.rng));
    context.impacts.push(...tickIPVault(state));
    context.impacts.push(...SchedulingEngine.tick(state, context.rng));
  }

  private static runAIFilter(state: GameState, context: TickContext) {
    context.impacts.push(...tickAIMinds(state, context.rng));
    context.impacts.push(...tickAgencies(state, context.rng));
    context.impacts.push(...tickAuctions(state, context.rng));
    context.impacts.push(...tickTalentCompetition(state, context.rng));
  }

  private static runIndustryFilter(state: GameState, context: TickContext) {
    const { year } = InterestRateSimulator.getWeekDisplay(context.week);
    const awardsImpacts = runAwardsCeremony(state, context.week, year, context.rng);
    context.impacts.push(...awardsImpacts);
    
    const allNewAwards = awardsImpacts.reduce((acc, imp) => [...acc, ...(imp.newAwards || [])], [] as any[]);
    
    if (allNewAwards.length > 0) {
      context.impacts.push({
        type: 'MODAL_TRIGGERED',
        payload: {
          modalType: 'AWARDS',
          priority: 50,
          payload: { 
            week: context.week,
            year,
            awards: allNewAwards,
            body: allNewAwards[0]?.body || 'Annual Industry Awards'
          }
        }
      });
    }
    
    const weekDisplay = context.week % 52 === 0 ? 52 : context.week % 52;
    if (weekDisplay === 4) {
      context.impacts.push(...processRazzies(state, context.week, context.rng));
    }

    context.impacts.push(...resolveFestivals(state, context.rng));
    context.impacts.push(...RegulatorSystem.tick(state, context.rng));

    // Festival market auction at Sundance (w4), Cannes (w20), TIFF (w36)
    const weekOfYear = context.week % 52 || 52;
    if (weekOfYear === 4 || weekOfYear === 20 || weekOfYear === 36) {
      context.impacts.push(...runFestivalMarket(state, context.rng));
    }

    // Upfronts — week 20 of each year
    if (weekOfYear === 20) {
      context.impacts.push(...runUpfronts(state, context.rng));
    }

    // Annual M&A hostile takeover scan
    if (weekOfYear === 52) {
      this.runAnnualMAScan(state, context);
    }

    // Shopping status expiry
    }

  private static runTalentFilter(state: GameState, context: TickContext) {
    context.impacts.push(TalentSystem.advance(state, context.rng));
    context.impacts.push(...TalentLifecycleSystem.tick(state, context.rng));
  }

  private static runMediaFilter(state: GameState, context: TickContext) {
    context.impacts.push(advanceRumors(state, context.rng));
    
    // Process First-Look Deal decay
    const updatedPacts = SchedulingEngine.processPacts(state.studio.internal.firstLookDeals || []);
    if (JSON.stringify(updatedPacts) !== JSON.stringify(state.studio.internal.firstLookDeals)) {
       context.impacts.push({
         type: 'INDUSTRY_UPDATE',
         payload: { update: { 'studio.internal.firstLookDeals': updatedPacts } }
       });
    }

    // Process deal expiration news via advanceDeals
    if (state.studio.internal.firstLookDeals && state.studio.internal.firstLookDeals.length > 0) {
       const dealImpacts = advanceDeals(state.studio.internal.firstLookDeals, state.week, context.rng);
       dealImpacts.forEach(i => context.impacts.push(i));
    }
  }

  private static runScandalFilter(state: GameState, context: TickContext) {
    context.impacts.push(...generateScandals(state, context.rng));
    context.impacts.push(...advanceScandals(state));


  }

  private static runFinanceFilter(state: GameState, context: TickContext) {
    // Pass context.impacts so the Weekly Report can account for news/awards/festival transactions
    const financeImpacts = tickFinance(state, context.rng, context.impacts);
    context.impacts.push(...financeImpacts);
  }

  /**
   * Annual scan for hostile takeover attempts between rivals.
   * Fires once per year (week % 52 === 0).
   */
  private static runAnnualMAScan(state: GameState, context: TickContext) {
    const rivals = state.industry.rivals;
    for (let i = 0; i < rivals.length; i++) {
      for (let j = 0; j < rivals.length; j++) {
        if (i === j) continue;
        const attacker = rivals[i];
        const target = rivals[j];
        if (!target.isAcquirable) continue;
        if (shouldAttemptHostileTakeover(attacker, target, state)) {
          context.impacts.push({
            type: 'MODAL_TRIGGERED',
            payload: {
              modalType: 'BIDDING_WAR',
              priority: 60,
              payload: {
                attackerId: attacker.id,
                attackerName: attacker.name,
                targetId: target.id,
                targetName: target.name,
                offerAmount: Math.round(target.cash * 2 + target.strength * 1_000_000),
                week: context.week
              }
            }
          });
          context.impacts.push({
            type: 'NEWS_ADDED',
            payload: {
              id: `ma-${attacker.id}-${target.id}-${context.week}`,
              headline: `${attacker.name} makes hostile bid for ${target.name}`,
              description: `Industry insiders confirm an unsolicited acquisition offer has been made.`,
              category: 'acquisition',
              publication: 'The Hollywood Reporter'
            }
          });
          break; // one hostile move per attacker per year
        }
      }
    }
  }

  /**
   * Clears 'shopping' status for projects whose window has expired.
   */
  private static buildSummary(before: GameState, after: GameState, context: TickContext): WeekSummary {
    const allHeadlines: import('../types/engine.types').Headline[] = [];
    const newsEvents: import('../types/engine.types').NewsEvent[] = [];
    
    let ledgerImpact: StateImpact | undefined;
    const projectUpdates: string[] = [];

    for (let i = 0; i < context.impacts.length; i++) {
      const impact = context.impacts[i];

      if (impact.type === 'LEDGER_UPDATED') ledgerImpact = impact;
      
      if (impact.type === 'PROJECT_UPDATED') {
        const payload = impact.payload as import('../types/state.types').ProjectUpdate;
        projectUpdates.push(payload.projectId);
      }
      if (impact.projectUpdates) {
        for (let j = 0; j < impact.projectUpdates.length; j++) {
          projectUpdates.push(impact.projectUpdates[j].projectId);
        }
      }

      if (impact.type === 'NEWS_ADDED') {
        const payload = impact.payload as import('../types/state.types').NewsImpact;
        allHeadlines.push({
          id: context.rng.uuid('news'),
          text: payload.headline || 'Breaking News',
          week: context.week,
          category: payload.category || 'general',
          publication: payload.publication || 'Variety'
        });
      }
      
      if (impact.newHeadlines) allHeadlines.push(...impact.newHeadlines);
      if (impact.newsEvents) newsEvents.push(...impact.newsEvents);
    }

    for (let i = 0; i < newsEvents.length; i++) {
       const e = newsEvents[i];
       allHeadlines.push({
         id: e.id,
         text: `${e.headline}: ${e.description}`,
         week: e.week || context.week,
         category: (e.type?.toLowerCase() === 'crisis' ? 'talent' : 'general') as import('../types/engine.types').HeadlineCategory
       });
    }

    let totalRevenue = 0;
    let totalCosts = 0;

    if (ledgerImpact && ledgerImpact.type === 'LEDGER_UPDATED') {
       const report = (ledgerImpact.payload as any).report;
       totalRevenue = report.revenue.boxOffice + report.revenue.distribution + report.revenue.other;
       totalCosts = report.expenses.production + report.expenses.marketing + report.expenses.overhead + report.expenses.pacts;
    }

    // ⚡ Bolt: Refactored array .map() to a for loop, avoiding extra allocation overhead.
    const eventTitles: string[] = [];
    for (let i = 0; i < context.events.length; i++) {
      eventTitles.push(context.events[i].title);
    }

    return {
      fromWeek: before.week,
      toWeek: after.week,
      cashBefore: before.finance.cash,
      cashAfter: after.finance.cash,
      totalRevenue,
      totalCosts,
      projectUpdates: Array.from(new Set(projectUpdates)),
      newHeadlines: allHeadlines,
      events: eventTitles,
    };
  }
}
