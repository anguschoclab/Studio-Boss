import { Project, Franchise, IPAsset } from '../../types';
import { clamp } from '../../utils';
import { CROSSOVER_AFFINITY } from '../../data/genres';

// Pre-compute lowercased keys for O(1) lookups
const CROSSOVER_AFFINITY_LOWER_KEYS = Object.keys(CROSSOVER_AFFINITY).reduce((acc, key) => {
  acc[key.toLowerCase()] = key;
  return acc;
}, {} as Record<string, string>);

/**
 * Calculates total equity for a franchise including the "Shared Universe Premium".
 * Real-world: A 'brand' is worth more than the sum of its individual box office takes.
 */
export function calculateFranchiseEquity(
  franchise: Franchise,
  assets: IPAsset[],
  sourceProjects?: Record<string, Project>
): number {
  const baseEquity = assets.reduce((sum, a) => sum + (a.baseValue * a.decayRate), 0);
  
  // 1. Shared Universe Premium
  let crossoverBonus = assets.length >= 3 ? 1.20 : 1.05;
  let genres: string[] = [];

  // 1b. Genre Crossover Events Hook
  if (sourceProjects && assets.length > 1) {
    const uniqueGenres = new Set<string>();
    assets.forEach(a => {
      const p = sourceProjects[a.originalProjectId];
      if (p && p.genre) {
        // Normalize to Title Case to match CROSSOVER_AFFINITY keys
        const lowerGenre = p.genre!.toLowerCase();
        const normalizedGenre = CROSSOVER_AFFINITY_LOWER_KEYS[lowerGenre] || p.genre;
        uniqueGenres.add(normalizedGenre);
      }
    });

    genres = Array.from(uniqueGenres);
    let synergyHits = 0;
    for (let i = 0; i < genres.length; i++) {
      for (let j = i + 1; j < genres.length; j++) {
        const g1 = genres[i];
        const g2 = genres[j];
        if (CROSSOVER_AFFINITY[g1]?.includes(g2) || CROSSOVER_AFFINITY[g2]?.includes(g1)) {
          synergyHits++;
        }
      }
    }
    // Boost bonus significantly if diverse compatible genres cross over
    crossoverBonus += Math.min(0.5, synergyHits * 0.15);

    // Golden Age of Crossovers
    if (synergyHits >= 4) {
      crossoverBonus += 0.35;
    }

    // Superhero + Multiverse Cross-over event bonus
    if (genres.includes('Superhero') && genres.includes('Multiverse')) {
      crossoverBonus += 0.20;
    }

    // Avengers-style crossover event check
    if (assets.length >= 3 && genres.some(g => g === 'Multiverse' || g === 'IP Mashup')) {
      crossoverBonus += 0.45;
    }

    // 🌌 The Universe Builder: Added a 15% synergy bonus when combining two Level 3 franchises in a crossover event.
    if (assets.length >= 5) {
      crossoverBonus += 0.15;
    }

    // Synergy bonus for massive crossover events linking 4 or more distinct IPs via IP Mashup
    if (assets.length >= 4 && genres.some(g => g === 'IP Mashup' || g === 'Multiverse')) {
      crossoverBonus += 0.25;
    }

    // Legacy Character Return Massive Crossover
    if (assets.length >= 4 && genres.some(g => g === 'Legacy Sequel')) {
      crossoverBonus += 0.35;
    }

    // Penalty for chaotic crossovers (too many genres, not enough synergy)
    if (genres.length >= 4 && synergyHits < 2) {
      crossoverBonus -= 0.20;
    }

    // Desperate IP Mashup penalty
    if (genres.length >= 5 && franchise.audienceLoyalty < 50) {
      crossoverBonus = Math.max(0.1, crossoverBonus - 0.35);
    }
  }

  // Endgame/Culmination bonus for massive, highly relevant cinematic universes
  if (assets.length >= 8 && franchise.relevanceScore >= 85) {
    crossoverBonus += 0.50;
  }
  
  // Curated Universe Premium
  if (assets.length >= 5 && franchise.activeProjectIds.length <= 2) {
    crossoverBonus += 0.30;
  }

  // Transmedia Universe Event synergy bonus
  if (assets.length >= 6 && genres.some(g => g === 'Superhero' || g === 'Video Game Adaptation')) {
    crossoverBonus += 0.40;
  }

  // 🌌 The Universe Builder: Transmedia Empire Bonus for franchises spanning 3+ genres including Video Game Adaptation.
  if (genres.length >= 3 && genres.includes('Video Game Adaptation')) {
    crossoverBonus += 0.25;
  }

  // 2. Format Diversity Multiplier
  const multiplier = franchise.synergyMultiplier;
  
  // Mega-franchise cultural premium
  const megaFranchisePremium = assets.length >= 10 ? 1.25 : 1.0;

  // Cinematic Universe Phase Fatigue
  if (assets.length >= 10 && franchise.relevanceScore < 50 && franchise.activeProjectIds.length >= 3) {
    crossoverBonus -= 0.25;
  }

  // Cinematic Universe Phase Fatigue (Poorly Performing Spin-offs)
  if (assets.length >= 5 && franchise.audienceLoyalty < 40 && franchise.activeProjectIds.length >= 3) {
    crossoverBonus -= 0.35;
  }

  // Penalty for diluting the franchise brand with too many concurrent projects
  const overSaturationPenalty = franchise.activeProjectIds && franchise.activeProjectIds.length >= 4 ? 0.8 : 1.0;

  // Massive penalty to valuation if the franchise is heavily fatigued
  const fatiguePenalty = franchise.fatigueLevel > 0.8 ? 0.5 : 1.0;

  return Math.floor(baseEquity * crossoverBonus * multiplier * megaFranchisePremium * overSaturationPenalty * fatiguePenalty);
}
