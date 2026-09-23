import {createSelector} from "reselect";
import {GameState, Project, Talent} from "../engine/types";
import type {DistressedAssetOffer} from "@/engine/types/distress.types";
import {calculateFranchiseFatigue} from "@/engine/systems/ip/fatigueEngine";

const EMPTY_PROJECTS = {};
const EMPTY_MARKET = { buyers: [], opportunities: [], trends: [], activeMarketEvents: [] };
const EMPTY_TALENT_POOL = {};
const EMPTY_OFFERS: DistressedAssetOffer[] = [];
const EMPTY_NEWS_EVENTS: import("@/engine/types").NewsEvent[] = [];

/**
 * Standard Root Selectors
 */
export const selectGameState = (state: GameState | null): GameState | null => state;

export const selectProjectsRaw = createSelector(
  [selectGameState],
  (state): Record<string, Project> => state?.entities?.projects || EMPTY_PROJECTS
);

export const selectProjects = createSelector([selectProjectsRaw], (projects): Project[] =>
  Object.values(projects)
);

export const selectTalentPool = createSelector(
  [selectGameState],
  (state): Record<string, Talent> => state?.entities?.talents || EMPTY_TALENT_POOL
);

export const selectMarket = createSelector(
  [selectGameState],
  (state) => state?.market || EMPTY_MARKET
);

export const selectOpportunities = createSelector(
  [selectMarket],
  (market) => market.opportunities || []
);

export const selectBuyers = createSelector([selectMarket], (market) => market.buyers || []);

export const selectMarketTrends = createSelector([selectMarket], (market) => market.trends || []);

export const selectDistressedOffers = (state: GameState | null): DistressedAssetOffer[] =>
  state?.industry?.distressedOffers ?? EMPTY_OFFERS;

export const selectDistressedOffer = (
  state: GameState | null,
  offerId: string
): DistressedAssetOffer | undefined => selectDistressedOffers(state).find((o) => o.id === offerId);

/**
 * Business Logic Selectors
 */

export const selectActiveProjects = createSelector([selectProjects], (projects) =>
  projects.filter(
    (p) => p.state !== "released" && p.state !== "archived" && p.state !== "post_release"
  )
);

export const selectAwardsOddsById = createSelector([selectProjects], (projects) => {
  const odds: Record<string, number> = {};
  for (const p of projects) {
    const ap = p.awardsProfile;
    if (!ap) continue;
    odds[p.id] = Math.min(100, Math.round((ap.criticScore + ap.academyAppeal) / 2 + 5));
  }
  return odds;
});

export const selectAwardsEligibleProjects = createSelector(
  [selectProjects, selectGameState],
  (projects, state) => {
    if (!state) return [];
    const currentWeek = state.week;
    return projects.filter(
      (p) =>
        (p.state === "released" || p.state === "post_release") &&
        p.releaseWeek &&
        p.releaseWeek > currentWeek - 52 &&
        p.awardsProfile
    );
  }
);

export function selectFatigueForAsset(state: GameState | null, assetId: string): number {
  if (!state) return 0;
  const asset = state.ip.vault.find((a) => a.id === assetId);
  if (!asset) return 0;
  if (!asset.franchiseId) return 0;
  const franchise = state.ip.franchises[asset.franchiseId];
  if (!franchise) return 0;

  const originalProject =
    state.entities.projects[asset.originalProjectId] ||
    state.studio.internal.projects[asset.originalProjectId];
  const genre = originalProject?.genre || "Action";

  let genreSaturation = 0;
  const allProjects = Object.values(state.entities.projects);
  for (let i = 0; i < allProjects.length; i++) {
    if (allProjects[i].genre === genre) genreSaturation++;
  }

  const rawFatigue = calculateFranchiseFatigue(franchise, genreSaturation, genre);
  return Math.round(rawFatigue * 100);
}

export const selectNewsHistory = createSelector(
  [selectGameState],
  (state): import("@/engine/types").NewsEvent[] => {
    if (!state?.weekSummaries) return EMPTY_NEWS_EVENTS;
    return state.weekSummaries
      .flatMap((s) => s.newsEvents || [])
      .sort((a, b) => b.week - a.week);
  }
);
