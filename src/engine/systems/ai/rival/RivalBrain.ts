import { GameState, RivalStudio, SeriesProject, BudgetTierKey, StateImpact } from "../../../types";
import { RandomGenerator } from "../../../utils/rng";
import { isPlayerProject } from "../../../utils/ownership";
import { WorldAssessment, buildWorldAssessment, stanceFor } from "../WorldAssessment";
import { calculateRivalMotivation } from "../motivationEngine";
import { getStudioArchetype } from "../../../data/aiArchetypes";
import { BUDGET_TIERS } from "../../../data/budgetTiers";
import { RivalPlan, RivalSeriesIntent } from "./plan.types";

/**
 * RivalBrain — per-rival weekly planner.
 *
 * `planRivalWeek` is a pure utility function: given a rival, the shared
 * WorldAssessment blackboard, and deterministic RNG it produces a typed
 * RivalPlan — what this rival intends to do this week and WHY (reasons[]).
 * Executor systems consume the intents; nothing here mutates state.
 *
 * `tickRivalPlans` runs once per tick inside WeekCoordinator: it generates a
 * plan for every rival in stable id order and persists the explainability
 * payload to `rival.intel` via RIVAL_UPDATED.
 */

const SLATE_CAP: Record<string, number> = { major: 6, "mid-tier": 4, indie: 3 };
const SPAWN_RATE: Record<string, number> = { major: 0.5, "mid-tier": 0.3, indie: 0.2 };
const FALLBACK_GENRES = ["Action", "Drama", "Comedy", "Sci-Fi", "Horror", "Family"];

function emptyPlan(rivalId: string, week: number): RivalPlan {
  return {
    rivalId,
    week,
    motivation: "STABILITY",
    stance: "neutral",
    slate: { count: 0, budgetTiers: [], preferredGenres: [], preferTv: false },
    bids: [],
    marketing: {},
    strategic: { mna: [], awardsPush: [] },
    talent: [],
    series: [],
    rivalSpend: 0,
    reasons: [],
  };
}

export function planRivalWeek(
  rival: RivalStudio,
  world: WorldAssessment,
  state: GameState,
  rng: RandomGenerator
): RivalPlan {
  const plan = emptyPlan(rival.id, world.week);
  const archetype = getStudioArchetype(rival.archetypeId || rival.behaviorId || "");
  const standing = world.studioStandings[rival.id];
  const reasons = plan.reasons;

  // --- 1. Motivation (single source: planner derives, tickAIMinds consumes) ---
  plan.motivation = calculateRivalMotivation(rival, state, rng);
  const lastAwardWin = rival.lastAwardWin;
  const awardStarved = world.week - (lastAwardWin ?? -999) > (rival.prestige > 75 ? 52 : 104);
  if (awardStarved && plan.motivation !== "AWARD_CHASE" && rng.next() < 0.15) {
    plan.motivation = "AWARD_CHASE";
    reasons.push("Award-starved for over a year — pivoting to AWARD_CHASE.");
  }

  // --- 2. Stance vs player ---
  plan.stance = stanceFor(state, rival.id, world.playerThreat);
  if (plan.stance === "hostile") {
    reasons.push("Repeatedly outbid/poached by the player — hostile posture active.");
  } else if (plan.stance === "deferential") {
    reasons.push("Player dominates the market — avoiding direct confrontation.");
  }

  const distressed = standing?.cashTier === "distressed" || rival.cash < 0;

  // --- 3. Slate plan ---
  const slotCap = SLATE_CAP[rival.archetype] ?? 4;
  const active = standing?.activeProjects ?? 0;
  let slateCount = 0;
  if (active < slotCap && !distressed) {
    let rate = (SPAWN_RATE[rival.archetype] ?? 0.3) * world.marketHeat;
    if (plan.motivation === "FRANCHISE_BUILDING" || plan.motivation === "MARKET_DISRUPTION") {
      rate += 0.15;
    } else if (plan.motivation === "CASH_CRUNCH") {
      rate *= 0.5;
    } else if (plan.motivation === "STABILITY") {
      rate *= 0.8;
    }
    if (standing && standing.runwayWeeks < 26) rate *= 0.5;
    slateCount = rng.next() < Math.min(0.9, rate) ? 1 : 0;
    // Acquirers/franchise builders keep their pipeline fuller.
    if (
      slateCount === 1 &&
      active + 2 < slotCap &&
      archetype.riskAppetite > 60 &&
      rng.next() < 0.25
    ) {
      slateCount = 2;
    }
  }
  plan.slate.count = slateCount;
  if (slateCount === 0) {
    reasons.push(
      distressed
        ? "Slate frozen — cash distressed."
        : active >= slotCap
          ? `Slate full (${active}/${slotCap} active projects).`
          : "Holding slate — no new development this week."
    );
  }

  // Genres: archetype focus × trend heat, saturated genres penalized.
  const focus = archetype.preferredGenres.filter((g) => g !== "Any");
  const genrePool = focus.length > 0 ? focus : FALLBACK_GENRES;
  const scored = genrePool
    .map((g) => {
      const a = world.genreHeat[g];
      const heat = (a?.heat ?? 50) / 50;
      const saturation = a?.activeProjects ?? 0;
      return { g, score: heat * (1 - Math.min(0.7, saturation * 0.12)) };
    })
    .sort((x, y) => y.score - x.score);
  plan.slate.preferredGenres = scored.slice(0, 2).map((s) => s.g);

  // Budget tiers: archetype weights filtered by affordability.
  const inflation = world.budgetInflation;
  const tierKeys = Object.keys(archetype.budget_tier_weights) as BudgetTierKey[];
  for (let i = 0; i < slateCount; i++) {
    const affordable = tierKeys.filter(
      (t) =>
        archetype.budget_tier_weights[t] > 0 &&
        BUDGET_TIERS[t].budget * inflation <= Math.max(0, rival.cash) * 0.8
    );
    const pool = affordable.length > 0 ? affordable : ["low" as BudgetTierKey];
    const total = pool.reduce((s, t) => s + (archetype.budget_tier_weights[t] || 0.05), 0);
    let roll = rng.next() * total;
    let picked: BudgetTierKey = pool[pool.length - 1];
    for (const t of pool) {
      roll -= archetype.budget_tier_weights[t] || 0.05;
      if (roll <= 0) {
        picked = t;
        break;
      }
    }
    plan.slate.budgetTiers.push(picked);
  }
  plan.slate.preferTv = archetype.greenlight_bias.includes("tv") && rng.next() < 0.35;
  if (slateCount > 0) {
    reasons.push(
      `Developing ${slateCount} ${plan.slate.preferTv ? "TV " : ""}${plan.slate.budgetTiers.join("/")} project(s) in ${plan.slate.preferredGenres.join(" & ")}.`
    );
  }

  // --- 4. Auction bids ---
  const opportunities = state.market.opportunities || [];
  for (const opp of opportunities) {
    if ((opp.expirationWeek || 0) < world.week) continue;
    const myBid = opp.bids?.[rival.id]?.amount || 0;
    let highest = 0;
    for (const bidId in opp.bids || {}) {
      highest = Math.max(highest, opp.bids[bidId].amount);
    }
    const playerLeading =
      opp.highestBidderId === state.studio.id || opp.highestBidderId === "PLAYER";
    const referenceBid = highest > 0 ? highest : opp.costToAcquire || 0;
    if (referenceBid <= 0 || myBid >= referenceBid) continue;

    // Motivation-scaled budget discipline.
    const bidCapPct =
      plan.motivation === "CASH_CRUNCH" ? 0.15 : plan.motivation === "STABILITY" ? 0.35 : 0.4;
    if (rival.cash < referenceBid * 1.1) continue;
    if (referenceBid > rival.cash * bidCapPct) continue;

    const aggression = archetype.biddingAggression / 100;
    if (rng.next() > aggression) continue;

    // Spite: hostile stance + player leading escalates beyond value.
    let spiteBoost = 1;
    if (playerLeading && plan.stance === "hostile") spiteBoost = 1.35;
    else if (playerLeading && plan.stance === "rivalrous") spiteBoost = 1.15;
    else if (playerLeading) spiteBoost = 1.05;
    else if (plan.stance === "deferential") spiteBoost = 0.85;

    const amount = Math.floor(referenceBid * (1 + rng.next() * 0.15) * spiteBoost);
    if (amount > rival.cash * bidCapPct) continue;

    plan.bids.push({ opportunityId: opp.id, amount, spiteBoost });
    if (spiteBoost > 1.2) {
      reasons.push(
        `Spite-bidding "${opp.title}" to deny the player (+${Math.round((spiteBoost - 1) * 100)}%).`
      );
    }
  }

  // --- 5. Marketing spend + release timing ---
  const projects = state.entities.projects || {};
  let marketingTotal = 0;
  let playerReleaseWeek: number | null = null;
  for (const pid in projects) {
    const p = projects[pid];
    if (isPlayerProject(state, p) && p.state === "marketing" && p.releaseWeek) {
      playerReleaseWeek = p.releaseWeek;
    }
  }
  for (const pid in projects) {
    const p = projects[pid];
    if (p.ownerId !== rival.id) continue;
    if (p.state !== "marketing" && p.state !== "post_production") continue;
    const pct = p.budgetTier === "blockbuster" ? 0.3 : p.budgetTier === "high" ? 0.25 : 0.15;
    let spend = Math.floor((p.budget || BUDGET_TIERS[p.budgetTier || "mid"].budget) * pct);
    if (plan.motivation === "AWARD_CHASE" && p.format !== "tv") {
      spend = Math.floor(spend * 1.3);
    } else if (plan.motivation === "CASH_CRUNCH") {
      spend = Math.floor(spend * 0.5);
    }
    if (spend > 0) plan.marketing[p.id] = spend;
    marketingTotal += spend;

    // Counter-programming: hostile rivals park a tentpole on the player's
    // release week; deferential rivals shift away.
    if (
      !plan.releaseIntent &&
      p.state === "post_production" &&
      playerReleaseWeek !== null &&
      (p.budgetTier === "blockbuster" || p.budgetTier === "high")
    ) {
      if (plan.stance === "hostile" || plan.stance === "rivalrous") {
        plan.releaseIntent = { projectId: p.id, targetWeek: playerReleaseWeek };
        reasons.push(`Counter-programming player's release window (week ${playerReleaseWeek}).`);
      } else if (plan.stance === "deferential") {
        plan.releaseIntent = { projectId: p.id, targetWeek: playerReleaseWeek + 4 };
        reasons.push(`Yielding release window — player tentpole at week ${playerReleaseWeek}.`);
      }
    }
  }
  const archetypeMult =
    rival.archetype === "major" ? 2.2 : rival.archetype === "mid-tier" ? 1.0 : 0.4;
  plan.rivalSpend = marketingTotal + Math.floor(5_000_000 * archetypeMult);

  // --- 6. Strategic: M&A ---
  const wantsMA = archetype.strategy === "acquirer" || archetype.ma_willingness > 0.5;
  if (wantsMA && !distressed && rival.cash > 100_000_000) {
    for (const tid in state.entities.rivals) {
      if (tid === rival.id) continue;
      const target = state.entities.rivals[tid];
      const targetDistressed = target.cash < 0 || target.isAcquirable;
      const strategic = archetype.strategy === "acquirer";
      if (!targetDistressed && !strategic) continue;
      if (rng.next() > archetype.ma_willingness * 0.15) continue;
      const maxBid = Math.floor(rival.cash * 0.3);
      if (maxBid <= 0) continue;
      plan.strategic.mna.push({
        targetId: tid,
        kind: targetDistressed ? "opportunistic" : "strategic",
        maxBid,
      });
      reasons.push(
        `Circling ${target.name} (${targetDistressed ? "distressed" : "strategic fit"}).`
      );
      break; // one M&A target per week
    }
  }

  // --- 7. Strategic: awards push ---
  if (plan.motivation === "AWARD_CHASE" || archetype.awardObsession > 60) {
    for (const pid in projects) {
      const p = projects[pid];
      if (p.ownerId !== rival.id || p.format === "tv") continue;
      if (p.state !== "released" && p.state !== "post_release") continue;
      if (!p.releaseWeek || world.week - p.releaseWeek > 26) continue;
      const spend = Math.floor(archetype.awardObsession * 750);
      if (spend > 0) {
        plan.strategic.awardsPush.push({ projectId: p.id, spend });
        reasons.push(`Campaign spend behind "${p.title}" for awards season.`);
        break; // one campaign target per week
      }
    }
  }

  // --- 8. Talent intents ---
  const poachish =
    archetype.strategy === "poacher" || plan.stance === "hostile" || plan.stance === "rivalrous";
  if (poachish && rival.cash > 50_000_000) {
    // Poach-on-delay: talent attached to player projects stalled in development.
    for (const pid in projects) {
      const p = projects[pid];
      if (!isPlayerProject(state, p)) continue;
      if (p.state !== "development" || (p.weeksInPhase ?? 0) < 6) continue;
      const contractIds = state.entities.contractsByProjectId?.[p.id] || [];
      for (const cid of contractIds) {
        const c = state.entities.contracts[cid];
        const t = c && state.entities.talents[c.talentId];
        if (t && !t.retired && t.prestige >= 60) {
          plan.talent.push({
            talentId: t.id,
            approach: "poach",
            reason: "delay_response",
          });
          reasons.push(`Circling ${t.name} — player project "${p.title}" is stalled.`);
          break;
        }
      }
      if (plan.talent.length > 0) break;
    }
    // Strategic hold on a top free agent if no poach target surfaced.
    if (plan.talent.length === 0 && archetype.talentLoyalty < 60 && rng.next() < 0.1) {
      const supply = world.talentSupply;
      if (supply.A_LIST > 0) {
        for (const tid in state.entities.talents) {
          const t = state.entities.talents[tid];
          if (t.tier === "A_LIST" && !t.contractId && !t.retired) {
            plan.talent.push({ talentId: t.id, approach: "first_look", reason: "hold" });
            reasons.push(`First-look hold on free agent ${t.name}.`);
            break;
          }
        }
      }
    }
  }

  // --- 9. TV series decisions ---
  for (const pid in projects) {
    const p = projects[pid];
    if (p.ownerId !== rival.id || p.type !== "SERIES" || !("tvDetails" in p)) continue;
    const sp = p as SeriesProject;
    if (sp.tvDetails.status !== "ON_AIR") continue;
    const remaining = (sp.tvDetails.episodesOrdered || 10) - (sp.tvDetails.episodesAired || 0);
    if (remaining > 2) continue;
    const rating = sp.tvDetails.averageRating || 0;
    let decision: RivalSeriesIntent["decision"] = "let_ride";
    let reason: RivalSeriesIntent["reason"] = "ratings";
    const prestigePlayer = plan.motivation === "AWARD_CHASE" || rival.prestige > 75;
    const commercialAnchor =
      archetype.strategy === "genre_specialist" &&
      (p.genre === "Family" || p.genre === "Comedy" || p.genre === "Unscripted");
    if (commercialAnchor && rating >= 45) {
      decision = "renew";
      reason = "anchor";
    } else if (prestigePlayer && rating >= 40) {
      decision = "renew";
      reason = "prestige";
    } else if (plan.motivation === "CASH_CRUNCH" && rating < 55) {
      decision = "cancel";
      reason = "economics";
    }
    if (decision !== "let_ride") {
      plan.series.push({ projectId: p.id, decision, reason });
      reasons.push(
        `${decision === "renew" ? "Renewing" : "Cancelling"} "${p.title}" (${reason}, rating ${rating}).`
      );
    }
  }

  return plan;
}

/**
 * Weekly plan generation — stable rival-id ordering, one RivalPlan per rival.
 * Writes the explainability payload to rival.intel and syncs the motivation
 * the planner actually used into rival.currentMotivation.
 */
export function tickRivalPlans(
  state: GameState,
  context: {
    week: number;
    rng: RandomGenerator;
    impacts: StateImpact[];
    world?: WorldAssessment;
  }
): Record<string, RivalPlan> {
  const world = context.world ?? buildWorldAssessment(state);
  const plans: Record<string, RivalPlan> = {};
  const rivals = state.entities.rivals || {};
  for (const rid in rivals) {
    const rival = rivals[rid];
    if (!rival) continue;
    const plan = planRivalWeek(rival, world, state, context.rng);
    plans[rid] = plan;
    context.impacts.push({
      type: "RIVAL_UPDATED",
      payload: {
        rivalId: rid,
        update: {
          currentMotivation: plan.motivation,
          intel: {
            motivation: plan.motivation,
            strategyLabel: getStudioArchetype(rival.archetypeId || rival.behaviorId || "").strategy,
            stance: plan.stance,
            planSummary: summarizePlan(plan),
            reasons: plan.reasons.slice(0, 12),
            updatedWeek: context.week,
          },
        },
      },
    });
  }
  return plans;
}

function summarizePlan(plan: RivalPlan): string[] {
  const out: string[] = [];
  if (plan.slate.count > 0) {
    out.push(
      `Developing ${plan.slate.count}x ${plan.slate.preferTv ? "series" : "film"} (${plan.slate.budgetTiers.join(", ")})`
    );
  }
  if (plan.bids.length > 0)
    out.push(
      `Bidding on ${plan.bids.length} market opportunit${plan.bids.length === 1 ? "y" : "ies"}`
    );
  for (const m of plan.strategic.mna) {
    out.push(`${m.kind === "opportunistic" ? "Circling distressed" : "Targeting"} ${m.targetId}`);
  }
  if (plan.strategic.awardsPush.length > 0) out.push("Running an awards campaign");
  for (const t of plan.talent) {
    out.push(t.approach === "poach" ? "Attempting a talent poach" : "Placing a first-look hold");
  }
  for (const s of plan.series) {
    out.push(`${s.decision === "renew" ? "Renewing" : "Cancelling"} a series (${s.reason})`);
  }
  if (out.length === 0) out.push("Holding position");
  return out;
}
