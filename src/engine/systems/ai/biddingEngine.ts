import {
  GameState,
  RivalStudio,
  Opportunity,
  StateImpact,
  ArchetypeKey,
  StudioMotivation,
} from "@/engine/types";
import { RandomGenerator } from "../../utils/rng";
import { RivalPlan } from "./rival/plan.types";

/**
 * AI Decision Multipliers.
 */
const ArchetypeMultipliers: Record<string, (genre: string) => number> = {
  indie: (genre) => (genre === "Drama" || genre === "Horror" ? 1.4 : 0.8),
  major: (genre) => (genre === "Sci-Fi" || genre === "Action" ? 1.6 : 0.6),
  "mid-tier": () => 1.15,
};

interface MotivationBias {
  cashThreshold: number;
  bidCapPct: number;
  multiplier: number;
}

const MOTIVATION_BIASES: Record<StudioMotivation, (genre?: string) => MotivationBias> = {
  FRANCHISE_BUILDING: (genre) => {
    const isIP = genre === "Sci-Fi" || genre === "Action" || genre === "Fantasy";
    return {
      cashThreshold: isIP ? 1.1 : 1.3,
      bidCapPct: isIP ? 0.6 : 0.35,
      multiplier: isIP ? 1.6 : 1.0,
    };
  },
  CASH_CRUNCH: () => ({
    cashThreshold: 2.0,
    bidCapPct: 0.15,
    multiplier: 0.8,
  }),
  AWARD_CHASE: (genre) => {
    const isPrestige = genre === "Drama" || genre === "Historical";
    return {
      cashThreshold: isPrestige ? 1.0 : 1.3,
      bidCapPct: isPrestige ? 0.5 : 0.35,
      multiplier: isPrestige ? 1.3 : 1.0,
    };
  },
  MARKET_DISRUPTION: () => ({
    cashThreshold: 0.8,
    bidCapPct: 0.4,
    multiplier: 1.8,
  }),
  STABILITY: () => ({
    cashThreshold: 1.3,
    bidCapPct: 0.35,
    multiplier: 1.0,
  }),
};

/**
 * AI Auction Tick.
 * When weekly rival plans are supplied, each rival's declared bid intents are
 * executed verbatim (the brain already priced them, including spite boosts);
 * rivals without a plan fall back to the legacy inline bidding roll.
 */
export function tickAuctions(
  state: GameState,
  rng: RandomGenerator,
  plans?: Record<string, RivalPlan>
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const currWeek = state.week;
  const opportunities = state.market.opportunities.filter(
    (o) => (o.expirationWeek || 0) >= currWeek
  );

  if (plans) {
    const oppById = new Map(opportunities.map((o) => [o.id, o]));
    for (const rivalId in plans) {
      const plan = plans[rivalId];
      const rival = state.entities.rivals?.[rivalId];
      if (!rival) continue;
      for (const intent of plan.bids) {
        const opportunity = oppById.get(intent.opportunityId);
        if (!opportunity) continue;
        impacts.push({
          type: "OPPORTUNITY_UPDATED",
          payload: {
            opportunityId: opportunity.id,
            rivalId: rival.id,
            bid: { amount: intent.amount, terms: "aggressive" },
          },
        });
        if (intent.amount > 10_000_000 && (intent.spiteBoost > 1.2 || rng.next() < 0.2)) {
          impacts.push({
            type: "NEWS_ADDED",
            payload: {
              headline: `STREET TALK: ${rival.name} desperate for "${opportunity.title}"?`,
              description: `${rival.name} has escalated the bidding for "${opportunity.title}", signaling they might view it as a cornerstone asset for their next slate.`,
              rivalId: rival.id,
            },
          });
        }
      }
    }
    return impacts;
  }
  // ⚡ Bolt: Removed ALL_RIVALS Object.values allocation

  // Genre-trend lookup map — O(1) per opportunity instead of a .find() scan.
  // `has` guard preserves the original first-wins semantics on duplicate genres.
  const genreTrendMap = new Map<string, NonNullable<typeof state.market.trends>[number]>();
  state.market.trends?.forEach((t) => {
    if (t.genre && !genreTrendMap.has(t.genre.toLowerCase())) {
      genreTrendMap.set(t.genre.toLowerCase(), t);
    }
  });

  opportunities.forEach((opportunity) => {
    // ⚡ Bolt: Replaced Object.values().reduce() with direct for...in loop
    let currentHighest = 0;
    if (opportunity.bids) {
      for (const bidId in opportunity.bids) {
        currentHighest = Math.max(currentHighest, opportunity.bids[bidId].amount);
      }
    }

    // ⚡ Bolt: Replaced ALL_RIVALS.forEach with for...in loop over state.entities.rivals
    for (const rivalId in state.entities.rivals) {
      const rival = state.entities.rivals[rivalId];
      const myBid = opportunity.bids?.[rival.id]?.amount || 0;
      const isPlayerLeading =
        opportunity.highestBidderId === state.studio.id || opportunity.highestBidderId === "PLAYER";
      const aggressionFactor = isPlayerLeading ? 1.2 : 1.0;

      const bias = MOTIVATION_BIASES[rival.currentMotivation || "STABILITY"](opportunity.genre);
      let { cashThreshold, multiplier } = bias;
      const { bidCapPct } = bias;

      // Spite-bidding override
      if (rival.currentMotivation === "MARKET_DISRUPTION" && isPlayerLeading) {
        cashThreshold = 0.8;
        multiplier = 1.8;
      }

      // Open bidding against the ask price when no bids exist yet — otherwise
      // unbid auctions are permanent no-ops and rivals can never be outbid.
      const referenceBid = currentHighest > 0 ? currentHighest : opportunity.costToAcquire || 0;
      const isOpeningBid = currentHighest === 0 && myBid === 0;
      if (
        referenceBid > 0 &&
        myBid < referenceBid &&
        rival.cash > referenceBid * cashThreshold &&
        (!isOpeningBid || rng.next() < 0.3)
      ) {
        const archetypeFactor =
          ArchetypeMultipliers[rival.archetype as ArchetypeKey]?.(opportunity.genre) || 1.0;
        const totalMultiplier = archetypeFactor * aggressionFactor * multiplier;
        const newBid = Math.floor(referenceBid * (1 + rng.range(0.05, 0.2) * totalMultiplier));

        let trendMultiplier = 1.0;
        const genreTrend = opportunity.genre
          ? genreTrendMap.get(opportunity.genre.toLowerCase())
          : undefined;
        if (genreTrend) {
          if (genreTrend.heat >= 60) trendMultiplier = 1.2;
          else if (genreTrend.heat <= 30) trendMultiplier = 0.8;
        }
        const trendAdjustedBid = Math.floor(newBid * trendMultiplier);

        if (trendAdjustedBid < rival.cash * bidCapPct) {
          impacts.push({
            type: "OPPORTUNITY_UPDATED",
            payload: {
              opportunityId: opportunity.id,
              rivalId: rival.id,
              bid: { amount: trendAdjustedBid, terms: "aggressive" },
            },
          });

          if (trendAdjustedBid > 10_000_000 && rng.next() < 0.2) {
            impacts.push({
              type: "NEWS_ADDED",
              payload: {
                headline: `STREET TALK: ${rival.name} desperate for "${opportunity.title}"?`,
                description: `${rival.name} has escalated the bidding for "${opportunity.title}", signaling they might view it as a cornerstone asset for their next slate.`,
              },
            });
          }
        }
      }
    }
  });

  return impacts;
}

export function calculateLiveCounterBid(
  opportunity: Opportunity,
  playerBid: number,
  rival: RivalStudio,
  rng: RandomGenerator
): StateImpact | null {
  if (rival.cash < playerBid * 2 || rival.prestige < 60) return null;

  let multiplier =
    ArchetypeMultipliers[rival.archetype as ArchetypeKey]?.(opportunity.genre) || 1.1;
  let reactionThreshold = 0.3;

  if (
    rival.currentMotivation === "FRANCHISE_BUILDING" &&
    (opportunity.genre === "Sci-Fi" ||
      opportunity.genre === "Action" ||
      opportunity.genre === "Fantasy")
  ) {
    reactionThreshold = 0.6;
    multiplier = 1.4;
  } else if (rival.currentMotivation === "MARKET_DISRUPTION") {
    reactionThreshold = 0.5;
    multiplier = 1.3;
  }

  if (rng.next() < reactionThreshold) {
    const counterAmount = Math.floor(playerBid * rng.range(1.05, 1.15) * multiplier);
    if (counterAmount < rival.cash * 0.4) {
      return {
        type: "OPPORTUNITY_UPDATED",
        payload: {
          opportunityId: opportunity.id,
          rivalId: rival.id,
          bid: { amount: counterAmount, terms: "aggressive" },
        },
      };
    }
  }

  return null;
}

export function getLiveCounterBid(opportunity: Opportunity, increment: number = 0.1): number {
  let currentMax = opportunity.costToAcquire;
  if (opportunity.bids) {
    for (const bidId in opportunity.bids) {
      if (opportunity.bids[bidId].amount > currentMax) {
        currentMax = opportunity.bids[bidId].amount;
      }
    }
  }
  return Math.round((currentMax * (1 + increment)) / 1000) * 1000;
}
