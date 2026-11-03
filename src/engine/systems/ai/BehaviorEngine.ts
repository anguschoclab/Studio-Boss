import { GameState, RivalStudio } from "@/engine/types";
import { getStudioArchetype } from "../../data/aiArchetypes";

/**
 * Attacker-only hostile-takeover eligibility: aggressive acquirer/poacher
 * archetype with a hostile motivation. Pair-dependent checks (offer size,
 * combined market share) stay in shouldAttemptHostileTakeover.
 */
export function isEligibleAcquirer(attacker: RivalStudio): boolean {
  const behaviorId = attacker.archetypeId || attacker.behaviorId || "major";
  const archetype = getStudioArchetype(behaviorId);
  if (!archetype) return false;

  if (archetype.biddingAggression < 70) return false;
  if (archetype.strategy !== "acquirer" && archetype.strategy !== "poacher") return false;

  return (
    attacker.currentMotivation === "FRANCHISE_BUILDING" ||
    attacker.currentMotivation === "MARKET_DISRUPTION"
  );
}

export function shouldAttemptHostileTakeover(
  attacker: RivalStudio,
  target: RivalStudio,
  _state: GameState
): boolean {
  if (attacker.id === target.id) return false;
  if (!isEligibleAcquirer(attacker)) return false;

  const minimumOfferSize = target.cash * 1.5 + target.prestige * 1_000_000;
  if (attacker.cash < minimumOfferSize) return false;

  const attackerShare = attacker.marketShare ?? 0;
  const targetShare = target.marketShare ?? 0;
  if (attackerShare + targetShare > 0.4) return false;

  return true;
}
