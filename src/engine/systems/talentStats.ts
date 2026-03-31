import { Award, TalentProfile } from '@/engine/types';
import { isCannesEquivalentFestival, isSundanceEquivalentFestival, isMajorCategoryNomination, isSupportingCategoryNomination } from './awards';

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

  const isCannesEquivalent = isCannesEquivalentFestival(award.body);
  const isSundanceEquivalent = isSundanceEquivalentFestival(award.body);
  const isMajorCategory = isMajorCategoryNomination(award.category);
  const isSupportingCategory = isSupportingCategoryNomination(award.category);

  // Specific multiplicative bonus for massive individual achievements
  const individualCategoryMultiplier = isMajorCategory ? 1.8 : isSupportingCategory ? 1.4 : 1.0;
  const finalMultiplier = multiplier * individualCategoryMultiplier;

  if (award.status === 'won') {
    if (isPrestige || isCannesEquivalent) {
      prestigeBoost += 35 * finalMultiplier;
      egoBoost += 90 * finalMultiplier; // Massive permanent ego bump for prestigious awards
      drawBoost += 15 * finalMultiplier;
      feeMultiplier += 6.0 * finalMultiplier; // 600% fee bump to make chasing trophies a massive distinct strategy
    } else if (isSundanceEquivalent) {
      prestigeBoost += 15 * finalMultiplier;
      egoBoost += 60 * finalMultiplier;
      drawBoost += 35 * finalMultiplier; // Massive commercial draw bump for indie hits
      feeMultiplier += 4.0 * finalMultiplier; // 400% fee bump
    } else {
      prestigeBoost += 10 * finalMultiplier;
      egoBoost += 20 * finalMultiplier;
      drawBoost += 8 * finalMultiplier;
      feeMultiplier += 1.0 * finalMultiplier; // 100% fee bump for standard wins
    }
  } else {
    // nominated
    if (isPrestige || isCannesEquivalent) {
      prestigeBoost += 10 * finalMultiplier;
      egoBoost += 40 * finalMultiplier;
      drawBoost += 5 * finalMultiplier;
      feeMultiplier += 2.0 * finalMultiplier; // 200% fee bump for prestigious nominations
    } else if (isSundanceEquivalent) {
      prestigeBoost += 8 * finalMultiplier;
      egoBoost += 25 * finalMultiplier;
      drawBoost += 12 * finalMultiplier;
      feeMultiplier += 1.5 * finalMultiplier; // 150% fee bump for indie nominations
    } else {
      prestigeBoost += 4 * finalMultiplier;
      egoBoost += 10 * finalMultiplier;
      drawBoost += 2 * finalMultiplier;
      feeMultiplier += 0.3 * finalMultiplier;
    }
  }

  return {
    feeMultiplier,
    egoBoost,
    prestigeBoost,
    drawBoost
  };
}
