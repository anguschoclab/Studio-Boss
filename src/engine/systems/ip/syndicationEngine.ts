import { SYNDICATION_TIERS, GENRE_SYNDICATION_MODIFIERS, SyndicationTier } from '../../data/syndicationConfig';
import { IPAsset } from '../../types/state.types';

/**
 * Pure logic for determining the syndication package tier.
 * Accounts for genre-specific flexibility (Animation/Kids).
 */
export function determineSyndicationTier(episodes: number, genre: string = 'DRAMA'): SyndicationTier {
  const modifier = GENRE_SYNDICATION_MODIFIERS[genre.toUpperCase()] || 1.0;
  
  // Check from highest to lowest
  if (episodes >= Math.ceil(SYNDICATION_TIERS.GOLD.minEpisodes * modifier)) return 'GOLD';
  if (episodes >= Math.ceil(SYNDICATION_TIERS.SILVER.minEpisodes * modifier)) return 'SILVER';
  if (episodes >= Math.ceil(SYNDICATION_TIERS.BRONZE.minEpisodes * modifier)) return 'BRONZE';
  
  return 'NONE';
}

/**
 * Returns the impact configuration (revenue mult, decay shield) for a given tier.
 */
export function getSyndicationImpact(tier: SyndicationTier) {
  return SYNDICATION_TIERS[tier] || SYNDICATION_TIERS.NONE;
}

/**
 * Calculates the "Syndication Potential" of a show.
 * Used for AI value estimation and UI progress tracking.
 */
export function calculateSyndicationProgress(episodes: number, genre: string = 'DRAMA') {
  const modifier = GENRE_SYNDICATION_MODIFIERS[genre.toUpperCase()] || 1.0;
  const nextTarget = episodes < 65 * modifier ? 65 * modifier : (episodes < 88 * modifier ? 88 * modifier : 100 * modifier);
  
  return {
    progress: Math.min(100, (episodes / nextTarget) * 100),
    episodesNeeded: Math.max(0, Math.ceil(nextTarget - episodes))
  };
}
