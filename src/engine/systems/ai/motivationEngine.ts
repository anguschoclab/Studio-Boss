import { GameState, RivalStudio, StudioMotivation, StateImpact, SeriesProject } from "@/engine/types";
import { RandomGenerator } from "../../utils/rng";
import { determineSyndicationTier, getSyndicationImpact, calculateSyndicationProgress } from "../ip/syndicationEngine";
import { SyndicationTier } from "../../data/syndicationConfig";

/**
 * Utility Scores for each Studio Motivation.
 * Each function returns a weight (0-100) based on the current context.
 */
const MotivationScores: Record<StudioMotivation, (rival: RivalStudio, state: GameState) => number> =
  {
    // 🎭 The Method Actor Tuning: Studio motivations emerge dynamically from their material conditions.
    // Desperate studios with low cash heavily index towards CASH_CRUNCH.
    CASH_CRUNCH: (rival) => {
      if (rival.cash < 5000000) return 100;
      if (rival.cash < 10000000) return 60;
      return 0;
    },
    // 🎭 The Method Actor Tuning: Wealthy or highly prestigious studios chase awards, but so do aggressive upstarts looking for credibility.
    AWARD_CHASE: (rival) => {
      let score = rival.prestige > 75 ? 85 : 30;
      if (rival.prestige < 40 && rival.motivationProfile.aggression > 60) score += 40; // Desperate for credibility
      if (rival.cash > 15000000 && rival.prestige > 70) score += 40; // Rich studios pivot to awards
      return score;
    },
    // 🎭 The Method Actor Tuning: Cash-rich studios aggressively focus on building franchises to secure long-term revenue.
    FRANCHISE_BUILDING: (rival) => {
      let score = Object.keys(rival.projects).length > 3 ? 60 : 20;
      if (rival.cash > 10000000) score += 40; // Got cash, want IP
      if (rival.cash > 20000000) score += 30; // Extreme cash makes them hoard IP
      return score;
    },
    // 🎭 The Method Actor Tuning: Highly aggressive studios naturally lean towards market disruption, especially if they have cash to burn.
    MARKET_DISRUPTION: (rival) => {
      let score = rival.motivationProfile.aggression > 70 ? 75 : 10;
      if (rival.cash > 15000000) score += 20; // Enough cash to cause trouble
      if (rival.prestige > 75 && rival.motivationProfile.aggression > 70) score += 40; // Prestige bullies
      return score;
    },
    // 🎭 The Method Actor Tuning: Stability is the fallback for wealthy, low-aggression studios.
    STABILITY: (rival) =>
      rival.cash > 5000000 && rival.motivationProfile.aggression < 50 ? 80 : 20,
  };

/**
 * AI Decision Brain (Target C1).
 * Pure function that evaluates the best focus for a Rival Studio.
 */
export function calculateRivalMotivation(
  rival: RivalStudio,
  state: GameState,
  rng: RandomGenerator
): StudioMotivation {
  let bestScore = -1;
  let bestMotivation: StudioMotivation = "STABILITY";

  const profileMap: Record<StudioMotivation, keyof import("@/engine/types").MotivationProfile> = {
    CASH_CRUNCH: "financial",
    AWARD_CHASE: "prestige",
    FRANCHISE_BUILDING: "legacy",
    MARKET_DISRUPTION: "aggression",
    STABILITY: "financial",
  };

  Object.entries(MotivationScores).forEach(([motivation, scorer]) => {
    // Add profile bias
    const baseScore = scorer(rival, state);
    const profileKey = profileMap[motivation as StudioMotivation];
    const bias =
      Number(rival.motivationProfile[profileKey as keyof typeof rival.motivationProfile]) || 0;

    // Add small stochastic variance for strategy shifts
    const variance = rng.range(-5, 5);
    const finalScore = baseScore + bias + variance;

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestMotivation = motivation as StudioMotivation;
    }
  });

  return bestMotivation;
}

/**
 * Weekly tick to update AI mindsets across the industry.
 */
export function tickAIMinds(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];

  const rivalsObj = state.entities.rivals || {};
  for (const rivalId in rivalsObj) {
    const rival = rivalsObj[rivalId];
    let newMotivation: StudioMotivation = calculateRivalMotivation(rival, state, rng);

    // Fix 3: Prestige decay — rivals that haven't won an award in 2+ years drift toward AWARD_CHASE
    const lastAwardWin = rival.lastAwardWin;
    const weeksSinceLastAward = lastAwardWin ? state.week - lastAwardWin : 999;

    // 🎭 The Method Actor Tuning: Prestige studios panic and pivot to chasing awards much faster (1 year vs 2 years) if they are starved.
    const awardStarvedThreshold = rival.prestige > 75 ? 52 : 104;

    if (
      weeksSinceLastAward > awardStarvedThreshold &&
      newMotivation !== "AWARD_CHASE" &&
      rng.next() < 0.15
    ) {
      // 15% chance per week to switch to AWARD_CHASE if award-starved
      newMotivation = "AWARD_CHASE";
    }

    impacts.push({
      type: "RIVAL_UPDATED",
      payload: {
        rivalId: rival.id,
        update: { currentMotivation: newMotivation },
      },
    });

    // CASH_CRUNCH rivals seek emergency financing when nearly broke
    if (newMotivation === "CASH_CRUNCH" && rival.cash < 2_000_000 && rng.next() < 0.12) {
      const loanAmount = rng.range(5_000_000, 15_000_000);
      impacts.push({
        type: "RIVAL_UPDATED",
        payload: { rivalId: rival.id, update: { cash: rival.cash + loanAmount } },
      });
      impacts.push({
        type: "NEWS_ADDED",
        payload: {
          headline: `${rival.name} SECURES EMERGENCY FINANCING`,
          description: `${rival.name} draws on a credit facility to stabilise operations amid cash pressure.`,
        },
      } as import("@/engine/types").StateImpact);
    }

    // Fix 2: FRANCHISE_BUILDING rivals track IP syndication potential
    if (newMotivation === "FRANCHISE_BUILDING") {
      const tvProjects: SeriesProject[] = [];
      const projectsObj = state.entities.projects || {};
      for (const projectId in projectsObj) {
        const p = projectsObj[projectId];
        if (p.ownerId === rival.id && p.state === "released" && p.format === "tv" && "tvDetails" in p) {
          tvProjects.push(p as SeriesProject);
        }
      }

      const TIER_ORDER: Record<SyndicationTier, number> = { NONE: 0, BRONZE: 1, SILVER: 2, GOLD: 3 };
      const BASE_SYNDICATION_REVENUE = 150_000;

      let syndicatedCount = 0;
      let nearSyndicationCount = 0;
      let bestTier: SyndicationTier = "NONE";
      let weeklyRevenue = 0;
      let milestoneShow: { title: string; tier: SyndicationTier } | null = null;

      for (const show of tvProjects) {
        const episodes = show.tvDetails?.episodesAired ?? 0;
        const genre = show.genre || "Drama";
        const tier = determineSyndicationTier(episodes, genre);

        if (tier !== "NONE") {
          syndicatedCount++;
          const impact = getSyndicationImpact(tier);
          weeklyRevenue += Math.round(BASE_SYNDICATION_REVENUE * impact.revenueMultiplier);
          if (TIER_ORDER[tier] > TIER_ORDER[bestTier]) {
            bestTier = tier;
            milestoneShow = { title: show.title, tier };
          }
        } else {
          const progress = calculateSyndicationProgress(episodes, genre);
          if (progress.progress >= 80) {
            nearSyndicationCount++;
          }
        }
      }

      const prevPotential = rival.syndicationPotential;
      const isNewMilestone =
        milestoneShow !== null &&
        (prevPotential === undefined ||
          syndicatedCount > prevPotential.syndicatedCount ||
          TIER_ORDER[bestTier] > TIER_ORDER[prevPotential.bestTier]);

      impacts.push({
        type: "RIVAL_UPDATED",
        payload: {
          rivalId: rival.id,
          update: {
            syndicationPotential: { syndicatedCount, bestTier, nearSyndicationCount, weeklyRevenue },
          },
        },
      });

      if (weeklyRevenue > 0) {
        impacts.push({
          type: "RIVAL_UPDATED",
          payload: {
            rivalId: rival.id,
            update: { cash: rival.cash + weeklyRevenue },
          },
        });
      }

      if (isNewMilestone && milestoneShow) {
        impacts.push({
          type: "NEWS_ADDED",
          payload: {
            headline: `${rival.name.toUpperCase()} IP ENTERS SYNDICATION`,
            description: `${rival.name}'s "${milestoneShow.title}" has reached ${milestoneShow.tier} tier syndication, unlocking passive revenue streams.`,
          },
        } as StateImpact);
      }
    }
  }

  return impacts;
}
