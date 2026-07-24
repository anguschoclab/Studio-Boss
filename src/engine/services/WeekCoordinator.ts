import { GameState, StateImpact, WeekSummary, GameEvent } from "../types";
import { RandomGenerator } from "../utils/rng";
import { applyImpacts } from "../core/impactReducer";
import { setDeterministicSeed } from "../utils";
import { impacts as I } from "../core/impacts";
import { defaultSimMemory } from "../core/simMemory";

// System Imports
import { tickProduction } from "../systems/productionEngine";
import { tickScriptDevelopment } from "../systems/production/ScriptDraftingSystem";
import { tickPlatforms } from "../systems/television/platformEngine";
import { tickAIMinds } from "../systems/ai/motivationEngine";
import { tickRivalAwardsCampaigns } from "../systems/ai/RivalAwardsCampaigner";
import { tickAgencies } from "../systems/ai/AgentBrain";
import { tickAuctions } from "../systems/ai/biddingEngine";
import { tickWorldEvents } from "../systems/ai/WorldSimulator";
import { tickTelevision } from "../systems/television/televisionTick";
import { tickFinance } from "../systems/finance/financeTick";
import { advanceTrends } from "../systems/trends";
import { advanceMarketEvents } from "../systems/marketEvents";
import { advanceScandals, generateScandals } from "../systems/scandals";
import { advanceBuyers } from "../systems/buyerMergers";

// New Industry Systems
import { tickVerticalIntegration } from "../systems/industry/VerticalIntegrationProcessor";
import { tickIndustryUpstarts } from "../systems/industry/IndustryUpstarts";
import { tickConsolidation } from "../systems/industry/ConsolidationEngine";
import { tickRivalSpawner, tickHardBankruptcy } from "../systems/industry/RivalSpawner";
import { tickAntitrust } from "../systems/industry/Antitrust";
import { tickDistressCascade, tickDistressedOffers } from "../systems/industry/DistressCascade";
import { tickShingleSystem } from "../systems/deals/ShingleSystem";
import { tickShinglePitchRouter } from "../systems/deals/ShinglePitchRouter";
import { InterestRateSimulator } from "../systems/market/InterestRateSimulator";
import { tickLoans } from "../systems/finance/LoanSystem";
import { tickReleaseStrategy } from "../systems/ReleaseStrategySystem";
import { tickStudioIdentity } from "../systems/StudioIdentitySystem";
import { checkAchievements } from "../systems/AchievementsSystem";

// New Game Systems
import { tickPostProduction } from "../systems/PostProductionSystem";
import { tickMorale } from "../systems/talent/MoraleTick";

// Talent Lifecycle Systems
import { tickRelationshipSystem } from "../systems/talent/RelationshipSystem";
import { tickCliqueSystem } from "../systems/talent/CliqueSystem";
import { tickTalentDiscoverySystem } from "../systems/talent/TalentDiscoverySystem";
import { tickDeathSystem } from "../systems/talent/DeathSystem";
import { tickDynastySystem } from "../systems/talent/DynastySystem";
import { tickOrganicEvents } from "../systems/talent/OrganicEventEnhancer";
import { tickMarketingPromotionSystem } from "../systems/talent/MarketingPromotionSystem";
import { tickBiographyGenerator } from "../systems/talent/BiographyGenerator";
import { tickProductionEnhancementSystem } from "../systems/talent/ProductionEnhancementSystem";
import { tickMarketing } from "../systems/marketing/MarketingSystem";
import { tickTVRecommendationSystem } from "../systems/talent/TVRecommendationSystem";

// Production Support Systems
import { checkAndTriggerCrisis } from "../systems/crises";
import { advanceDeals } from "../systems/deals";
import { advanceRivals } from "../systems/rivals";
import { tickRivalProduction } from "../systems/rivals/rivalProduction";
import { runAwardsCeremony } from "../systems/awards/CeremonyRunner";
import { processRazzies } from "../systems/awards/RazzieProcessor";
import { tickPilots } from "../systems/television/pilotEvaluator";
import { runUpfronts } from "../systems/television/upfrontsEngine";

// AI Competition Systems
import { tickTalentCompetition } from "../systems/ai/bidding/CompetitionModule";
import { runFestivalMarket } from "../systems/festivals/festivalAuctionEngine";

// IP Systems
import { tickIPVault } from "../systems/ip/IPVaultManager";
import { advanceIPRights } from "../systems/ipRetention";
import { updateFranchiseHubs } from "../systems/ip/franchiseCoordinator";
import { AnnualScans } from "./filters/AnnualScans";
import { RegulatorSystem } from "../systems/industry/RegulatorSystem";

// Market Systems
import { advanceRumors } from "../systems/rumors";
import { OpportunitySystem } from "../systems/market/OpportunitySystem";

// Scheduling & Festivals
import { SchedulingEngine } from "../systems/schedulingEngine";
import { resolveFestivals } from "../systems/festivals";

// Talent Systems (ported from dead TalentFilter)
import { TalentLifecycleSystem } from "../systems/talent/TalentLifecycleSystem";
import { tickCastingConstraintSystem } from "../systems/talent/CastingConstraintSystem";
import { TalentMoraleSystem } from "../systems/talent/TalentMoraleSystem";
import {
  shouldTalentHireAgent,
  selectAgentForTalent,
  shouldTalentFireAgent,
  createAgentHiringEvent,
  createAgentFiringEvent,
} from "../systems/talent/talentAgentEvents";
import { TalentAgentInteractionEngine } from "../systems/talent/talentAgentInteractions";
import { Agency } from "../types/talent.types";

// Rival Systems
import { RivalRevenueCalculator } from "../systems/rivals/RivalRevenueCalculator";
import { getBudgetInflation } from "../systems/industry/MacroCycle";

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
  static execute(state: GameState): {
    newState: GameState;
    summary: WeekSummary;
    impacts: StateImpact[];
  } {
    // 1. Preparation Phase (The Valve)
    const tickSeed = (state.gameSeed || 12345) + (state.tickCount || 0);
    setDeterministicSeed(tickSeed);

    const context: TickContext = {
      week: state.week + 1,
      tickCount: (state.tickCount || 0) + 1,
      rng: new RandomGenerator(tickSeed),
      timestamp: 1713552000000 + state.week * 604800000, // Deterministic: 2024-04-20 + weeks
      impacts: [],
      events: [],
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
    context.impacts.push(I.modalTriggered("SUMMARY"));

    // 2.6 Achievements Check
    context.impacts.push(...checkAchievements(state));

    // 3. Consolidation Phase (The Merge)
    let nextState = applyImpacts(state, context.impacts);

    // 3.5 Check for franchise breakouts on newly released projects
    // ⚡ The Framerate Fanatic: Replaced Object.values().filter() with a direct for...in loop
    // ⚡ The Framerate Fanatic: Batched processing to avoid O(N*M) dictionary cloning
    const newlyReleasedProjects = [];
    for (const id in nextState.entities.projects) {
      const p = nextState.entities.projects[id];
      if (
        p.state === "released" &&
        (p.releaseWeek === context.week || p.releaseWeek === context.week - 1) &&
        !p.franchiseId
      ) {
        newlyReleasedProjects.push(p);
      }
    }

    if (newlyReleasedProjects.length > 0) {
      nextState = updateFranchiseHubs(nextState, newlyReleasedProjects);
    }

    // 2.7 Player-agency hook (Plan 2): prompt a greenlight decision for any
    // project that has reached the greenlight-ready state. The store routes
    // MODAL_TRIGGERED → GREENLIGHT_DECISION into the UI modal queue.
    for (const id in nextState.entities.projects) {
      const p = nextState.entities.projects[id];
      if (p.state === "needs_greenlight") {
        context.impacts.push(
          I.modalTriggered("GREENLIGHT_DECISION", { projectId: p.id }),
        );
      }
    }

    const finalizedState: GameState = {
      ...nextState,
      week: context.week,
      tickCount: context.tickCount,
      eventHistory: [...(state.eventHistory || []), ...context.events].slice(-500),
      simMemory: {
        ...(nextState.simMemory ?? defaultSimMemory()),
        lastProcessedTickCount: state.tickCount || 0,
      },
    };

    return {
      newState: finalizedState,
      summary: this.buildSummary(state, finalizedState, context),
      impacts: context.impacts,
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
    context.impacts.push(...tickRivalSpawner(state));
    context.impacts.push(...tickDistressCascade(state));
    context.impacts.push(...tickDistressedOffers(state));
    context.impacts.push(...tickShingleSystem(state, context.rng));
    context.impacts.push(...tickShinglePitchRouter(state, context.rng));
    context.impacts.push(...tickHardBankruptcy(state));
    context.impacts.push(...tickAntitrust(state));
    context.impacts.push(...tickReleaseStrategy(state));
    context.impacts.push(...tickStudioIdentity(state));

    // Opportunity resolution (expired auctions + replenishment)
    context.impacts.push(...OpportunitySystem.tick(state, context.rng));

    // Rumors
    context.impacts.push(advanceRumors(state));
  }

  private static runProductionFilter(state: GameState, context: TickContext) {
    // 0. Rival production — spawn/advance rival-owned projects so they feed
    // revenue, market share, and (below) marketing intensity.
    context.impacts.push(...tickRivalProduction(state, context.rng));

    // 0.5 Marketing awareness accrual — runs before core production so released
    // projects carry up-to-date awareness into release simulation. Rival spend
    // contributes to industry marketing intensity (share-of-voice pressure).
    const rivalSpend = this.estimateRivalMarketingSpend(state);
    context.impacts.push(...tickMarketing(state, context.rng, rivalSpend));

    // 0. Production Enhancement (on-set chemistry bonuses) — runs before core production
    context.impacts.push(...tickProductionEnhancementSystem(state, context.rng));

    // 1. Core Production Tick
    context.impacts.push(...tickProduction(state, context.rng));
    context.impacts.push(...tickPostProduction(state, context.rng));

    // 1a. Crisis auto-trigger for active production projects
    // ⚡ The Framerate Fanatic: Replaced Object.values() with a direct for...in loop
    for (const id in state.entities.projects) {
      const project = state.entities.projects[id];
      if (project.state === "production") {
        const crisis = checkAndTriggerCrisis(project);
        if (crisis) context.impacts.push(crisis);
      }
    }

    // 2. Script Evolution Tick (Only for Studio Projects in Development)
    // ⚡ The Framerate Fanatic: Replaced Object.values() with a direct for...in loop
    for (const id in state.entities.projects) {
      const project = state.entities.projects[id];
      if (project.state === "development") {
        const result = tickScriptDevelopment(project, context.rng);
        if (result.length > 0) {
          context.impacts.push(I.projectUpdated(project.id, project));
          context.impacts.push(...result);
        }
      }
    }

    context.impacts.push(...tickTelevision(state, context.rng));

    // 3. Pilot Evaluator
    context.impacts.push(...tickPilots(state, context.rng));

    // 4. TV Recommendations
    context.impacts.push(...tickTVRecommendationSystem(state, undefined, context.rng));

    // 5. Upfronts — once per year (every 52 weeks)
    if (context.week % 52 === 0) {
      context.impacts.push(...runUpfronts(state, context.rng));
    }

    // 6. Awards ceremonies — run every week (CeremonyRunner checks internal calendar)
    const awardsYear = Math.floor(context.week / 52) + 1;
    const awardsImpacts = runAwardsCeremony(state, context.week, awardsYear, context.rng);
    context.impacts.push(...awardsImpacts);

    // 6a. Awards modal trigger (ported from dead IndustryFilter)
    const allNewAwards = awardsImpacts
      .filter((i) => i.type === "INDUSTRY_UPDATE" && i.payload?.update)
      .flatMap((i) => Object.values((i.payload as Record<string, unknown>).update as Record<string, unknown>));
    if (allNewAwards.length > 0) {
      context.impacts.push({
        type: "MODAL_TRIGGERED",
        payload: {
          modalType: "AWARDS",
          priority: 50,
          payload: {
            week: context.week,
            year: awardsYear,
            awards: allNewAwards,
            body: (allNewAwards[0] as Record<string, unknown>)?.body || "Annual Industry Awards",
          },
        },
      });
    }

    // 7. Razzies — once per year
    if (context.week % 52 === 2) {
      context.impacts.push(...processRazzies(state, context.week, context.rng));
    }

    // 8. Scheduling conflicts (ported from dead ProductionFilter)
    context.impacts.push(...SchedulingEngine.tick(state, context.rng));

    // 9. Festival resolution (ported from dead IndustryFilter)
    context.impacts.push(resolveFestivals(state) as unknown as StateImpact);
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

    // Ported from dead TalentFilter.ts:
    // Talent lifecycle (aging/retirement)
    context.impacts.push(...TalentLifecycleSystem.tick(state, context.rng));

    // Casting constraints
    context.impacts.push(...tickCastingConstraintSystem(state, context.rng));

    // Weekly morale updates via TalentMoraleSystem
    const talentDict = state.entities.talents;
    const projectsDict = state.entities.projects;
    const contractsDict = state.entities.contracts;
    const moraleUpdates = TalentMoraleSystem.processWeeklyMorale(
      talentDict,
      projectsDict,
      contractsDict
    );
    for (const update of moraleUpdates) {
      context.impacts.push({
        type: "TALENT_UPDATED",
        payload: { talentId: update.talentId, update: update.update },
      });
    }

    // Talent-Agent hiring/firing + relationship evolution
    const agencyMap = new Map<string, Agency>(
      (state.industry.agencies || []).map((a) => [a.id, a])
    );
    for (const talentId in talentDict) {
      const talent = talentDict[talentId];
      if (!Object.prototype.hasOwnProperty.call(talentDict, talentId)) continue;

      const hiringCheck = shouldTalentHireAgent(talent);
      if (hiringCheck.shouldHire) {
        const newAgent = selectAgentForTalent(talent, state, context.rng);
        if (newAgent) {
          if (talent.agentId) {
            context.impacts.push({
              type: "TALENT_UPDATED",
              payload: { talentId, update: { agentId: undefined, agencyId: undefined } },
            });
          }

          const agentPersonality = newAgent.personality || this.derivePersonalityFromAgent(newAgent, agencyMap);
          const agency = newAgent.agencyId ? agencyMap.get(newAgent.agencyId) : undefined;
          TalentAgentInteractionEngine.createRelationship(
            talentId,
            newAgent.id,
            (talent.personality as import("../types/talent.types").TalentPersonality) || "pragmatic",
            agentPersonality,
            agency?.tier
          );

          context.impacts.push({
            type: "TALENT_UPDATED",
            payload: { talentId, update: { agentId: newAgent.id, agencyId: newAgent.agencyId } },
          });

          context.impacts.push({
            type: "NEWS_ADDED",
            payload: createAgentHiringEvent(talent, newAgent, context.week),
          } as unknown as StateImpact);
        }
      }

      if (talent.agentId) {
        const relationship = state.talentAgentRelationships?.[`${talentId}-${talent.agentId}`];
        if (relationship && shouldTalentFireAgent(talent, relationship)) {
          context.impacts.push({
            type: "NEWS_ADDED",
            payload: createAgentFiringEvent(talent, talent.agentId, context.week),
          } as unknown as StateImpact);

          context.impacts.push({
            type: "TALENT_UPDATED",
            payload: { talentId, update: { agentId: undefined, agencyId: undefined } },
          });
        }
      }

      // Weekly relationship evolution
      if (talent.agentId) {
        const relationshipId = `${talentId}-${talent.agentId}`;
        const relationship = state.talentAgentRelationships?.[relationshipId];
        if (relationship) {
          const evolved = TalentAgentInteractionEngine.evolveRelationship(relationship, 0, context.rng);
          if (evolved !== relationship) {
            context.impacts.push({
              type: "RELATIONSHIP_UPDATED",
              payload: { relationshipId, relationship: evolved },
            } as unknown as StateImpact);
          }
        }
      }
    }
  }

  private static derivePersonalityFromAgent(
    agent: { negotiationTactic?: string; agencyId?: string },
    agencyMap: Map<string, Agency>
  ): import("../systems/talent/talentAgentInteractions").AgentPersonality {
    if (agent.negotiationTactic) {
      const tacticMap: Record<
        string,
        import("../systems/talent/talentAgentInteractions").AgentPersonality
      > = {
        SHARK: "shark",
        DIPLOMAT: "diplomat",
        VOLUME: "volume",
        PRESTIGE: "prestige",
      };
      return tacticMap[agent.negotiationTactic] || "diplomat";
    }
    if (agent.agencyId) {
      const agency = agencyMap.get(agent.agencyId);
      if (agency) {
        return TalentAgentInteractionEngine.mapArchetypeToPersonality(agency.archetype);
      }
    }
    return "diplomat";
  }

  private static runIPFilter(state: GameState, context: TickContext) {
    context.impacts.push(...tickIPVault(state));
    context.impacts.push(advanceIPRights(Object.values(state.entities.projects), context.week));
    AnnualScans.execute(state, context);
  }

  private static runAIFilter(state: GameState, context: TickContext) {
    context.impacts.push(...tickAIMinds(state, context.rng));
    context.impacts.push(...tickRivalAwardsCampaigns(state, context.rng));
    context.impacts.push(...tickAgencies(state, context.rng));
    context.impacts.push(...tickAuctions(state, context.rng));

    // Talent competition between rivals
    context.impacts.push(...tickTalentCompetition(state, context.rng));

    // Festival market
    context.impacts.push(...runFestivalMarket(state, context.rng));

    // Rival studio status tick
    context.impacts.push(advanceRivals(state));

    // First-look deal expiry
    const deals = (state.studio as unknown as { firstLookDeals?: unknown[] }).firstLookDeals || [];
    if (deals.length > 0) {
      context.impacts.push(...advanceDeals(deals as import("../types").FirstLookDeal[]));
    }

    // Regulator warnings (ported from dead IndustryFilter)
    context.impacts.push(...RegulatorSystem.tick(state, context.rng));
  }

  private static runScandalFilter(state: GameState, context: TickContext) {
    context.impacts.push(...generateScandals(state));
    context.impacts.push(...advanceScandals(state));
  }

  private static runFinanceFilter(state: GameState, context: TickContext) {
    context.impacts.push(...tickFinance(state, context.rng, context.impacts));

    // Loan payments + bankruptcy check
    context.impacts.push(...tickLoans(state, context.rng));
    // Decrement weeksRemaining on loans and remove paid-off ones
    const currentLoans: import("@/engine/types").Loan[] = state.studio.loans || [];
    if (currentLoans.length > 0) {
      const updatedLoans = currentLoans
        .map((l) => ({ ...l, weeksRemaining: l.weeksRemaining - 1 }))
        .filter((l) => l.weeksRemaining > 0);
      context.impacts.push(I.industryUpdate({ "studio.loans": updatedLoans }));
    }

    // Rival weekly revenue + overhead drain. Opening-weekend gross already bakes
    // in macro heat, so here we only apply inflation to overhead.
    const inflation = getBudgetInflation(context.week);
    // ⚡ The Framerate Fanatic: Replaced Object.values() with a direct for...in loop
    const rivalsMap = state.entities.rivals || {};
    for (const id in rivalsMap) {
      const rival = rivalsMap[id];
      const revenue = RivalRevenueCalculator.calculateWeeklyRevenue(
        rival,
        context.week,
        context.rng,
        state
      );
      const archetypeMult =
        rival.archetype === "major" ? 2.2 : rival.archetype === "mid-tier" ? 1.0 : 0.4;
      const overhead = 80_000 * archetypeMult * inflation;
      const net = revenue.total - overhead;
      if (net !== 0) {
        let history = rival.revenueHistory ? [...rival.revenueHistory] : [];
        history.push({ week: context.week, revenue: revenue.total, boxOffice: revenue.boxOffice });
        if (history.length > 52) history = history.slice(-52);
        context.impacts.push({
          type: "RIVAL_UPDATED",
          payload: {
            rivalId: rival.id,
            update: {
              cash: (rival.cash || 0) + net,
              revenueHistory: history,
            },
          },
        });
      }
    }
  }

  /**
   * Rough estimate of total rival marketing spend this week, used to feed
   * industry marketing intensity (share-of-voice pressure) into tickMarketing.
   */
  private static estimateRivalMarketingSpend(state: GameState): number {
    const rivalsMap = state.entities?.rivals || {};
    let total = 0;
    for (const id in rivalsMap) {
      const rival = rivalsMap[id];
      const archetypeMult =
        rival.archetype === "major" ? 2.2 : rival.archetype === "mid-tier" ? 1.0 : 0.4;
      total += 5_000_000 * archetypeMult;
    }
    return total;
  }

  private static buildSummary(
    before: GameState,
    after: GameState,
    context: TickContext
  ): WeekSummary {
    const newsImpacts: import("../types/state.types").StateImpact[] = [];
    const projectUpdates: string[] = [];
    let ledgerImpact: import("../types/state.types").StateImpact | undefined;
    const narrativeEvents: import("../types/engine.types").NarrativeEvent[] = [];

    for (const impact of context.impacts) {
      if (impact.type === "NEWS_ADDED") newsImpacts.push(impact);
      if (impact.type === "LEDGER_UPDATED" && !ledgerImpact) ledgerImpact = impact;
      if (impact.type === "PROJECT_UPDATED") {
        const payload = impact.payload as import("../types/state.types").ProjectUpdate;
        projectUpdates.push(payload.projectId);
      }
      if (impact.uiNotifications) {
        for (const notification of impact.uiNotifications) {
          narrativeEvents.push({
            type: notification.startsWith("CRISIS") ? "crisis" : "general",
            title: notification,
            description: notification,
            severity: notification.startsWith("CRISIS") ? "high" : "low",
          });
        }
      }
    }

    let totalRevenue = 0;
    let totalCosts = 0;

    if (ledgerImpact && ledgerImpact.type === "LEDGER_UPDATED") {
      const payload =
        ledgerImpact.payload as import("../types/state.types").LedgerImpact["payload"];
      const report = payload.report;
      totalRevenue = report.revenue.boxOffice + report.revenue.distribution + report.revenue.other;
      totalCosts =
        report.expenses.production + report.expenses.marketing + report.expenses.overhead;
    }

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
      newHeadlines: newsImpacts.map((i) => {
        const payload = i.payload as import("../types/state.types").NewsImpact["payload"];
        return {
          id: context.rng.uuid("news"),
          text: payload.headline || "Unknown Event",
          week: context.week,
          category: "general" as import("../types/engine.types").HeadlineCategory,
        };
      }),
      events: context.events.map((e) => e.title),
      narrativeEvents,
      isQuietWeek,
    };
  }
}
