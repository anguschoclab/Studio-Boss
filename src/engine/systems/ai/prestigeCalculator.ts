import { Talent, TalentTier } from '@/engine/types';

/**
 * Pure function to determine a talent's industry tier based on absolute prestige
 * and relative standing.
 */
export function calculateTalentTier(prestige: number): TalentTier {
  if (prestige >= 90) return 1;
  if (prestige >= 70) return 2;
  if (prestige >= 50) return 3;
  return 4;
}

/**
 * Logic to calculate the "Star Meter" (0-100) based on recent momentum.
 * Star Meter = (Prestige * 0.7) + (RecentSuccess * 0.3)
 */
export function calculateStarMeter(talent: Talent, globalAveragePrestige: number): number {
  const momentum = talent.momentum || 50;
  const prestige = talent.prestige;
  
  // High prestige + high momentum = Star Meter peak
  const rawMeter = (prestige * 0.6) + (momentum * 0.4);
  
  // Normalize against global average to ensure it doesn't inflate too much
  const ratio = prestige / globalAveragePrestige;
  const adjustedMeter = rawMeter * (0.8 + (ratio * 0.2));
  
  return Math.min(100, Math.max(1, Math.floor(adjustedMeter)));
}

/**
 * Calculates the prestige shift for a failure or success.
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
