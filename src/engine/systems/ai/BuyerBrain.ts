import { Buyer, MandateType, GameState, StateImpact, StreamerPlatform } from "@/engine/types";
import { RandomGenerator } from "../../utils/rng";
import { WorldAssessment } from "./WorldAssessment";
import { getSimMemory } from "../../core/simMemory";

/**
 * BuyerBrain — mandate-aware platform/buyer decision layer.
 *
 * Replaces the random mandate rotation (buyers.ts updateBuyers, which was
 * never wired into the live tick) with utility scoring: buyers pick mandates
 * that fit their archetype economics, the market cycle, genre heat, and their
 * own subscriber/financial pressure. Decisions are recorded to
 * simMemory.buyerMemory so the intel layer and fit scoring can see history.
 */

const MANDATE_TYPES: MandateType[] = [
  "sci-fi",
  "comedy",
  "drama",
  "budget_freeze",
  "broad_appeal",
  "prestige",
];

const MANDATE_HEADLINES: Record<MandateType, string> = {
  "sci-fi": "Industry chatter: {name} is desperately looking for the next big Sci-Fi hit.",
  comedy: "{name} shifts focus, seeking half-hour comedies for their upcoming slate.",
  drama: "New mandate at {name}: high-stakes drama is the priority.",
  budget_freeze:
    "Austerity hits {name}! Execs are instituting a sudden budget freeze on new pitches.",
  broad_appeal: "{name} pivots to four-quadrant, broad appeal projects after subscriber churn.",
  prestige: "Awards chase: {name} announces a massive fund specifically for prestige projects.",
};

/** How each platform archetype instinctively weights each mandate. */
const ARCHETYPE_AFFINITY: Record<string, Partial<Record<MandateType, number>>> = {
  network: { comedy: 1.4, broad_appeal: 1.3, drama: 0.9, prestige: 0.6, "sci-fi": 0.7 },
  premium: { drama: 1.4, prestige: 1.5, "sci-fi": 0.9, comedy: 0.7, budget_freeze: 0.5 },
  streamer: { "sci-fi": 1.3, broad_appeal: 1.3, drama: 1.0, prestige: 0.8, budget_freeze: 0.6 },
};

/** Score a candidate mandate for this buyer against the world assessment. */
export function scoreMandate(buyer: Buyer, mandate: MandateType, world: WorldAssessment): number {
  let score = 50 * (ARCHETYPE_AFFINITY[buyer.archetype]?.[mandate] ?? 1.0);

  // Genre mandates track real trend heat minus saturation.
  const genreKey =
    mandate === "sci-fi"
      ? "Sci-Fi"
      : mandate === "comedy"
        ? "Comedy"
        : mandate === "drama"
          ? "Drama"
          : null;
  if (genreKey) {
    const g = world.genreHeat[genreKey];
    if (g) {
      score += (g.heat - 50) * 0.6;
      score -= Math.min(30, g.activeProjects * 4); // don't chase a crowded genre
    }
  }

  // Prestige appetite peaks during awards season and for prestige-tier buyers.
  if (mandate === "prestige") {
    if (world.calendarPhase === "AWARDS_SEASON") score += 25;
    if (buyer.archetype === "premium") score += 10;
  }

  // Broad appeal when a streamer is bleeding subscribers.
  if (mandate === "broad_appeal" && buyer.archetype === "streamer") {
    const sp = buyer as StreamerPlatform;
    const hist = sp.subscriberHistory || [];
    const last = hist[hist.length - 1]?.count ?? sp.subscribers ?? 0;
    const prev = hist[hist.length - 5]?.count ?? last;
    if (last < prev) score += 20; // shrinking → chase four-quadrant hits
  }

  // Budget freeze is a bear-market / distressed-buyer move.
  if (mandate === "budget_freeze") {
    if (world.marketCycle === "BEAR" || world.marketCycle === "RECESSION") score += 20;
    const cash = buyer.cash ?? 50_000_000;
    if (cash < 20_000_000) score += 25;
    if (world.marketCycle === "BOOM") score -= 30;
  }

  return score;
}

/** Choose the next mandate for a buyer. Returns the pick + a reason string. */
export function planBuyerMandate(
  buyer: Buyer,
  world: WorldAssessment,
  rng: RandomGenerator
): { type: MandateType; reason: string } {
  const currentType = buyer.currentMandate?.type;
  let best: MandateType = "broad_appeal";
  let bestScore = -Infinity;
  for (const m of MANDATE_TYPES) {
    if (m === currentType) continue;
    const score = scoreMandate(buyer, m, world) + rng.next() * 15;
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }

  let reason = `${buyer.name} pivots to "${best}".`;
  if (best === "budget_freeze") {
    reason = `${buyer.name} freezes spending — market is ${world.marketCycle.toLowerCase()} and reserves are thin.`;
  } else if (best === "prestige" && world.calendarPhase === "AWARDS_SEASON") {
    reason = `${buyer.name} chases awards-season prestige plays.`;
  } else if (best === "broad_appeal" && buyer.archetype === "streamer") {
    reason = `${buyer.name} orders broad four-quadrant content to stop subscriber churn.`;
  }
  return { type: best, reason };
}

/**
 * Weekly buyer-mandate tick. Replaces buyers.ts updateBuyers (which was dead
 * code): mandate expiry is evaluated against the shared world assessment and
 * every rotation is recorded to simMemory.buyerMemory.
 */
export function tickBuyerMandates(
  state: GameState,
  rng: RandomGenerator,
  world?: WorldAssessment
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const assessment = world ?? ({ week: state.week } as WorldAssessment);
  const buyers = state.market.buyers || [];
  const memory = getSimMemory(state).buyerMemory || {};

  for (const buyer of buyers) {
    if (buyer.acquiredBy) continue;
    const expired = !buyer.currentMandate || buyer.currentMandate.activeUntilWeek <= state.week;
    const drift = rng.next() < 0.04; // occasional early pivot
    if (!expired && !drift) continue;

    const pick = planBuyerMandate(buyer, assessment, rng);
    const duration = Math.floor(rng.range(12, 36));

    impacts.push({
      type: "BUYER_UPDATED",
      payload: {
        buyerId: buyer.id,
        update: {
          currentMandate: { type: pick.type, activeUntilWeek: state.week + duration },
        },
      },
    });

    const mem = memory[buyer.id] || { lastMandateWeek: 0, passesOnPlayer: 0 };
    impacts.push({
      type: "INDUSTRY_UPDATE",
      payload: {
        update: {
          [`simMemory.buyerMemory.${buyer.id}`]: { ...mem, lastMandateWeek: state.week },
        },
      },
    } as StateImpact);

    if (rng.next() < 0.6) {
      impacts.push({
        type: "NEWS_ADDED",
        payload: {
          id: rng.uuid("HL"),
          week: state.week,
          category: "market",
          headline: (MANDATE_HEADLINES[pick.type] || pick.reason).replace("{name}", buyer.name),
          description: pick.reason,
          type: "STUDIO_EVENT",
          buyerId: buyer.id,
        },
      });
    }
  }

  return impacts;
}
