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

  const isCannesEquivalent = ['Cannes Film Festival', 'Venice Film Festival', 'Berlin International Film Festival', 'Telluride Film Festival'].includes(award.body);
  const isSundanceEquivalent = ['Sundance Film Festival', 'Toronto International Film Festival', 'SXSW Film Festival', 'Tribeca Film Festival', 'Slamdance Film Festival'].includes(award.body);
  const isMajorCategory = ['Best Director', 'Best Actor', 'Best Actress', 'Palme d\'Or', 'Golden Lion', 'Golden Bear', 'Grand Jury Prize'].includes(award.category);

  // Specific multiplicative bonus for massive individual achievements
  const individualCategoryMultiplier = isMajorCategory ? 1.5 : 1.0;
  const finalMultiplier = multiplier * individualCategoryMultiplier;

  if (award.status === 'won') {
    if (isPrestige || isCannesEquivalent) {
      prestigeBoost += 20 * finalMultiplier;
      egoBoost += 25 * finalMultiplier; // Huge ego bump for winning prestigious awards
      drawBoost += 10 * finalMultiplier;
      feeMultiplier += 1.0 * finalMultiplier; // 100% fee bump
    } else if (isSundanceEquivalent) {
      prestigeBoost += 10 * finalMultiplier;
      egoBoost += 15 * finalMultiplier;
      drawBoost += 20 * finalMultiplier; // Big commercial draw bump for indie hits
      feeMultiplier += 0.8 * finalMultiplier; // 80% fee bump
    } else {
      prestigeBoost += 8 * finalMultiplier;
      egoBoost += 5 * finalMultiplier;
      drawBoost += 5 * finalMultiplier;
      feeMultiplier += 0.2 * finalMultiplier;
    }
  } else {
    // nominated
    if (isPrestige || isCannesEquivalent) {
      prestigeBoost += 5 * finalMultiplier;
      egoBoost += 10 * finalMultiplier;
      drawBoost += 3 * finalMultiplier;
      feeMultiplier += 0.2 * finalMultiplier;
    } else if (isSundanceEquivalent) {
      prestigeBoost += 3 * finalMultiplier;
      egoBoost += 5 * finalMultiplier;
      drawBoost += 8 * finalMultiplier;
      feeMultiplier += 0.15 * finalMultiplier;
    } else {
      prestigeBoost += 2 * finalMultiplier;
      egoBoost += 2 * finalMultiplier;
      drawBoost += 1 * finalMultiplier;
      feeMultiplier += 0.05 * finalMultiplier;
    }
  }

  return {
    feeMultiplier,
    egoBoost,
    prestigeBoost,
    drawBoost
  };
}
