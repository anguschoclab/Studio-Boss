import { GameState, Project, RivalStudio, Talent, GameEvent } from '../engine/types';
import { FinanceState, MarketState } from '../engine/types/state.types';
import { TalentRole, TalentTier } from '../engine/types/talent.types';

/**
 * Lightweight native selectors.
 * Replaced 'reselect' (4.9MB) with native pure functions.
 * Optimized for Rollup/Vite build stability by removing inline imports.
 */

const EMPTY_PROJECTS: Record<string, Project> = {};
const EMPTY_MARKET: GameState['market'] = { buyers: [], opportunities: [], trends: [], activeMarketEvents: [] };
const EMPTY_TALENT_POOL: Record<string, Talent> = {};
const EMPTY_RIVALS: Record<string, RivalStudio> = {};
const EMPTY_EVENT_HISTORY: GameEvent[] = [];
const EMPTY_ARRAY: never[] = [];
const DEFAULT_MARKET_METRICS = { cycle: 'STABLE', sentiment: 0, debtRate: 0.08, savingsRate: 0.02 };

export const DEFAULT_FINANCE_STATE: FinanceState = {
  cash: 0, 
  ledger: [], 
  weeklyHistory: [], 
  marketState: { 
    cycle: 'STABLE', 
    sentiment: 0, 
    baseRate: 0.05, 
    debtRate: 0.08, 
    savingsYield: 0.02,
    loanRate: 0.08,
    rateHistory: []
  } as MarketState
};

const EMPTY_FINANCE = DEFAULT_FINANCE_STATE;

export const selectGameState = (state: GameState | null): GameState | null => state;

export const selectStudio = (state: GameState | null) => state?.studio || null;
export const selectInternal = (state: GameState | null) => state?.studio?.internal || null;
export const selectProjectsRaw = (state: GameState | null) => state?.entities?.projects || EMPTY_PROJECTS;

// ⚡ Bolt: Cache array references to prevent unnecessary React re-renders when useShallow is used
let lastProjectsRaw: Record<string, Project> | null = null;
let lastProjectsArray: Project[] = [];

export const selectProjects = (state: GameState | null): Project[] => {
  const raw = selectProjectsRaw(state);
  if (raw !== lastProjectsRaw) {
    lastProjectsRaw = raw;
    lastProjectsArray = Object.values(raw);
  }
  return lastProjectsArray;
};

export const selectFinance = (state: GameState | null) => state?.finance || EMPTY_FINANCE;
export const selectCash = (state: GameState | null) => selectFinance(state).cash || 0;

export const selectIndustry = (state: GameState | null) => state?.industry || null;
export const selectRivalsRaw = (state: GameState | null) => state?.entities?.rivals || EMPTY_RIVALS;

// ⚡ Bolt: Cache array references to prevent unnecessary React re-renders when useShallow is used
let lastRivalsRaw: Record<string, RivalStudio> | null = null;
let lastRivalsArray: RivalStudio[] = [];

export const selectRivals = (state: GameState | null): RivalStudio[] => {
  const raw = selectRivalsRaw(state);
  if (raw !== lastRivalsRaw) {
    lastRivalsRaw = raw;
    lastRivalsArray = Object.values(raw);
  }
  return lastRivalsArray;
};

export const selectTalentPoolRaw = (state: GameState | null) => state?.entities?.talents || EMPTY_TALENT_POOL;

// ⚡ Bolt: Cache array references to prevent unnecessary React re-renders when useShallow is used
let lastTalentPoolRaw: Record<string, Talent> | null = null;
let lastTalentPoolArray: Talent[] = [];

export const selectTalentPool = (state: GameState | null): Talent[] => {
  const raw = selectTalentPoolRaw(state);
  if (raw !== lastTalentPoolRaw) {
    lastTalentPoolRaw = raw;
    lastTalentPoolArray = Object.values(raw);
  }
  return lastTalentPoolArray;
};

// ⚡ Bolt: Cache array references to prevent unnecessary React re-renders when useShallow is used
let lastActiveProjectsRaw: Record<string, Project> | null = null;
let lastActiveProjectsArray: Project[] = [];

export const selectActiveProjects = (state: GameState | null): Project[] => {
  const raw = selectProjectsRaw(state);
  if (raw !== lastActiveProjectsRaw) {
    lastActiveProjectsRaw = raw;
    lastActiveProjectsArray = Object.values(raw).filter(p =>
      p.state !== 'released' && p.state !== 'archived' && p.state !== 'post_release'
    );
  }
  return lastActiveProjectsArray;
};

// ⚡ Bolt: Cache array references to prevent unnecessary React re-renders when useShallow is used
let lastReleasedProjectsRaw: Record<string, Project> | null = null;
let lastReleasedProjectsArray: Project[] = [];

export const selectReleasedProjects = (state: GameState | null): Project[] => {
  const raw = selectProjectsRaw(state);
  if (raw !== lastReleasedProjectsRaw) {
    lastReleasedProjectsRaw = raw;
    lastReleasedProjectsArray = Object.values(raw).filter(p =>
      p.state === 'released' || p.state === 'post_release' || p.state === 'archived'
    );
  }
  return lastReleasedProjectsArray;
};

export const selectIsBankrupt = (state: GameState | null) => {
    const cash = selectCash(state);
    const activeProjects = selectActiveProjects(state);
    return cash < 0 && activeProjects.length === 0;
};

export const selectMarket = (state: GameState | null) => state?.market || EMPTY_MARKET;
export const selectOpportunities = (state: GameState | null) => selectMarket(state).opportunities || EMPTY_ARRAY;
export const selectBuyers = (state: GameState | null) => selectMarket(state).buyers || EMPTY_ARRAY;
export const selectMarketTrends = (state: GameState | null) => selectMarket(state).trends || EMPTY_ARRAY;

export const selectMarketState = (state: GameState | null) => selectFinance(state).marketState || null;
export const selectMarketMetrics = (state: GameState | null) => {
  const market = selectMarketState(state);
  if (!market) return DEFAULT_MARKET_METRICS;
  return {
    cycle: market.cycle,
    sentiment: market.sentiment,
    debtRate: market.debtRate,
    savingsRate: market.savingsYield
  };
};

export const selectLatestSnapshot = (state: GameState | null) => {
    const finance = selectFinance(state);
    return finance.weeklyHistory[finance.weeklyHistory.length - 1] || null;
};

export const selectRecoupmentMap = (state: GameState | null) => selectLatestSnapshot(state)?.projectRecoupment || {};

export const selectEventHistory = (state: GameState | null) => state?.eventHistory || EMPTY_EVENT_HISTORY;
export const selectRecentEvents = (state: GameState | null) => selectEventHistory(state).slice(-10).reverse();

const TIER_RANK: Record<TalentTier, number> = { 1: 4, 2: 3, 3: 2, 4: 1 };

export interface TalentFilter {
  roles?: TalentRole[];
  minTier?: TalentTier;
  excludeHoldingDeals?: boolean;
  availableAtWeek?: number;
  genres?: string[];
  excludeOnMedicalLeave?: boolean;
}

export const selectFilteredTalent = (state: GameState | null, filter: TalentFilter): Talent[] => {
  if (!state || !state.entities) return EMPTY_ARRAY;
  const pool = state.entities.talents || EMPTY_TALENT_POOL;
  return Object.values(pool).filter(t => {
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

// ============================================================================
// VISUALIZATION SELECTORS - Phase 1: Financial Core
// ============================================================================

// ============================================================================
// CHART SELECTORS — all visualization-specific selectors live in chartSelectors.ts
// Re-exported here for backward compatibility so existing imports don't break.
// ============================================================================
export {
  selectCashFlowTrends,
  selectRevenueBreakdown,
  selectWeeklyRevenueHistory,
  selectBudgetBurnData,
  selectRecoupmentStatus,
  selectProjectTimelineData,
  selectBoxOfficeData,
  selectProductionSlippage,
  selectScriptQualityMetrics,
  selectGenrePerformanceMatrix,
  selectMarketShareData,
  selectStreamingViewership,
  selectTalentSatisfaction,
  selectTalentTierDistribution,
  selectDealStats,
  selectStudioHealthMetrics,
  selectActiveCrisisCount,
  selectCrisisRiskLevel,
  selectAwardsProbability,
} from './chartSelectors';

// ============================================================================
// DERIVED STATE SELECTORS — shared predicates to eliminate component-level duplication
// ============================================================================

/**
 * Projects over budget (accumulated cost > 110% of budget)
 */
export const selectOverBudgetProjects = (state: GameState | null): Project[] => {
  return selectProjects(state).filter(p =>
    (p.accumulatedCost || 0) > (p.budget || 0) * 1.1
  );
};

/**
 * Talent with mood below a threshold (default 40).
 * Replaces the bugged inline filter: `|| 100 < 40` was always false.
 */
export const selectLowMoraleTalent = (state: GameState | null, threshold = 40): Talent[] => {
  return selectTalentPool(state).filter(t => (t.psychology?.mood ?? 100) < threshold);
};

/**
 * Projects eligible for awards consideration: released or post_release
 * within the last 52 weeks. Canonical definition.
 */
export const selectAwardsEligibleProjects = (state: GameState | null): Project[] => {
  const currentWeek = state?.week ?? 0;
  return selectProjects(state).filter(p =>
    (p.state === 'released' || p.state === 'post_release') &&
    p.releaseWeek !== null &&
    (p.releaseWeek ?? 0) > currentWeek - 52
  );
};
