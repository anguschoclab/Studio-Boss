// @DEPRECATED - This file is unused and will be removed
// Prestige calculations are handled by TalentSystem.ts
// Star meter is calculated in talent generator (generators/talent/index.ts)
// No code in the codebase uses these functions

import { Talent, TalentTier } from '@/engine/types';

/**
 * @DEPRECATED - Use TalentSystem for prestige calculations
 */
export function calculateTalentTier(prestige: number): TalentTier {
  if (prestige >= 90) return 1;
  if (prestige >= 70) return 2;
  if (prestige >= 50) return 3;
  return 4;
}

/**
 * @DEPRECATED - Star meter is calculated in generators/talent/index.ts
 */
export function calculateStarMeter(talent: Talent, globalAveragePrestige: number): number {
  const momentum = talent.momentum || 50;
  const prestige = talent.prestige;
  
  const rawMeter = (prestige * 0.6) + (momentum * 0.4);
  const ratio = prestige / globalAveragePrestige;
  const adjustedMeter = rawMeter * (0.8 + (ratio * 0.2));
  
  return Math.min(100, Math.max(1, Math.floor(adjustedMeter)));
}

/**
 * @DEPRECATED - Use TalentSystem for prestige calculations
 */
export function calculatePrestigeShift(
  current: number,
  success: boolean,
  volatility: number = 50
): number {
  const baseShift = success ? 2 : -3;
  const volMult = 1 + (volatility / 100);
  
  return Math.floor(baseShift * volMult);
}
