import { GameState, StateImpact, Project, RivalStudio } from "@/engine/types";
import { BudgetTierKey } from "@/engine/types/project.types";
import { RandomGenerator } from "../utils/rng";
import { calculateOpeningWeekend } from "../systems/releaseSimulation";
import { StreamingViewershipTracker } from "../systems/production/StreamingViewershipTracker";
import { StudioArchetype, AI_ARCHETYPES } from "../data/aiArchetypes";
import { getBudgetInflation } from "../systems/industry/MacroCycle";
import { isPlayerOwner } from "../utils/ownership";
import { HeadlessController } from "./HeadlessController";

export class StudioAutomation {
  /**
   * Helper function to get the StudioArchetype for a rival studio.
   * Uses archetypeId if available, falls back to behaviorId for backward compatibility.
   */
  private static getRivalArchetype(rival: RivalStudio): StudioArchetype {
    const archetypeId =
      rival.archetypeId || ("behaviorId" in rival ? (rival as unknown as Record<string, unknown>).behaviorId as string : undefined);
    if (archetypeId) {
      const archetype = AI_ARCHETYPES.find((a) => a.id === archetypeId);
      if (archetype) return archetype;
    }
    // Default to BALANCED_GIANT if no archetype found
    return AI_ARCHETYPES.find((a) => a.id === "BALANCED_GIANT") || AI_ARCHETYPES[5];
  }

  /**
   * Main simulation tick for rival studios.
   * Handles project pitching, production, and high-level strategic adaptation.
   */
  static tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    const rivals = state.entities.rivals;
    if (!rivals) return impacts;

    // 1. Studio-Level Logic (Liquidation, Platform Launch, Strategy)
    for (const rid in rivals) {
      const rival = rivals[rid];
      if (!rival) continue;
      const isDistressed = (Number(rival.cash) || 0) < -50000000;

      if (isDistressed && state.week % 4 === 0 && rng.next() < 0.1) {
        this.triggerLiquidation(rival, state, rng, impacts);
      } else if (
        rival.cash > 500000000 &&
        (!rival.ownedPlatforms || rival.ownedPlatforms.length === 0)
      ) {
        const archetype = this.getRivalArchetype(rival);
      if (rng.next() < 0.05 * archetype.ma_willingness) {
          this.triggerPlatformLaunch(rival, state, rng, impacts);
        }
      }

      if (isDistressed !== rival.isAcquirable) {
        impacts.push({
          type: "RIVAL_UPDATED",
          payload: { rivalId: rival.id, update: { isAcquirable: isDistressed } },
        });
      }
    }

    // 2. Project-Level Logic (Centralized iteration)
    const allProjects = state.entities.projects;
    const rivalProjectCounts: Record<string, number> = {};

    if (allProjects) {
      for (const pid in allProjects) {
        const p = allProjects[pid];
        if (!p) continue;
        if (isPlayerOwner(state, p.ownerId) || !p.ownerId) continue;

        const rival = state.entities.rivals[p.ownerId];
        if (!rival) continue;

        this.processProject(p, rival.id, state, rng, impacts);

        if (p.state !== "archived") {
          rivalProjectCounts[rival.id] = (rivalProjectCounts[rival.id] || 0) + 1;
        }

        // Project Recycling (Keep memory usage low)
        if (p.state === "released" && state.week - (p.releaseWeek || 0) > 1) {
          impacts.push({
            type: "PROJECT_UPDATED",
            payload: { projectId: p.id, update: { state: "archived" } },
          });
        }
      }
    }

    // 3. Pitch New Projects (If slots available)
    for (const rid in rivals) {
      const rival = rivals[rid];
      if (!rival) continue;
      const activeCount = rivalProjectCounts[rival.id] || 0;
      // Increased slot cap for headless simulation (15 vs 3-6)
      const slotCap = 15;
      // Increased pitch probability for headless simulation (60% vs 4% * heat)
      const basePitchRate = 0.6;
      if (activeCount < slotCap && rng.next() < basePitchRate) {
        this.pitchNewProject(rival, state, rng, impacts, this.getRivalArchetype(rival));
      }
    }

    return impacts;
  }

  private static processProject(
    p: Project,
    studioId: string,
    state: GameState,
    rng: RandomGenerator,
    impacts: StateImpact[]
  ): void {
    // 1. Resolve Pitching (Random buyer pickup)
    if (p.state === "pitching") {
      const eligibleBuyers = state.market.buyers.filter(
        (b) => b.archetype === "streamer" || b.archetype === "network"
      );
      const buyer = rng.pick(eligibleBuyers);
      if (buyer && rng.next() < 0.3) {
        const update: Partial<Project> = { state: "production", weeksInPhase: 0 };
        impacts.push(
          this.createUpdateImpact(
            studioId,
            p.id,
            {
              ...update,
              buyerId: buyer.id,
              distributionStatus: buyer.archetype === "streamer" ? "streaming" : "theatrical",
            },
            state
          )
        );
      }
    }

    // 2. Resolve Greenlight (Immediate) — deduct production budget from rival cash
    if (p.state === "needs_greenlight") {
      const { update, subImpacts } = this.initializeProduction(p, studioId, state, rng);
      impacts.push(...subImpacts);
      impacts.push(this.createUpdateImpact(studioId, p.id, update, state));
      const rival = state.entities.rivals[studioId];
      if (rival && update.budget) {
        impacts.push({
          type: "RIVAL_UPDATED",
          payload: {
            rivalId: studioId,
            update: { cash: (rival.cash || 0) - (update.budget as number) },
          },
        });
      }
    }

    // 3. Resolve Marketing -> Release
    if (p.state === "marketing") {
      // Percentage-based marketing costs (30% of budget for balanced economics)
      const marketingBudget = Math.floor((p.budget || 40_000_000) * 0.3);
      const tier =
        marketingBudget > 20_000_000
          ? "blockbuster"
          : marketingBudget > 5_000_000
            ? "basic"
            : "none";

      const rivalPrestige =
        studioId === "PLAYER"
          ? state.studio.prestige
          : state.entities.rivals[studioId]?.prestige || 50;
      const { project: releasedProject } = calculateOpeningWeekend(
        { ...p, marketingLevel: tier, marketingBudget },
        [],
        rivalPrestige,
        1.0,
        0,
        state.week
      );

      // Status Transition (TV Special Case)
      let nextStatus = "released";
      let tvUpdate = {};
      if ((p.format === "tv" || p.type === "SERIES") && (p as unknown as Record<string, unknown>).tvDetails) {
        nextStatus = "ON_AIR";
        tvUpdate = { tvDetails: { ...(p as unknown as Record<string, unknown>).tvDetails as object, status: "ON_AIR" } };
      }

      // Initialize streaming viewership for streaming distribution
      let streamingUpdate = {};
      if (p.distributionStatus === "streaming" && p.buyerId) {
        const platform = state.market.buyers.find((b) => b.id === p.buyerId);
        if (platform) {
          const streamingViewership = StreamingViewershipTracker.initializeViewership(
            p,
            platform.id,
            platform,
            state.week,
            rng
          );
          // Store as array to match type definition (streamingViewership?: StreamingViewershipHistory[])
          streamingUpdate = { streamingViewership: [streamingViewership] };
        }
      }

      impacts.push({
        type: "PROJECT_UPDATED",
        payload: {
          projectId: p.id,
          update: {
            ...releasedProject,
            ...tvUpdate,
            ...streamingUpdate,
            state: nextStatus,
            weeksInPhase: 0,
            releaseWeek: state.week,
            activeCrisis: null,
          },
        },
      } as unknown as StateImpact);

      // Attribute prestige to the crew on rival releases too — without this the
      // talent pool only gains prestige from ~1/week player releases and the whole
      // A-list never emerges.
      const rivRev = releasedProject.revenue || 0;
      const totalCost = (p.budget || 0) + marketingBudget;
      const roi = totalCost > 0 ? rivRev / totalCost : 0;
      const isTv = p.format === "tv" || p.type === "SERIES";
      const rivIsHit = isTv ? roi > 1.1 : roi > 2.0;
      const rivRating = isTv ? Math.round(50 + (roi - 1) * 25) : 0;
      impacts.push(
        ...HeadlessController.attributeTalent(state, p as unknown as Record<string, unknown>, rivRev, rng, rivIsHit, rivRating)
      );
    }
  }

  private static triggerLiquidation(
    rival: RivalStudio,
    state: GameState,
    rng: RandomGenerator,
    impacts: StateImpact[]
  ): void {
    const vault = state.ip.vault || [];
    const rivalIPs = vault.filter((a) => a.ownerStudioId === rival.id);

    if (rivalIPs.length === 0) return;

    const asset = rng.pick(rivalIPs);
    const bidPrice = (asset.baseValue || 10000000) * (0.5 + rng.next() * 0.5);

    impacts.push({
      type: "NEWS_ADDED",
      payload: {
        id: rng.uuid("NWS"),
        headline: `LIQUIDATION: ${rival.name} auctions IP!`,
        description: `Facing financial pressure, ${rival.name} has sold ${asset.title} to the highest bidder for $${(bidPrice / 1000000).toFixed(1)}M.`,
        category: "business",
        week: state.week,
      },
    } as unknown as StateImpact);

    impacts.push({
      type: "RIVAL_UPDATED",
      payload: {
        rivalId: rival.id,
        update: {
          cash: (Number(rival.cash) || 0) + bidPrice,
        },
      },
    });

    impacts.push({
      type: "IP_UPDATED",
      payload: {
        assetId: asset.id,
        update: {
          rightsOwner: "STUDIO",
          ownerStudioId: "player",
        },
      },
    } as unknown as StateImpact);
  }

  private static triggerPlatformLaunch(
    rival: RivalStudio,
    state: GameState,
    rng: RandomGenerator,
    impacts: StateImpact[]
  ): void {
    const cost = 200000000;
    impacts.push({
      type: "NEWS_ADDED",
      payload: {
        id: rng.uuid("NWS"),
        headline: `BUSINESS: ${rival.name} launches streaming service!`,
        description: `Aiming for vertical integration, ${rival.name} has invested $200M in a new SVOD platform.`,
        category: "business",
      },
    } as unknown as StateImpact);
    impacts.push({
      type: "RIVAL_UPDATED",
      payload: { rivalId: rival.id, update: { cash: (Number(rival.cash) || 0) - cost } },
    });
  }

  private static pitchNewProject(
    rival: RivalStudio,
    state: GameState,
    rng: RandomGenerator,
    impacts: StateImpact[],
    archetype: StudioArchetype
  ): void {
    const id = rng.uuid("PRJ");

    const formatBias = archetype.greenlight_bias;
    const format = formatBias.length > 0 ? rng.pick(formatBias) : rng.next() < 0.3 ? "tv" : "film";

    const genreFocus = archetype.genreFocus;
    const genres =
      genreFocus.length > 0 && genreFocus[0] !== "Any"
        ? genreFocus
        : ["Action", "Drama", "Comedy", "Sci-Fi", "Horror", "Family"];
    const genre = rng.pick(genres);

    const budgetTiers: BudgetTierKey[] = ["indie", "low", "mid", "high", "blockbuster"];
    const weights = budgetTiers.map((tier) => archetype.budget_tier_weights[tier]);
    const budgetTier = this.weightedRandom(budgetTiers, weights, rng);

    const project: Record<string, unknown> = {
      id,
      title: `${genre} ${rng.rangeInt(1, 100)}`,
      genre,
      format,
      type: format === "tv" ? "SERIES" : "FILM",
      state: "pitching",
      weeksInPhase: 0,
      budgetTier,
      buzz: rng.rangeInt(20, 50),
      ownerId: rival.id,
      quality: 50,
      scriptHeat: 50,
      progress: 0,
      accumulatedCost: 0,
      weeksInDevelopment: 0,
    };

    if (format === "tv") {
      project.tvDetails = {
        status: "IN_DEVELOPMENT",
        episodesOrdered: rng.rangeInt(8, 13),
        episodesAired: 0,
        averageRating: 0,
        currentSeason: 1,
        episodesCompleted: 0,
      };
    }

    impacts.push({
      type: "PROJECT_CREATED",
      payload: { project },
    } as unknown as StateImpact);
  }

  /**
   * Helper function for weighted random selection based on weights
   */
  private static weightedRandom<T>(items: T[], weights: number[], rng: RandomGenerator): T {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = rng.next() * totalWeight;
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  private static initializeProduction(
    p: Project,
    studioId: string,
    state: GameState,
    rng: RandomGenerator
  ): { update: Partial<Project>; subImpacts: StateImpact[] } {
    const subImpacts: StateImpact[] = [];
    const inflation = getBudgetInflation(state.week);
    const tierBase: Record<string, number> = {
      indie: 5_000_000,
      low: 15_000_000,
      mid: 40_000_000,
      high: 80_000_000,
      blockbuster: 180_000_000,
    };
    const baseBudget =
      tierBase[(p.budgetTier as string) || "mid"] || rng.rangeInt(10, 80) * 1_000_000;
    const update: Partial<Project> = {
      state: "production",
      weeksInPhase: 0,
      productionWeeks: rng.rangeInt(8, 16),
      budget: p.budget || Math.floor(baseBudget * inflation),
      buzz: p.buzz || 40,
    };
    return { update, subImpacts };
  }

   
  private static createUpdateImpact(
    _studioId: string,
    projectId: string,
    update: Partial<Project>,
    _state: GameState
  ): StateImpact {
    return { type: "PROJECT_UPDATED", payload: { projectId, update } };
  }
}
