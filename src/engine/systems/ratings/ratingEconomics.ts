import { ProjectRating, RatingEconomics } from "@/engine/types";

/**
 * Economic modifiers for each rating.
 * These multipliers are applied to box office, merchandise, and streaming revenue.
 */
const RATING_ECONOMICS_MAP: Record<ProjectRating, RatingEconomics> = {
  G: {
    theaterAccessPct: 1.0,
    audienceReachMultiplier: 0.85,
    merchMultiplier: 1.3,
    awardsPrestigeBonus: 0,
    streamingPremium: 0,
  },
  PG: {
    theaterAccessPct: 1.0,
    audienceReachMultiplier: 0.95,
    merchMultiplier: 1.15,
    awardsPrestigeBonus: 0,
    streamingPremium: 0,
  },
  "PG-13": {
    theaterAccessPct: 1.0,
    audienceReachMultiplier: 1.0,
    merchMultiplier: 1.0,
    awardsPrestigeBonus: 0,
    streamingPremium: 0,
  },
  R: {
    theaterAccessPct: 0.85,
    audienceReachMultiplier: 0.85,
    merchMultiplier: 0.7,
    awardsPrestigeBonus: 10,
    streamingPremium: 0,
  },
  "NC-17": {
    theaterAccessPct: 0.3,
    audienceReachMultiplier: 0.65,
    merchMultiplier: 0.3,
    awardsPrestigeBonus: -15,
    streamingPremium: 0.05,
  },
  Unrated: {
    theaterAccessPct: 0.15,
    audienceReachMultiplier: 0.6,
    merchMultiplier: 0.2,
    awardsPrestigeBonus: -20,
    streamingPremium: 0.2,
  },
  "TV-Y": {
    theaterAccessPct: 1.0,
    audienceReachMultiplier: 0.85,
    merchMultiplier: 1.3,
    awardsPrestigeBonus: 0,
    streamingPremium: 0,
  },
  "TV-G": {
    theaterAccessPct: 1.0,
    audienceReachMultiplier: 0.85,
    merchMultiplier: 1.3,
    awardsPrestigeBonus: 0,
    streamingPremium: 0,
  },
  "TV-PG": {
    theaterAccessPct: 1.0,
    audienceReachMultiplier: 0.95,
    merchMultiplier: 1.15,
    awardsPrestigeBonus: 0,
    streamingPremium: 0,
  },
  "TV-14": {
    theaterAccessPct: 1.0,
    audienceReachMultiplier: 0.95,
    merchMultiplier: 1.0,
    awardsPrestigeBonus: 0,
    streamingPremium: 0,
  },
  "TV-MA": {
    theaterAccessPct: 1.0,
    audienceReachMultiplier: 0.85,
    merchMultiplier: 0.7,
    awardsPrestigeBonus: 8,
    streamingPremium: 0.1,
  },
};

const DEFAULT_ECONOMICS: RatingEconomics = {
  theaterAccessPct: 1.0,
  audienceReachMultiplier: 1.0,
  merchMultiplier: 1.0,
  awardsPrestigeBonus: 0,
  streamingPremium: 0,
};

/**
 * Returns the economic modifier struct for a given rating.
 */
export function getRatingEconomics(rating: ProjectRating): RatingEconomics {
  return RATING_ECONOMICS_MAP[rating] || DEFAULT_ECONOMICS;
}
