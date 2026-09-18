import {ContentFlag, ProjectRating, Project, RegionalRating, RatingMarket} from "@/engine/types";
import {MARKET_CONFIGS, getBannedMarkets, getRestrictedMarkets} from "../../data/ratingMarkets";

/**
 * Returns a per-market rating and ban status for all 8 markets.
 * Stored on project.regionalRatings at greenlight time.
 */
export function evaluateRegionalRatings(
  flags: ContentFlag[],
  baseRating: ProjectRating
): RegionalRating[] {
  const bannedMarkets = getBannedMarkets(flags);
  const restrictedMarkets = getRestrictedMarkets(flags);

  // ⚡ Bolt Optimization: Replace Object.keys().map() with a direct for...in loop
  const ratings: RegionalRating[] = [];
  for (const key in MARKET_CONFIGS) {
    if (!Object.prototype.hasOwnProperty.call(MARKET_CONFIGS, key)) continue;
    const market = key as RatingMarket;
    const isBanned = bannedMarkets.includes(market);
    const isRestricted = restrictedMarkets.includes(market);
    const restrictionLevel = isBanned ? "banned" : isRestricted ? "major" : "none";

    ratings.push({
      market,
      rating: baseRating,
      isBanned,
      restrictionLevel,
    });
  }
  return ratings;
}

/**
 * Calculates a composite global box-office penalty multiplier from content flags.
 * Uses MARKET_CONFIGS data: banned markets lose their full share, restricted markets
 * lose a fraction of their share.
 *
 * @param project - Takes the full project (backward-compatible with existing callers)
 * @returns Multiplier between 0.1 and 1.0
 */
export function calculateRegionalPenalties(project: Project): number {
  const flags = project.contentFlags || [];
  if (flags.length === 0) return 1.0;

  let totalLoss = 0;

  // ⚡ Bolt Optimization: Replace Object.keys() iteration with a direct for...in loop
  for (const key in MARKET_CONFIGS) {
    if (!Object.prototype.hasOwnProperty.call(MARKET_CONFIGS, key)) continue;
    const market = key as RatingMarket;
    const config = MARKET_CONFIGS[market];
    const isBanned = config.bannedFlags.some((f) => flags.includes(f));
    const isRestricted = config.restrictedFlags.some((f) => flags.includes(f));

    if (isBanned) {
      totalLoss += config.boxOfficeSharePct;
    } else if (isRestricted) {
      totalLoss += config.boxOfficeSharePct * (1 - config.restrictionRevenueMultiplier);
    }
  }

  return Math.max(0.1, 1.0 - totalLoss);
}
