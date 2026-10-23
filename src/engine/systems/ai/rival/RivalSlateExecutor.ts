import {
  GameState,
  StateImpact,
  Project,
  SeriesProject,
  RivalStudio,
  Buyer,
  MarketingCampaign,
  MarketingAngle,
} from "@/engine/types";
import { RandomGenerator } from "../../../utils/rng";
import { calculateOpeningWeekend } from "../../releaseSimulation";
import { evaluateGreenlight } from "../../greenlight";
import { calculateFitScore } from "../../buyers";
import { StreamingViewershipTracker } from "../../production/StreamingViewershipTracker";
import { getBudgetInflation } from "../../industry/MacroCycle";
import { getStudioArchetype } from "../../../data/aiArchetypes";
import { BUDGET_TIERS } from "../../../data/budgetTiers";
import { isPlayerOwner, getPlayerId } from "../../../utils/ownership";
import { generateProjectTitle } from "../../../generators/titles";
import { HeadlessController } from "../../../simulation/HeadlessController";
import { RivalPlan } from "./plan.types";

/**
 * RivalSlateExecutor — the single rival project lifecycle for BOTH live ticks
 * and headless simulations (replaces tickRivalProduction + StudioAutomation's
 * project path; there is no second pipeline).
 *
 * Plan-driven: slate size/genres/tiers come from the rival's RivalPlan, which
 * also feeds marketing spend, release timing, and buyer preference. Pure
 * impact emission — all mutation flows through applyImpacts.
 *
 * Lifecycle: pitching → (buyer pickup | self-finance) → production →
 * post_production → marketing → released → archived. TV series move ON_AIR and
 * are then driven by tickTelevision (+ plan.series intents).
 */

const PITCH_TIMEOUT_WEEKS = 10;
const POST_PRODUCTION_WEEKS = 4;
const MARKETING_WEEKS = 3;
const RELEASE_RETENTION_WEEKS = 6;
const GREENLIGHT_SCORE_FLOOR = 35;

export function tickRivalSlate(
  state: GameState,
  rng: RandomGenerator,
  plans: Record<string, RivalPlan> = {}
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const rivals = state.entities.rivals || {};

  // 1. Studio-level moves — stable rival-id iteration.
  for (const rid in rivals) {
    const rival = rivals[rid];
    if (!rival) continue;
    const plan = plans[rid];
    const isDistressed = (Number(rival.cash) || 0) < -50_000_000;

    if (isDistressed && state.week % 4 === 0 && rng.next() < 0.1) {
      triggerLiquidation(rival, state, rng, impacts);
    } else if (
      rival.cash > 500_000_000 &&
      (!rival.ownedPlatforms || rival.ownedPlatforms.length === 0)
    ) {
      const archetype = getStudioArchetype(rival.archetypeId || rival.behaviorId || "");
      if (rng.next() < 0.05 * archetype.ma_willingness) {
        triggerPlatformLaunch(rival, rng, impacts, state.week);
      }
    }

    if (isDistressed !== !!rival.isAcquirable) {
      impacts.push({
        type: "RIVAL_UPDATED",
        payload: { rivalId: rival.id, update: { isAcquirable: isDistressed } },
      });
    }

    // 2. Spawn slate from the plan (0 when no plan / no intent).
    const slateCount = plan?.slate.count ?? 0;
    for (let i = 0; i < slateCount; i++) {
      impacts.push(spawnRivalProject(rival, plan!, i, state, rng));
    }
  }

  // 3. Advance every rival-owned project through the lifecycle.
  const allProjects = state.entities.projects || {};
  const allProjectsList: Project[] = [];
  for (const pid in allProjects) allProjectsList.push(allProjects[pid]);

  for (const pid in allProjects) {
    const p = allProjects[pid];
    const ownerId = p.ownerId;
    if (!ownerId || isPlayerOwner(state, ownerId)) continue;
    const rival = rivals[ownerId];
    if (!rival) continue;
    const plan = plans[ownerId];

    switch (p.state) {
      case "pitching":
        processPitching(p, rival, state, rng, impacts);
        break;
      case "needs_greenlight":
      case "development":
        processGreenlight(p, rival, state, rng, impacts, allProjectsList);
        break;
      case "production":
        if ((p.weeksInPhase ?? 0) + 1 >= (p.productionWeeks || 8)) {
          impacts.push(update(p.id, { state: "post_production", weeksInPhase: 0 }));
        } else {
          impacts.push(update(p.id, { weeksInPhase: (p.weeksInPhase ?? 0) + 1 }));
        }
        break;
      case "post_production":
        if ((p.weeksInPhase ?? 0) + 1 >= POST_PRODUCTION_WEEKS) {
          impacts.push(update(p.id, enterMarketing(p, plan)));
        } else {
          impacts.push(update(p.id, { weeksInPhase: (p.weeksInPhase ?? 0) + 1 }));
        }
        break;
      case "marketing": {
        const targetWeek =
          plan?.releaseIntent?.projectId === p.id ? plan.releaseIntent.targetWeek : null;
        const ready =
          (p.weeksInPhase ?? 0) + 1 >= MARKETING_WEEKS &&
          (targetWeek === null || state.week >= targetWeek);
        // Deferential rivals sit on a project until their target window.
        if (ready) {
          releaseProject(p, rival, state, rng, impacts);
        } else {
          impacts.push(update(p.id, { weeksInPhase: (p.weeksInPhase ?? 0) + 1 }));
        }
        break;
      }
      case "released":
        // Give theatrical runs time to earn weekly legs, then archive films.
        if (
          p.format !== "tv" &&
          p.releaseWeek &&
          state.week - p.releaseWeek > RELEASE_RETENTION_WEEKS
        ) {
          impacts.push(update(p.id, { state: "archived" }));
        }
        break;
      case "turnaround":
      case "shopping":
        // Dead development — reclaim the slot after a quarter.
        if ((p.weeksInPhase ?? 0) + 1 >= 12) {
          impacts.push(update(p.id, { state: "archived" }));
        } else {
          impacts.push(update(p.id, { weeksInPhase: (p.weeksInPhase ?? 0) + 1 }));
        }
        break;
      default:
        break;
    }
  }

  return impacts;
}

function update(projectId: string, upd: Partial<Project>): StateImpact {
  return { type: "PROJECT_UPDATED", payload: { projectId, update: upd } };
}

// ---------------------------------------------------------------------------
// Slate spawn — plan-driven
// ---------------------------------------------------------------------------

function spawnRivalProject(
  rival: RivalStudio,
  plan: RivalPlan,
  index: number,
  state: GameState,
  rng: RandomGenerator
): StateImpact {
  const tier = plan.slate.budgetTiers[index] || "mid";
  const genrePool = plan.slate.preferredGenres;
  const genre = genrePool.length > 0 ? genrePool[index % genrePool.length] : "Drama";
  const isTv = plan.slate.preferTv;
  const data = BUDGET_TIERS[tier];
  const inflation = getBudgetInflation(state.week);
  const id = rng.uuid("PRJ");

  const base = {
    id,
    title: generateProjectTitle(genre, rng),
    genre,
    format: (isTv ? "tv" : "film") as "tv" | "film",
    state: "pitching" as const,
    weeksInPhase: 0,
    budgetTier: tier,
    budget: Math.floor(data.budget * inflation),
    weeklyCost: data.weeklyCost,
    targetAudience: "Broad",
    flavor: `${rival.name} production`,
    developmentWeeks: data.developmentWeeks,
    productionWeeks: Math.max(6, data.productionWeeks),
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: null,
    activeCrisis: null,
    momentum: 50,
    buzz: rng.rangeInt(20, 60),
    ownerId: rival.id,
    reviewScore: 50,
    scriptHeat: rng.rangeInt(30, 80),
    activeRoles: [] as import("@/engine/types").CharacterArchetype[],
    scriptEvents: [] as import("@/engine/types").ScriptEvent[],
    progress: 0,
    accumulatedCost: 0,
  };

  const project: Project = isTv
    ? ({
        ...base,
        type: "SERIES",
        tvDetails: {
          status: "IN_DEVELOPMENT",
          episodesOrdered: rng.rangeInt(8, 13),
          episodesAired: 0,
          averageRating: 0,
          currentSeason: 1,
          episodesCompleted: 0,
        },
      } as SeriesProject)
    : ({ ...base, type: "FILM" } as Project);

  return { type: "PROJECT_CREATED", payload: { project } };
}

// ---------------------------------------------------------------------------
// Pitching — mandate-aware buyer pickup (BuyerBrain fit) or self-finance
// ---------------------------------------------------------------------------

function processPitching(
  p: Project,
  rival: RivalStudio,
  state: GameState,
  rng: RandomGenerator,
  impacts: StateImpact[]
): void {
  const weeks = (p.weeksInPhase ?? 0) + 1;
  const isTv = p.format === "tv" || p.type === "SERIES";
  const buyers = state.market.buyers || [];
  const eligible: Buyer[] = buyers.filter((b) =>
    isTv
      ? b.archetype === "streamer" || b.archetype === "network" || b.archetype === "premium"
      : b.archetype === "streamer" || b.archetype === "network"
  );

  // Vertical integration: a rival-owned platform takes its studio's series first.
  let buyer: Buyer | undefined;
  if (isTv && rival.ownedPlatforms && rival.ownedPlatforms.length > 0) {
    buyer = eligible.find((b) => rival.ownedPlatforms!.includes(b.id)) || undefined;
  }
  if (!buyer) {
    // Rank by mandate-aware fit; the best buyer takes it when fit clears the bar.
    let bestFit = -1;
    for (const b of eligible) {
      const fit = calculateFitScore(p, b, state.week);
      if (fit > bestFit) {
        bestFit = fit;
        buyer = b;
      }
    }
    const threshold = isTv ? 40 : 45;
    if (!buyer || bestFit < threshold) buyer = undefined;
  }

  const timedOut = weeks >= PITCH_TIMEOUT_WEEKS;
  if (buyer) {
    const distributionStatus = buyer.archetype === "streamer" ? "streaming" : "theatrical";
    impacts.push(
      update(p.id, {
        buyerId: buyer.id,
        distributionStatus,
        state: "needs_greenlight",
        weeksInPhase: 0,
      })
    );
    if (rng.next() < 0.3) {
      impacts.push({
        type: "NEWS_ADDED",
        payload: {
          id: rng.uuid("NWS"),
          week: state.week,
          category: "market",
          headline: `${buyer.name} picks up ${rival.name}'s "${p.title}"`,
          description: `${buyer.name} has acquired ${isTv ? "broadcast rights" : "distribution"} for "${p.title}" from ${rival.name}.`,
          type: "STUDIO_EVENT",
          rivalId: rival.id,
          buyerId: buyer.id,
        },
      } as StateImpact);
    }
    return;
  }

  if (timedOut) {
    // Nobody bought it — self-finance and take it to market directly.
    impacts.push(
      update(p.id, {
        state: "needs_greenlight",
        weeksInPhase: 0,
        distributionStatus: p.distributionStatus || "theatrical",
      })
    );
    return;
  }

  impacts.push(update(p.id, { weeksInPhase: weeks }));
}

// ---------------------------------------------------------------------------
// Greenlight — real evaluation, not a coin flip
// ---------------------------------------------------------------------------

function processGreenlight(
  p: Project,
  rival: RivalStudio,
  state: GameState,
  rng: RandomGenerator,
  impacts: StateImpact[],
  allProjects: Project[]
): void {
  const weeks = (p.weeksInPhase ?? 0) + 1;

  // Legacy "development" projects (pre-unification spawns) mature into pitching.
  if (p.state === "development") {
    if (weeks >= (p.developmentWeeks || 6)) {
      impacts.push(update(p.id, { state: "pitching", weeksInPhase: 0 }));
    } else {
      impacts.push(update(p.id, { weeksInPhase: weeks }));
    }
    return;
  }

  const report = evaluateGreenlight(
    p,
    rival.cash,
    [],
    state.week,
    allProjects,
    state.entities.contracts || {},
    state.entities.talents || {}
  );

  const flush = rival.cash > (p.budget || 0) * 4;
  if (report.score >= GREENLIGHT_SCORE_FLOOR || (flush && report.score >= 25)) {
    impacts.push(update(p.id, { state: "production", weeksInPhase: 0, budget: p.budget }));
    if (p.budget) {
      impacts.push({
        type: "FINANCE_TRANSACTION",
        payload: {
          amount: -p.budget,
          description: `Greenlit: ${p.title}`,
          targetId: rival.id,
        },
      });
    }
    return;
  }

  // Genuinely bad packages die instead of burning slots forever.
  if (report.score < 25 && weeks >= 4) {
    impacts.push(update(p.id, { state: "turnaround", weeksInPhase: 0 }));
    impacts.push({
      type: "NEWS_ADDED",
      payload: {
        id: rng.uuid("NWS"),
        week: state.week,
        category: "market",
        headline: `${rival.name} shelves "${p.title}"`,
        description: `The project entered turnaround — insiders cite a weak package and soft market fit.`,
        type: "STUDIO_EVENT",
        rivalId: rival.id,
      },
    } as StateImpact);
    return;
  }

  impacts.push(update(p.id, { weeksInPhase: weeks }));
}

// ---------------------------------------------------------------------------
// Marketing entry — attach the campaign the plan paid for
// ---------------------------------------------------------------------------

const GENRE_ANGLES: Record<string, MarketingAngle> = {
  Action: "SELL_THE_SPECTACLE",
  "Sci-Fi": "SELL_THE_WORLD_MYTHOLOGY",
  Superhero: "BROAD_FOUR_QUADRANT_MARKETING",
  Horror: "SELL_THE_SCARES",
  Comedy: "BROAD_FOUR_QUADRANT_MARKETING",
  Romance: "SELL_THE_ROMANCE",
  Drama: "AWARDS_PUSH",
  Family: "FAMILY_ADVENTURE",
  Documentary: "SELL_THE_TRUE_STORY_HOOK",
  Musical: "SELL_THE_MUSIC",
};

function enterMarketing(p: Project, plan: RivalPlan | undefined): Partial<Project> {
  const planned = plan?.marketing?.[p.id];
  const defaultSpend = Math.floor((p.budget || BUDGET_TIERS[p.budgetTier || "mid"].budget) * 0.15);
  const spend = planned ?? defaultSpend;
  const campaign: MarketingCampaign = {
    domesticBudget: Math.floor(spend * 0.6),
    foreignBudget: Math.floor(spend * 0.4),
    primaryAngle: GENRE_ANGLES[p.genre || ""] || "SELL_THE_STORY",
    weeksInMarketing: 0,
  };
  return { state: "marketing", weeksInPhase: 0, marketingCampaign: campaign };
}

// ---------------------------------------------------------------------------
// Release — real box office via calculateOpeningWeekend + owner context
// ---------------------------------------------------------------------------

function releaseProject(
  p: Project,
  rival: RivalStudio,
  state: GameState,
  rng: RandomGenerator,
  impacts: StateImpact[]
): void {
  const isTv = p.format === "tv" || p.type === "SERIES";

  if (isTv) {
    // TV premieres: revenue accrues through platform/renewal systems; the
    // project goes ON_AIR and tickTelevision takes over.
    impacts.push(
      update(p.id, {
        state: "released",
        weeksInPhase: 0,
        releaseWeek: state.week,
        activeCrisis: null,
        ...("tvDetails" in p && p.tvDetails
          ? { tvDetails: { ...p.tvDetails, status: "ON_AIR" } }
          : {}),
      })
    );
    return;
  }

  const { project: releasedProject } = calculateOpeningWeekend(
    p,
    [],
    rival.prestige || 50,
    1.0,
    0,
    state.week
  );

  let streamingUpdate = {};
  if (p.distributionStatus === "streaming" && p.buyerId) {
    const platform = state.market.buyers.find((b) => b.id === p.buyerId);
    if (platform) {
      const viewership = StreamingViewershipTracker.initializeViewership(
        p,
        platform.id,
        platform,
        state.week,
        rng
      );
      streamingUpdate = { streamingViewership: [viewership] };
    }
  }

  impacts.push(
    update(p.id, {
      ...releasedProject,
      ...streamingUpdate,
      state: "released",
      weeksInPhase: 0,
      releaseWeek: state.week,
      activeCrisis: null,
      distributionStatus: p.distributionStatus || "theatrical",
    })
  );

  const revenue = releasedProject.revenue || 0;
  if (revenue > 0) {
    impacts.push({
      type: "FINANCE_TRANSACTION",
      payload: {
        amount: revenue,
        description: `Opening weekend: ${p.title}`,
        targetId: rival.id,
      },
    });
  }

  const totalCost = (p.budget || 0) + (p.marketingCampaign?.domesticBudget || 0);
  const roi = totalCost > 0 ? revenue / totalCost : 0;
  const isHit = roi > 2.0;
  impacts.push(...HeadlessController.attributeTalent(state, p, revenue, rng, isHit, 0));

  if (isHit || revenue > 100_000_000) {
    impacts.push({
      type: "NEWS_ADDED",
      payload: {
        id: rng.uuid("NWS"),
        week: state.week,
        category: "market",
        headline: `${rival.name}'s "${p.title}" opens to $${Math.round(revenue / 1_000_000)}M`,
        description: `${rival.name} scores a box office hit — "${p.title}" is tracking for a profitable run.`,
        type: "STUDIO_EVENT",
        rivalId: rival.id,
        projectId: p.id,
      },
    } as StateImpact);
  }
}

// ---------------------------------------------------------------------------
// Studio-level moves (ported from StudioAutomation)
// ---------------------------------------------------------------------------

function triggerLiquidation(
  rival: RivalStudio,
  state: GameState,
  rng: RandomGenerator,
  impacts: StateImpact[]
): void {
  const vault = state.ip.vault || [];
  const rivalIPs = vault.filter((a) => a.ownerStudioId === rival.id);
  if (rivalIPs.length === 0) return;

  const asset = rng.pick(rivalIPs);
  const bidPrice = (asset.baseValue || 10_000_000) * (0.5 + rng.next() * 0.5);

  impacts.push({
    type: "NEWS_ADDED",
    payload: {
      id: rng.uuid("NWS"),
      headline: `LIQUIDATION: ${rival.name} auctions IP!`,
      description: `Facing financial pressure, ${rival.name} has sold ${asset.title} to the highest bidder for $${(bidPrice / 1_000_000).toFixed(1)}M.`,
      category: "business",
      week: state.week,
    },
  });
  impacts.push({
    type: "FINANCE_TRANSACTION",
    payload: {
      amount: bidPrice,
      description: `IP liquidation: ${asset.title}`,
      targetId: rival.id,
    },
  });
  impacts.push({
    type: "IP_UPDATED",
    payload: {
      assetId: asset.id,
      update: { rightsOwner: "STUDIO", ownerStudioId: getPlayerId(state) },
    },
  });
}

function triggerPlatformLaunch(
  rival: RivalStudio,
  rng: RandomGenerator,
  impacts: StateImpact[],
  week: number
): void {
  impacts.push({
    type: "NEWS_ADDED",
    payload: {
      id: rng.uuid("NWS"),
      headline: `BUSINESS: ${rival.name} launches streaming service!`,
      description: `Aiming for vertical integration, ${rival.name} has invested $200M in a new SVOD platform.`,
      category: "business",
      week,
    },
  });
  impacts.push({
    type: "FINANCE_TRANSACTION",
    payload: {
      amount: -200_000_000,
      description: "SVOD platform launch",
      targetId: rival.id,
    },
  });
}
