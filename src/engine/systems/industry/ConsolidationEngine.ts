import { GameState, StateImpact, StreamerPlatform, RivalStudio } from "@/engine/types";
import { RegulatorSystem } from "./RegulatorSystem";
import { pick, secureRandom } from "../../utils";
import { isAcquirerBlockedByAntitrust } from "./Antitrust";
import { getSimMemory } from "../../core/simMemory";
import { impacts as I } from "../../core/impacts";
import { RivalPlan } from "../ai/rival/plan.types";

export interface ConsolidationEvent {
  week: number;
  year: number;
  motive: "strategic" | "distressed" | "platform";
  acquirerId: string;
  acquirerName: string;
  targetId: string;
  targetName: string;
  cost: number;
}

/**
 * Studio Boss - Consolidation Engine
 * Automates the mergers and acquisitions process for Rival Studios and Platforms.
 */
export function tickConsolidation(
  state: GameState,
  plans?: Record<string, RivalPlan>
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const rivalsDict = state.entities.rivals || {};
  const buyers = state.market.buyers;

  // Plan-declared M&A intents take priority over the random weekly roll —
  // an acquirer that decided to circle a target executes its own decision.
  if (plans) {
    for (const rid in plans) {
      const plan = plans[rid];
      const acquirer = rivalsDict[rid];
      if (!acquirer || plan.strategic.mna.length === 0) continue;
      if (isAcquirerBlockedByAntitrust(state, rid, state.week)) continue;
      const intent = plan.strategic.mna[0];
      const target = rivalsDict[intent.targetId];
      if (!target) continue;
      const cost = target.cash + target.strength * 2_000_000;
      if (cost <= 0 || cost > Math.max(intent.maxBid, acquirer.cash * 0.5)) continue;
      const reg = RegulatorSystem.isBlocked(state, acquirer.id, target.id);
      if (reg.blocked) {
        impacts.push({
          type: "NEWS_ADDED",
          payload: {
            headline: `REGULATOR BLOCK: ${acquirer.name}'s bid for ${target.name} rejected on ${reg.reason}`,
            description: `The proposed acquisition of ${target.name} by ${acquirer.name} has been blocked by federal regulators citing ${reg.reason}.`,
            category: "market",
            rivalId: target.id,
            buyerId: acquirer.id,
          },
        });
        continue;
      }
      emitStudioAcquisition(impacts, state, acquirer, target, cost, intent.kind);
      return impacts; // one M&A event per week
    }
  }

  // Replace Object.values().filter() chains with single for...in loop
  const majors: RivalStudio[] = [];
  for (const id in rivalsDict) {
    const r = rivalsDict[id];
    if (r.archetype === "major" && r.cash > 250_000_000) {
      majors.push(r);
    }
  }

  // REMOVED: Financial stress simulation (ineffective and unrealistic)
  // Rivals now deploy capital proactively via FlopMechanics and other systems

  // Reduced skip probability for headless simulation (20% vs 60%)
  if (majors.length === 0 || secureRandom() < 0.2) return [];

  // Prefer non-antitrust-frozen acquirers so a single dominant frozen player doesn't
  // starve the whole engine for years.
  const freeAcquirers = majors.filter(
    (r) => !isAcquirerBlockedByAntitrust(state, r.id, state.week)
  );
  const acquirer = pick(freeAcquirers.length > 0 ? freeAcquirers : majors);

  // Antitrust block: dominant players face M&A freeze.
  if (isAcquirerBlockedByAntitrust(state, acquirer.id, state.week)) {
    impacts.push({
      type: "NEWS_ADDED",
      payload: {
        headline: `ANTITRUST FREEZE: ${acquirer.name} blocked from pursuing acquisitions`,
        description: `Federal regulators have suspended M&A activity for ${acquirer.name} pending review of its market position.`,
        category: "market",
        rivalId: acquirer.id,
      },
    });
    return impacts;
  }

  // Strategic targets: healthy-but-stagnant mid-tiers in the $100M-$2B cash range
  // are real-world acquisition targets (Disney/Fox, Amazon/MGM). Distress cascade
  // handles <$0 cash cases separately. Skip targets the acquirer can't afford.
  const STRATEGIC_CEILING = 2_000_000_000;
  const targets: RivalStudio[] = [];
  for (const id in rivalsDict) {
    const r = rivalsDict[id];
    if (
      r.id !== acquirer.id &&
      r.cash > 0 &&
      r.cash < STRATEGIC_CEILING &&
      r.strength < 75 &&
      acquirer.cash > r.cash + r.strength * 2_000_000
    ) {
      targets.push(r);
    }
  }

  // Target: unowned Streaming Platform
  const platforms = buyers.filter(
    (b) => b.archetype === "streamer" && !b.ownerId && !b.acquiredBy
  ) as StreamerPlatform[];

  // Choose acquisition type
  const roll = secureRandom();
  if (roll < 0.5 && targets.length > 0) {
    const target = pick(targets);
    const cost = target.cash + target.strength * 2_000_000;

    const reg = RegulatorSystem.isBlocked(state, acquirer.id, target.id);
    if (reg.blocked) {
      impacts.push({
        type: "NEWS_ADDED",
        payload: {
          headline: `REGULATOR BLOCK: ${acquirer.name}'s bid for ${target.name} rejected on ${reg.reason}`,
          description: `The proposed acquisition of ${target.name} by ${acquirer.name} has been blocked by federal regulators citing ${reg.reason}.`,
          category: "market",
          rivalId: target.id,
          buyerId: acquirer.id,
        },
      });
      return impacts;
    }

    emitStudioAcquisition(
      impacts,
      state,
      acquirer,
      target,
      cost,
      target.cash < 100_000_000 ? "opportunistic" : "strategic"
    );
  } else if (platforms.length > 0) {
    // Platform Acquisition (Vertical Integration)
    const platform = pick(platforms);
    const cost = platform.subscribers * 5 + platform.contentLibraryQuality * 1_000_000;

    if (acquirer.cash < cost) return impacts;

    // Check Regulators
    const reg = RegulatorSystem.isBlocked(state, acquirer.id, platform.id);
    if (reg.blocked) {
      impacts.push({
        type: "NEWS_ADDED",
        payload: {
          headline: `FEDERAL CRACKDOWN: ${platform.name} sale to ${acquirer.name} blocked`,
          description: `Regulators have intervened in the vertical integration of ${platform.name} into the ${acquirer.name} portfolio, citing market dominance concerns.`,
          category: "market",
          rivalId: acquirer.id,
        },
      });
      return impacts;
    }

    // Execute Acquisition
    impacts.push({
      type: "BUYER_UPDATED",
      payload: {
        buyerId: platform.id,
        update: { ownerId: acquirer.id, parentBrand: acquirer.parentBrand },
      },
    });

    impacts.push(
      I.financeTransaction(-cost, `Platform acquisition: ${platform.name}`, acquirer.id)
    );
    impacts.push({
      type: "RIVAL_UPDATED",
      payload: {
        rivalId: acquirer.id,
        update: {
          ownedPlatforms: [...(acquirer.ownedPlatforms || []), platform.id],
        },
      },
    });

    impacts.push({
      type: "NEWS_ADDED",
      payload: {
        headline: `VERTICAL INTEGRATION: ${acquirer.name} buys ${platform.name}`,
        description: `In a strategic shift toward vertical integration, ${acquirer.name} has acquired the ${platform.name} streaming platform to secure direct audience access.`,
        category: "market",
        rivalId: acquirer.id,
      },
    });
    const newEvent: ConsolidationEvent = {
      week: state.week,
      year: Math.floor(state.week / 52) + 1975,
      motive: "platform",
      acquirerId: acquirer.id,
      acquirerName: acquirer.name,
      targetId: platform.id,
      targetName: platform.name,
      cost,
    };
    const existingLog = getSimMemory(state).eventLogs.consolidation;
    impacts.push(
      I.industryUpdate({ "simMemory.eventLogs.consolidation": [...existingLog, newEvent] })
    );
  }

  return impacts;
}

/**
 * Shared studio-acquisition impact block — used by both the random weekly
 * roll and plan-declared M&A intents. Emits the cash transfer, prestige bump,
 * mergedRivalId merge directive (handled by INDUSTRY_UPDATE), news, and the
 * consolidation event log.
 */
function emitStudioAcquisition(
  impacts: StateImpact[],
  state: GameState,
  acquirer: RivalStudio,
  target: RivalStudio,
  cost: number,
  kind: "strategic" | "opportunistic"
): void {
  impacts.push(I.financeTransaction(-cost, `Acquisition of ${target.name}`, acquirer.id));
  impacts.push({
    type: "RIVAL_UPDATED",
    payload: {
      rivalId: acquirer.id,
      update: {},
      deltas: { prestige: 10 },
    },
  });
  impacts.push({
    type: "INDUSTRY_UPDATE",
    payload: {
      update: {},
      mergedRivalId: target.id,
      acquirerId: acquirer.id,
    },
  });

  const motive: "strategic" | "distressed" =
    kind === "opportunistic" || target.cash < 100_000_000 ? "distressed" : "strategic";
  const motiveLabel = motive === "distressed" ? "DISTRESSED M&A" : "STRATEGIC M&A";
  impacts.push({
    type: "NEWS_ADDED",
    payload: {
      headline: `${motiveLabel}: ${acquirer.name} acquires ${target.name} for $${(cost / 1_000_000).toFixed(1)}M`,
      description: `In a major industry move, ${acquirer.name} today finalized the acquisition of ${target.name}, further consolidating the ${acquirer.archetype} tier.`,
      category: "market",
      rivalId: target.id,
      buyerId: acquirer.id,
    },
  });
  const newEvent: ConsolidationEvent = {
    week: state.week,
    year: Math.floor(state.week / 52) + 1975,
    motive,
    acquirerId: acquirer.id,
    acquirerName: acquirer.name,
    targetId: target.id,
    targetName: target.name,
    cost,
  };
  const existingLog = getSimMemory(state).eventLogs.consolidation;
  impacts.push(
    I.industryUpdate({ "simMemory.eventLogs.consolidation": [...existingLog, newEvent] })
  );
}
