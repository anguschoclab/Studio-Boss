import { Franchise } from '../../types';
import { clamp } from '../../utils';
import { FRANCHISE_FATIGUE_RISK } from '../../data/genres';

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
  genre: string = 'Action'
): number {
  const activeCount = franchise.activeProjectIds.length;
  
  // Normalize genre string to match FRANCHISE_FATIGUE_RISK keys (e.g. "Action", "Sci-Fi", "Superhero")
  // Handle ALL CAPS or all lowercase variations
  const normalizedGenre = Object.keys(FRANCHISE_FATIGUE_RISK).find(
    k => k.toLowerCase() === genre.toLowerCase()
  ) || genre;

  // 1. Base Fatigue Rate (Genre-specific)
  const baseRate = FRANCHISE_FATIGUE_RISK[normalizedGenre] !== undefined ? FRANCHISE_FATIGUE_RISK[normalizedGenre] : 0.15;
  let currentFatigue = activeCount * baseRate;

  // 2. Exponential Dilution (Spin-off of a spin-off)
  // If a franchise has 2 or more active entries, it becomes a "Factory" in the public eye.
  // In real terms: 2.5x fatigue acceleration once a universe is heavily mined.
  if (activeCount >= 2) {
    currentFatigue *= 2.5; 
  }

  // Content Mine Penalty
  // If a franchise has 3 or more active entries, audience considers it 'Homework'.
  if (activeCount >= 3) {
    currentFatigue *= 3.0;
  }

  // Superhero & Multiverse specific exponential burnout
  // 🌌 The Universe Builder: Modern cinematic universes face severe fatigue once they cross 3 active projects.
  if (activeCount >= 3 && (normalizedGenre === 'Superhero' || normalizedGenre === 'Multiverse')) {
    currentFatigue *= 2.5;
  }

  // Space Opera / Sci-Fi massive fatigue after 4 active projects
  // 🌌 The Universe Builder: High-concept universes collapse under their own weight.
  if (activeCount >= 4 && (normalizedGenre === 'Space Opera' || normalizedGenre === 'Sci-Fi')) {
    currentFatigue *= 2.0;
  }

  // 🌌 The Universe Builder: Specific superhero fatigue logic
  if (normalizedGenre === 'Superhero' && activeCount >= 2) {
    currentFatigue *= 1.5;
  }

  // 🌌 The Universe Builder: Cinematic Universe Collapse.
  if (activeCount >= 5) {
    currentFatigue *= 4.0;
  }

  // 🌌 The Universe Builder: Terminal Superhero Fatigue.
  if (activeCount >= 3 && genreSaturation > 15 && (normalizedGenre === 'Superhero' || normalizedGenre === 'Multiverse')) {
    currentFatigue *= 3.5;
  }

  // 3. Rival Saturation (The 'Poison the Well' effect)
  // If genre is severely oversaturated, penalty multiplier increases heavily.
  // 🌌 The Universe Builder: The market rejects trend-chasing much faster now.
  const oversaturationMultiplier = genreSaturation > 10 ? 3.0 : genreSaturation > 6 ? 1.5 : 1.0;
  const rivalPenalty = (genreSaturation / 10) * 0.15 * oversaturationMultiplier;

  // 🌌 The Universe Builder: Trend Chaser Penalty. Aggressively penalizes low-loyalty franchises jumping on over-saturated bandwagons.
  if (genreSaturation > 12 && franchise.audienceLoyalty < 40) {
    currentFatigue *= 2.0;
  }
  
  // 4. Audience Loyalty (Protective Shield)
  // High loyalty acts as a buffer against fatigue.
  const loyaltyShield = Math.min(0.4, (franchise.audienceLoyalty / 100) * 0.3); // Up to 30% reduction in fatigue gain, capped at 40%

  // 🌌 The Universe Builder: Extreme oversaturation penalty if the franchise has >= 4 active projects and the genre is highly saturated
  if (activeCount >= 4 && genreSaturation > 15) {
    currentFatigue *= 3.0;
  }

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
  
  // 0. The Generational Revival (15+ years / 780+ weeks)
  // 🌌 The Universe Builder: When IP has been dormant for a full generation, it returns as a monumental cultural event.
  if (yearsSince >= 15) {
    return {
      buzzBonus: 75,
      label: 'Generational Revival (Cultural Event)',
      fatigueReset: true
    };
  }

  // 1. The Nostalgia Spike (10+ years / 520+ weeks)
  // Real-life: Top Gun Maverick, The Force Awakens.
  if (yearsSince >= 10) {
    return { 
      buzzBonus: 50, // 🌌 The Universe Builder: Nostalgia hype is stronger than ever.
      label: 'Legacy Sequel (Nostalgia)',
      fatigueReset: true // A legacy reset removes current fatigue as the brand is "re-introduced"
    };
  }

  // Brand Reboot (Fresh Start)
  if (yearsSince >= 7 && yearsSince < 10) {
    return {
      buzzBonus: 25, // 🌌 The Universe Builder: Reboots still carry significant fresh-start buzz.
      label: 'Brand Reboot (Fresh Start)',
      fatigueReset: true
    };
  }

  // 🌌 The Universe Builder: IP Squatting / Rights Retention.
  if (yearsSince >= 6 && yearsSince < 7) {
    return {
      buzzBonus: -40,
      label: 'Rights Retention Ploy (Cynical Cash Grab)',
      fatigueReset: false
    };
  }

  // Soft Reboot (IP Retention)
  // 🌌 The Universe Builder: Soft reboots after a 5-year break can re-ignite IP.
  if (yearsSince >= 5 && yearsSince < 7) {
    return {
      buzzBonus: 15,
      label: 'Soft Reboot (IP Retention)',
      fatigueReset: true
    };
  }

  // 2. The Dead Zone (4-5 years / 208-260 weeks)
  // Real-life: Alice Through the Looking Glass, The LEGO Movie 2.
  if (yearsSince >= 4 && yearsSince < 5) {
    return { 
      buzzBonus: -25, // 🌌 The Universe Builder: Apathy hits harder during the dead zone.
      label: 'The Dead Zone (Apathy)',
      fatigueReset: false
    };
  }
  
  // Anticipated Sequel
  if (yearsSince >= 1.5 && yearsSince <= 3) {
    return {
      buzzBonus: 10,
      label: 'Anticipated Sequel',
      fatigueReset: false
    };
  }

  // Cannibalized Release (0-6 months)
  // 🌌 The Universe Builder: Releasing projects too close together in the same franchise destroys value.
  if (yearsSince > 0 && yearsSince < 0.5) {
    return {
      buzzBonus: -50,
      label: 'Cannibalized Release (Immediate Oversaturation)',
      fatigueReset: false
    };
  }

  // Too Soon Penalty
  // 🌌 The Universe Builder: Rapid-fire sequels without breathing room kill anticipation.
  if (yearsSince >= 0.5 && yearsSince < 1) {
    return {
      buzzBonus: -30,
      label: 'IP Factory (Extreme Decay)',
      fatigueReset: false
    };
  }

  if (yearsSince >= 1 && yearsSince < 1.5) {
    return {
      buzzBonus: -10,
      label: 'Rushed Sequel (Market Oversaturation)',
      fatigueReset: false
    };
  }

  return { buzzBonus: 0, label: '', fatigueReset: false };
}
