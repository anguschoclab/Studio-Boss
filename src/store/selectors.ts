import { createSelector } from 'reselect';
import { GameState, Project, RivalStudio, Talent, GameEvent } from '../engine/types';
import { FinanceState, MarketState } from '../engine/types/state.types';
import { TalentRole, TalentTier } from '../engine/types/talent.types';

const EMPTY_PROJECTS: Record<string, Project> = {};
const EMPTY_FINANCE: FinanceState = {
  cash: 0, 
  ledger: [], 
  weeklyHistory: [], 
  marketState: { cycle: 'STABLE', sentiment: 0, baseRate: 0.05, consumerConfidence: 50, debtRate: 0.08, savingsYield: 0.02 } as import('../engine/types/state.types').MarketState
};
const EMPTY_MARKET: GameState['market'] = { buyers: [], opportunities: [], trends: [], activeMarketEvents: [] };
const EMPTY_TALENT_POOL: Record<string, Talent> = {};
const EMPTY_RIVALS: RivalStudio[] = [];
const EMPTY_EVENT_HISTORY: GameEvent[] = [];

const DEFAULT_MARKET_METRICS = { cycle: 'STABLE', sentiment: 0, debtRate: 0.08, savingsRate: 0.02 };

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
  [selectProjectsRaw],
  (projects) => {
    const arr: Project[] = [];
    for (const key in projects) {
      const p = projects[key];
      if (p.state !== 'released' && p.state !== 'archived' && p.state !== 'post_release') {
        arr.push(p);
      }
    }
    return arr;
  }
);

export const selectReleasedProjects = createSelector(
  [selectProjectsRaw],
  (projects) => {
    const arr: Project[] = [];
    for (const key in projects) {
      const p = projects[key];
      if (p.state === 'released' || p.state === 'post_release' || p.state === 'archived') {
        arr.push(p);
      }
    }
    return arr;
  }
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
    let totalRevenue = 0;
    let totalScore = 0;
    for (let i = 0; i < released.length; i++) {
      totalRevenue += released[i].revenue || 0;
      totalScore += released[i].reviewScore || 0;
    }
    const avgScore = released.length > 0 ? totalScore / released.length : 0;
    
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
    if (!market) return DEFAULT_MARKET_METRICS;
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

/**
 * Filtered Talent Selector
 */
const TIER_RANK: Record<TalentTier, number> = {
  S_LIST: 6, A_LIST: 5, B_LIST: 4, C_LIST: 3, RISING_STAR: 2, NEWCOMER: 1
};

export interface TalentFilter {
  roles?: TalentRole[];
  minTier?: TalentTier;
  excludeHoldingDeals?: boolean;
  availableAtWeek?: number;
  genres?: string[];
  excludeOnMedicalLeave?: boolean;
}

export const selectFilteredTalent = (state: GameState | null, filter: TalentFilter): Talent[] => {
  if (!state) return [];
  const pool = Object.values(state.industry.talentPool);
  return pool.filter(t => {
    if (filter.roles && !filter.roles.some(r => t.roles?.includes(r) || t.role === r)) return false;
    if (filter.minTier && TIER_RANK[t.tier] < TIER_RANK[filter.minTier]) return false;
    if (filter.excludeOnMedicalLeave && t.onMedicalLeave) return false;
    if (filter.excludeHoldingDeals) {
      const hasHold = t.commitments?.some(c => c.isHoldingDeal);
      if (hasHold) return false;
    }
    if (filter.availableAtWeek !== undefined) {
      const busy = t.commitments?.some(c =>
        !c.isHoldingDeal &&
        c.startWeek <= filter.availableAtWeek! &&
        c.endWeek >= filter.availableAtWeek!
      );
      if (busy) return false;
    }
    if (filter.genres?.length && t.preferredGenres?.length) {
      const overlap = filter.genres.some(g => t.preferredGenres.includes(g));
      if (!overlap) return false;
    }
    return true;
  });
};
