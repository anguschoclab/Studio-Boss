/**
 * Configuration for the TV Syndication system.
 * Based on real-world broadcasting standards (2026 Perspective).
 */

export type SyndicationTier = 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD';

export interface SyndicationTierConfig {
  id: SyndicationTier;
  minEpisodes: number;
  revenueMultiplier: number;
  decayShield: number; // 0 to 1.0 (1.0 = 100% of decay is prevented)
  label: string;
  description: string;
  color: string;
}

export const SYNDICATION_TIERS: Record<SyndicationTier, SyndicationTierConfig> = {
  GOLD: {
    id: 'GOLD',
    minEpisodes: 100,
    revenueMultiplier: 3.5, // Daily strip "Gold Standard"
    decayShield: 1.0, // Permanent cultural imprint, no decay
    label: 'Gold Standard',
    description: '100+ Episodes. Ideal for daily stripping (Monday-Friday). Maximum market value.',
    color: '#fbbf24', // Amber-400
  },
  SILVER: {
    id: 'SILVER',
    minEpisodes: 88,
    revenueMultiplier: 2.2, // Standard off-network minimum
    decayShield: 0.9, // Near-permanent relevance
    label: 'Silver Package',
    description: '88-99 Episodes. Standard requirement for cable/modern syndication.',
    color: '#94a3b8', // Slate-400
  },
  BRONZE: {
    id: 'BRONZE',
    minEpisodes: 65,
    revenueMultiplier: 1.4, // First-run / animation standard
    decayShield: 0.5, // Significant longevity boost
    label: 'Bronze Package',
    description: '65-87 Episodes. Sufficient for children\'s programming or first-run syndication.',
    color: '#fb923c', // Orange-400
  },
  NONE: {
    id: 'NONE',
    minEpisodes: 0,
    revenueMultiplier: 1.0,
    decayShield: 0,
    label: 'No Syndication',
    description: 'Insufficient episodes for standard broadcast stripping.',
    color: '#64748b', // Slate-500
  },
};

/**
 * Genre-specific multipliers for episode thresholds.
 * Some genres (Animation/Kids) can trigger syndication tier requirements earlier.
 */
export const GENRE_SYNDICATION_MODIFIERS: Record<string, number> = {
  'ANIMATION': 0.8, // Bronze at 52 episodes (0.8 * 65)
  'KIDS': 0.8,
  'CHILDREN': 0.8,
  'SITCOM': 1.0,
  'DRAMA': 1.0,
};
