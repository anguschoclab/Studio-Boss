import { Franchise } from '../../types';
import { clamp } from '../../utils';

/**
 * Fatigue Logic Engine.
 * Calculates how "tired" the audience is of a specific Shared Universe.
 */

/**
 * Calculates current Brand Fatigue for a franchise.
 * Incorporates:
 * 1. Active project count.
 * 2. Nested Spinoff Dilution (2.5x penalty).
 * 3. Rival Saturation (The 'Poison the Well' effect).
 * 4. Genre Sensitivity (Spectacle vs Comfort Food).
 */
export function calculateFranchiseFatigue(
  franchise: Franchise, 
  genreSaturation: number, // Market-wide saturation for the genre (count of active rival projects)
  genreType: 'spectacle' | 'comfort_food' = 'spectacle'
): number {
  const activeCount = franchise.activeProjectIds.length;
  
  // 1. Base Fatigue Rate (Genre-specific)
  // 'Spectacle' (Superhero, Sci-Fi) builds fatigue at 0.15 per project.
  // 'Comfort Food' (Procedural, Sitcom) builds at 0.05 per project.
  const baseRate = (genreType === 'spectacle') ? 0.15 : 0.05;
  let currentFatigue = activeCount * baseRate;

  // 2. Exponential Dilution (Spin-off of a spin-off)
  // If a franchise has 2 or more active entries, it becomes a "Factory" in the public eye.
  // In real terms: 2.5x fatigue acceleration once a universe is heavily mined.
  if (activeCount >= 2) {
    currentFatigue *= 2.5; 
  }

  // 3. Rival Saturation (The 'Poison the Well' effect)
  // If rivals flood the market with the same genre (e.g., Every studio has a superhero film), 
  // it adds a "Genre Fatigue" floor that impacts your brand too.
  const rivalPenalty = (genreSaturation / 12) * 0.1; // 10% penalty floor for every 12 active rival projects in genre
  
  // 4. Audience Loyalty (Protective Shield)
  // High loyalty acts as a buffer against fatigue.
  const loyaltyShield = (franchise.audienceLoyalty / 100) * 0.3; // Up to 30% reduction in fatigue gain

  return clamp(currentFatigue + rivalPenalty - loyaltyShield, 0, 1.0);
}

/**
 * Calculates the "Hype Impact" based on real-life timing curves.
 * 1. The Dead Zone (4-7 years): Neither fresh nor classic.
 * 2. The Nostalgia Spike (10+ years): Transformation into a 'Legacy Brand'.
 */
export function calculateReleaseGapImpact(
  lastReleaseWeeks: number[], 
  currentWeek: number
): { buzzBonus: number; label: string; fatigueReset: boolean } {
  if (lastReleaseWeeks.length === 0) return { buzzBonus: 0, label: '', fatigueReset: false };
  
  const mostRecent = Math.max(...lastReleaseWeeks);
  const weeksSince = currentWeek - mostRecent;
  const yearsSince = weeksSince / 52;
  
  // 1. The Nostalgia Spike (10+ years / 520+ weeks)
  // Real-life: Top Gun Maverick, The Force Awakens.
  if (yearsSince >= 10) {
    return { 
      buzzBonus: 40, 
      label: 'Legacy Sequel (Nostalgia)',
      fatigueReset: true // A legacy reset removes current fatigue as the brand is "re-introduced"
    };
  }

  // 2. The Dead Zone (4-7 years / 208-364 weeks)
  // Real-life: Alice Through the Looking Glass, The LEGO Movie 2.
  if (yearsSince >= 4 && yearsSince <= 7) {
    return { 
      buzzBonus: -15, 
      label: 'The Dead Zone (Apathy)',
      fatigueReset: false
    };
  }
  
  return { buzzBonus: 0, label: '', fatigueReset: false };
}
