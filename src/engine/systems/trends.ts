import { GenreTrend, GameState } from "@/engine/types";
import { StateImpact } from "../types/state.types";
import { secureRandom } from "../utils";

export const ALL_GENRES = [
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Sci-Fi",
  "Thriller",
  "Romance",
  "Animation",
  "Documentary",
  "Fantasy",
];

export function initializeTrends(): GenreTrend[] {
  // Pick 3 random genres to be the starting trends
  // Fisher–Yates: sort(() => 0.5 - rand()) is a biased shuffle.
  const shuffled = [...ALL_GENRES];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(secureRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return [
    {
      genre: shuffled[0],
      heat: 80,
      direction: "rising",
      weeksRemaining: 12,
    },
    {
      genre: shuffled[1],
      heat: 50,
      direction: "stable",
      weeksRemaining: 24,
    },
    {
      genre: shuffled[2],
      heat: 20,
      direction: "cooling",
      weeksRemaining: 6,
    },
  ];
}

export function advanceTrends(trends: GenreTrend[]): StateImpact[] {
  // ⚡ Bolt: Consolidated .map() and .filter() into a single for loop to avoid intermediate array allocations
  const updated: GenreTrend[] = [];
  const len = trends ? trends.length : 0;
  for (let i = 0; i < len; i++) {
    const t = trends[i];
    let newHeat = t.heat;
    if (t.direction === "rising") newHeat = Math.min(100, newHeat + 5);
    if (t.direction === "cooling") newHeat = Math.max(0, newHeat - 5);

    // Change direction if maxed out or cooled out
    let newDirection = t.direction;
    if (newHeat >= 100) newDirection = "stable";
    if (newHeat <= 0) newDirection = "dead";

    const remaining = (t.weeksRemaining || 0) - 1;

    // Remove dead trends or those out of time
    if (remaining > 0 && newHeat > 0) {
      updated.push({
        ...t,
        heat: newHeat,
        direction: newDirection,
        weeksRemaining: remaining,
      });
    }
  }

  // Randomly spawn new trends if we are low
  if (updated.length < 5 && secureRandom() < 0.1) {
    const activeGenres = new Set(updated.map((t) => t.genre));
    const available = ALL_GENRES.filter((g) => !activeGenres.has(g));
    if (available.length > 0) {
      const newGenre = available[Math.floor(secureRandom() * available.length)];
      updated.push({
        genre: newGenre,
        heat: 30,
        direction: "rising",
        weeksRemaining: 16 + Math.floor(secureRandom() * 12),
      });
    }
  }

  return [
    {
      type: "TRENDS_UPDATED",
      payload: { trends: updated },
    },
  ];
}

export function getTrendMultiplier(
  project: { genre: string; targetAudience: string },
  state: GameState
): number {
  if (!state.market.trends) return 1.0;

  let trendModifier = 1.0;

  // Check both genre and audience for trend matches
  for (const trend of state.market.trends) {
    const isMatch = trend.genre === project.genre || trend.genre === project.targetAudience;

    if (isMatch) {
      if (trend.heat >= 70) {
        trendModifier += 0.3;
      } else if (trend.heat <= 30) {
        trendModifier -= 0.25;
      }
    }
  }

  return trendModifier;
}
