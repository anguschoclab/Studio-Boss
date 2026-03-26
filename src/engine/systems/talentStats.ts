import { Award, TalentProfile } from '@/engine/types';

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
      prestigeBoost += 30 * finalMultiplier;
      egoBoost += 40 * finalMultiplier; // Massive permanent ego bump for prestigious awards
      drawBoost += 15 * finalMultiplier;
      feeMultiplier += 2.0 * finalMultiplier; // 200% fee bump to make chasing trophies a massive distinct strategy
    } else if (isSundanceEquivalent) {
      prestigeBoost += 15 * finalMultiplier;
      egoBoost += 25 * finalMultiplier;
      drawBoost += 30 * finalMultiplier; // Massive commercial draw bump for indie hits
      feeMultiplier += 1.5 * finalMultiplier; // 150% fee bump
    } else {
      prestigeBoost += 10 * finalMultiplier;
      egoBoost += 10 * finalMultiplier;
      drawBoost += 8 * finalMultiplier;
      feeMultiplier += 0.5 * finalMultiplier; // 50% fee bump for standard wins
    }
  } else {
    // nominated
    if (isPrestige || isCannesEquivalent) {
      prestigeBoost += 10 * finalMultiplier;
      egoBoost += 15 * finalMultiplier;
      drawBoost += 5 * finalMultiplier;
      feeMultiplier += 0.5 * finalMultiplier; // 50% fee bump for prestigious nominations
    } else if (isSundanceEquivalent) {
      prestigeBoost += 8 * finalMultiplier;
      egoBoost += 10 * finalMultiplier;
      drawBoost += 12 * finalMultiplier;
      feeMultiplier += 0.3 * finalMultiplier; // 30% fee bump for indie nominations
    } else {
      prestigeBoost += 4 * finalMultiplier;
      egoBoost += 5 * finalMultiplier;
      drawBoost += 2 * finalMultiplier;
      feeMultiplier += 0.1 * finalMultiplier;
    }
  }

  return {
    feeMultiplier,
    egoBoost,
    prestigeBoost,
    drawBoost
  };
}
