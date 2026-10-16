import { GameState, Talent, ProducerShingle } from "../../types";
import { RandomGenerator } from "../../utils/rng";

/**
 * ShingleMind — producer-shingle partner behavior.
 *
 * Gives each shingle a persistent trait vector (Design Bible §29.23:
 * taste coherence, opportunism, loyalty, spending discipline, prestige
 * instinct) and applies it to the two decisions ShingleSystem already makes:
 * how often the shingle pitches, and whether a studio accepts the pitch.
 * Traits are seeded deterministically the first time a shingle is evaluated
 * and persisted via SHINGLE_UPDATED by the caller.
 */

export interface ShingleTraits {
  tasteCoherence: number; // 0-100: focused slate vs scattershot
  opportunism: number; // 0-100: trend-chasing, studio-hopping
  loyalty: number; // 0-100: stays at a good home
  spendingDiscipline: number; // 0-100: keeps overhead sane
  prestigeInstinct: number; // 0-100: art-house vs commerce
}

/** Deterministically derive traits for a shingle that doesn't have them yet. */
export function deriveShingleTraits(
  shingle: ProducerShingle,
  owner: Talent | undefined,
  rng: RandomGenerator
): ShingleTraits {
  const prestige = owner?.prestige ?? 50;
  return {
    tasteCoherence: rng.rangeInt(20, 95),
    opportunism: rng.rangeInt(10, 90),
    loyalty: Math.min(95, rng.rangeInt(20, 80) + Math.floor((prestige - 50) / 4)),
    spendingDiscipline: rng.rangeInt(25, 95),
    prestigeInstinct: Math.min(95, rng.rangeInt(10, 90) + Math.floor((prestige - 60) / 3)),
  };
}

/** Ensure a shingle has traits; returns [shingle, seeded?]. */
export function ensureTraits(
  shingle: ProducerShingle,
  owner: Talent | undefined,
  rng: RandomGenerator
): { traits: ShingleTraits; seeded: boolean } {
  if (shingle.traits) return { traits: shingle.traits, seeded: false };
  return { traits: deriveShingleTraits(shingle, owner, rng), seeded: true };
}

/**
 * Pitch-rate adjustment: opportunistic shingles pitch constantly; coherent,
 * disciplined ones pitch fewer, better packages.
 */
export function pitchRateMultiplier(traits: ShingleTraits): number {
  return 0.6 + traits.opportunism / 100 - traits.spendingDiscipline / 400;
}

/**
 * Studio-acceptance adjustment to the router's heuristic accept probability.
 * High taste-coherence shingles get a benefit of the doubt; scattershot ones
 * get extra scrutiny. Prestige-instinct shingles play better at prestige
 * studios (strength proxy: prestige owner → prestige studio).
 */
export function acceptProbabilityDelta(
  traits: ShingleTraits,
  state: GameState,
  studioId: string
): number {
  let delta = (traits.tasteCoherence - 50) / 500; // ±0.1
  const studio = state.entities.rivals[studioId];
  const prestigeStudio =
    studioId === state.studio.id ? (state.studio.prestige ?? 50) > 60 : (studio?.prestige ?? 50) > 60;
  delta += ((traits.prestigeInstinct - 50) / 500) * (prestigeStudio ? 1 : -1);
  return delta;
}

/**
 * Pass-through behavior: disloyal/opportunistic shingles shop their pitch
 * more aggressively after a pass (they land on the open market more often);
 * loyal ones are more likely to stay home and absorb the pass.
 */
export function openMarketAffinity(traits: ShingleTraits): number {
  return 0.7 + traits.opportunism / 200 - traits.loyalty / 400;
}
