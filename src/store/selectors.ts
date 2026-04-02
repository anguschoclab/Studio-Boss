import { createSelector } from 'reselect';
import { GameState, Project, RivalStudio, Talent, GameEvent } from '../engine/types';

const EMPTY_PROJECTS = {};
const EMPTY_FINANCE = { 
  cash: 0, 
  ledger: [], 
  weeklyHistory: [], 
  marketState: null 
};
const EMPTY_MARKET = { buyers: [], opportunities: [], trends: [], activeMarketEvents: [] };
const EMPTY_TALENT_POOL = {};
const EMPTY_RIVALS: RivalStudio[] = [];
const EMPTY_EVENT_HISTORY: GameEvent[] = [];

/**
 * Standard Root Selectors
 */
export const selectGameState = (state: GameState | null): GameState | null => state;

export const selectStudio = createSelector(
  [selectGameState],
  (state): GameState['studio'] | null => state?.studio || null
);

export const selectInternal = createSelector(
  [selectStudio],
  (studio): GameState['studio']['internal'] | null => studio?.internal || null
);

export const selectProjectsRaw = createSelector(
  [selectInternal],
  (internal): Record<string, Project> => internal?.projects || EMPTY_PROJECTS
);

export const selectProjects = createSelector(
  [selectProjectsRaw],
  (projects): Project[] => Object.values(projects)
);

export const selectFinance = createSelector(
  [selectGameState],
  (state) => state?.finance || EMPTY_FINANCE
);

export const selectCash = createSelector(
  [selectFinance],
  (finance): number => finance.cash || 0
);

/**
 * Industry Selectors
 */
export const selectIndustry = createSelector(
  [selectGameState],
  (state): GameState['industry'] | null => state?.industry || null
);

export const selectRivals = createSelector(
  [selectIndustry],
  (industry): RivalStudio[] => industry?.rivals || EMPTY_RIVALS
);

export const selectTalentPool = createSelector(
  [selectIndustry],
  (industry): Record<string, Talent> => industry?.talentPool || EMPTY_TALENT_POOL
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
  (state) => state?.market || EMPTY_MARKET
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
 * Market & Economy Selectors
 */
export const selectMarketState = createSelector(
  [selectFinance],
  (finance) => finance.marketState || null
);

export const selectMarketMetrics = createSelector(
  [selectMarketState],
  (market) => {
    if (!market) return { cycle: 'STABLE', sentiment: 0, debtRate: 0.08, savingsRate: 0.02 };
    return {
      cycle: market.cycle,
      sentiment: market.sentiment,
      debtRate: market.debtRate,
      savingsRate: market.savingsYield
    };
  }
);

/**
 * Project Recoupment Selectors
 */
export const selectLatestSnapshot = createSelector(
  [selectFinance],
  (finance) => finance.weeklyHistory[finance.weeklyHistory.length - 1] || null
);

export const selectRecoupmentMap = createSelector(
  [selectLatestSnapshot],
  (snapshot) => snapshot?.projectRecoupment || {}
);

export const selectProjectRecoupment = (projectId: string) => 
  createSelector(
    [selectRecoupmentMap],
    (map) => map[projectId] || 0
  );

/**
 * UI / Event Selectors
 */
export const selectEventHistory = createSelector(
  [selectGameState],
  (state): GameEvent[] => state?.eventHistory || EMPTY_EVENT_HISTORY
);

export const selectRecentEvents = createSelector(
  [selectEventHistory],
  (history): GameEvent[] => history.slice(-10).reverse()
);
