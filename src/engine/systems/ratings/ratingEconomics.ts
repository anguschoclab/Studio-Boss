import {
  ProjectRating,
  RatingEconomics,
} from '@/engine/types';

/**
 * Returns the economic modifier struct for a given rating.
 * These multipliers are applied to box office, merchandise, and streaming revenue.
 */
export function getRatingEconomics(rating: ProjectRating): RatingEconomics {
  switch (rating) {
    case 'G':
      return { theaterAccessPct: 1.0, audienceReachMultiplier: 0.85, merchMultiplier: 1.30, awardsPrestigeBonus: 0, streamingPremium: 0 };
    case 'PG':
      return { theaterAccessPct: 1.0, audienceReachMultiplier: 0.95, merchMultiplier: 1.15, awardsPrestigeBonus: 0, streamingPremium: 0 };
    case 'PG-13':
      return { theaterAccessPct: 1.0, audienceReachMultiplier: 1.0, merchMultiplier: 1.0, awardsPrestigeBonus: 0, streamingPremium: 0 };
    case 'R':
      return { theaterAccessPct: 0.85, audienceReachMultiplier: 0.85, merchMultiplier: 0.70, awardsPrestigeBonus: 10, streamingPremium: 0 };
    case 'NC-17':
      return { theaterAccessPct: 0.30, audienceReachMultiplier: 0.65, merchMultiplier: 0.30, awardsPrestigeBonus: -15, streamingPremium: 0.05 };
    case 'Unrated':
      return { theaterAccessPct: 0.15, audienceReachMultiplier: 0.60, merchMultiplier: 0.20, awardsPrestigeBonus: -20, streamingPremium: 0.20 };
    case 'TV-Y':
    case 'TV-G':
      return { theaterAccessPct: 1.0, audienceReachMultiplier: 0.85, merchMultiplier: 1.30, awardsPrestigeBonus: 0, streamingPremium: 0 };
    case 'TV-PG':
      return { theaterAccessPct: 1.0, audienceReachMultiplier: 0.95, merchMultiplier: 1.15, awardsPrestigeBonus: 0, streamingPremium: 0 };
    case 'TV-14':
      return { theaterAccessPct: 1.0, audienceReachMultiplier: 0.95, merchMultiplier: 1.0, awardsPrestigeBonus: 0, streamingPremium: 0 };
    case 'TV-MA':
      return { theaterAccessPct: 1.0, audienceReachMultiplier: 0.85, merchMultiplier: 0.70, awardsPrestigeBonus: 8, streamingPremium: 0.10 };
    default:
      return { theaterAccessPct: 1.0, audienceReachMultiplier: 1.0, merchMultiplier: 1.0, awardsPrestigeBonus: 0, streamingPremium: 0 };
  }
}
