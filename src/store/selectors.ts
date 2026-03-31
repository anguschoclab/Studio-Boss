import { createSelector } from 'reselect';
import { GameState, Project, Contract, RivalStudio, Talent, Buyer, GenreTrend } from '../engine/types';

/**
 * Standard Root Selectors
 */
export const selectGameState = (state: GameState | null) => state;

export const selectStudio = createSelector(
  [selectGameState],
  (state) => state?.studio || null
);

export const selectInternal = createSelector(
  [selectStudio],
  (studio) => studio?.internal || null
);

export const selectProjectsRaw = createSelector(
  [selectInternal],
  (internal) => internal?.projects || {}
);

export const selectProjects = createSelector(
  [selectProjectsRaw],
  (projects) => Object.values(projects)
);

export const selectFinance = createSelector(
  [selectGameState],
  (state) => state?.finance || { cash: 0, ledger: [] }
);

export const selectCash = createSelector(
  [selectFinance],
  (finance) => finance.cash || 0
);

/**
 * Industry Selectors
 */
export const selectIndustry = createSelector(
  [selectGameState],
  (state) => state?.industry || null
);

export const selectRivals = createSelector(
  [selectIndustry],
  (industry) => industry?.rivals || []
);

export const selectTalentPool = createSelector(
  [selectIndustry],
  (industry) => industry?.talentPool || {}
);

/**
 * Business Logic Selectors (Selector Hardening)
 */

export const selectActiveProjects = createSelector(
  [selectProjects],
  (projects) => projects.filter(p => 
    p.state !== 'released' && 
    p.state !== 'archived' && 
    p.state !== 'post_release'
  )
);

export const selectReleasedProjects = createSelector(
  [selectProjects],
  (projects) => projects.filter(p => 
    p.state === 'released' || 
    p.state === 'post_release' || 
    p.state === 'archived'
  )
);

export const selectIsBankrupt = createSelector(
  [selectCash, selectActiveProjects],
  (cash, activeProjects) => {
    // Basic check: Cash < $0 and no potential revenue soon
    return cash < 0 && activeProjects.length === 0;
  }
);

export const selectStudioSuccess = createSelector(
  [selectReleasedProjects],
  (released) => {
    const totalRevenue = released.reduce((sum, p) => sum + (p.revenue || 0), 0);
    const avgScore = released.length > 0 
      ? released.reduce((sum, p) => sum + (p.reviewScore || 0), 0) / released.length 
      : 0;
    
    return {
      totalRevenue,
      avgScore,
      count: released.length
    };
  }
);

export const selectMarket = createSelector(
  [selectGameState],
  (state) => state?.market || { buyers: [], opportunities: [], trends: [], activeMarketEvents: [] }
);

export const selectOpportunities = createSelector(
  [selectMarket],
  (market) => market.opportunities || []
);

export const selectBuyers = createSelector(
  [selectMarket],
  (market) => market.buyers || []
);

export const selectMarketTrends = createSelector(
  [selectMarket],
  (market) => market.trends || []
);

/**
 * UI / Event Selectors
 */
export const selectEventHistory = createSelector(
  [selectGameState],
  (state) => state?.eventHistory || []
);

export const selectRecentEvents = createSelector(
  [selectEventHistory],
  (history) => history.slice(-10).reverse()
);
