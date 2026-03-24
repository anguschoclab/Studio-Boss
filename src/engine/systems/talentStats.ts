import { Award, TalentProfile } from '../types';

export interface AwardBoosts {
  feeMultiplier: number;
  egoBoost: number;
  prestigeBoost: number;
  drawBoost: number;
}

/**
 * Calculates the permanent stat boosts (ego, fee, prestige, draw) a talent receives
 * from being nominated or winning an award.
 */
export function applyAwardBoostsToTalent(
  talent: TalentProfile,
  award: Award,
  multiplier: number,
  isPrestige: boolean
): AwardBoosts {
  let prestigeBoost = 0;
  let drawBoost = 0;
  let feeMultiplier = 1.0;
  let egoBoost = 0;

  if (award.status === 'won') {
    prestigeBoost += (isPrestige ? 15 : 8) * multiplier;
    drawBoost += (isPrestige ? 10 : 5) * multiplier;
    feeMultiplier += (isPrestige ? 0.5 : 0.2) * multiplier;
    egoBoost += (isPrestige ? 10 : 5) * multiplier;
  } else {
    // nominated
    prestigeBoost += 2 * multiplier;
    drawBoost += 1 * multiplier;
    feeMultiplier += 0.05 * multiplier;
    egoBoost += 2 * multiplier;
  }

  return {
    feeMultiplier,
    egoBoost,
    prestigeBoost,
    drawBoost
  };
}
