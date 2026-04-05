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
const EMPTY_RIVALS: RivalStudio[] = [];
const EMPTY_EVENT_HISTORY: GameEvent[] = [];
const EMPTY_ARRAY: any[] = [];
const DEFAULT_MARKET_METRICS = { cycle: 'STABLE', sentiment: 0, debtRate: 0.08, savingsRate: 0.02 };

const EMPTY_FINANCE: FinanceState = {
  cash: 0, 
  ledger: [], 
  weeklyHistory: [], 
  marketState: { 
    cycle: 'STABLE', 
    sentiment: 0, 
    baseRate: 0.05, 
    debtRate: 0.08, 
    savingsYield: 0.02,
    loanRate: 0.07,
    rateHistory: [{ week: 1, rate: 0.05 }]
  } as MarketState
};

export const selectGameState = (state: GameState | null): GameState | null => state;

export const selectStudio = (state: GameState | null) => state?.studio || null;
export const selectInternal = (state: GameState | null) => state?.studio.internal || null;
export const selectProjectsRaw = (state: GameState | null) => state?.studio.internal.projects || EMPTY_PROJECTS;

export const selectProjects = (state: GameState | null): Project[] => {
  const projects = selectProjectsRaw(state);
  return Object.values(projects);
};

export const selectFinance = (state: GameState | null) => state?.finance || EMPTY_FINANCE;
export const selectCash = (state: GameState | null) => selectFinance(state).cash || 0;

export const selectIndustry = (state: GameState | null) => state?.industry || null;
export const selectRivals = (state: GameState | null) => selectIndustry(state)?.rivals || EMPTY_RIVALS;
export const selectTalentPool = (state: GameState | null) => selectIndustry(state)?.talentPool || EMPTY_TALENT_POOL;

export const selectActiveProjects = (state: GameState | null) => {
  const projects = selectProjectsRaw(state);
  const arr: Project[] = [];
  for (const key in projects) {
    const p = projects[key];
    if (p.state !== 'released' && p.state !== 'archived' && p.state !== 'post_release') {
      arr.push(p);
    }
  }
  return arr;
};

export const selectReleasedProjects = (state: GameState | null) => {
  const projects = selectProjectsRaw(state);
  const arr: Project[] = [];
  for (const key in projects) {
    const p = projects[key];
    if (p.state === 'released' || p.state === 'post_release' || p.state === 'archived') {
      arr.push(p);
    }
  }
  return arr;
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
  if (!state) return EMPTY_ARRAY;
  const result: Talent[] = [];
  const pool = state.industry.talentPool;
  for (const key in pool) {
    const t = pool[key];
    if (filter.roles && !filter.roles.some(r => t.roles?.includes(r) || t.role === r)) continue;
    if (filter.minTier && TIER_RANK[t.tier] < TIER_RANK[filter.minTier]) continue;
    if (filter.excludeOnMedicalLeave && t.onMedicalLeave) continue;
    if (filter.excludeHoldingDeals) {
      const hasHold = t.commitments?.some(c => c.isHoldingDeal);
      if (hasHold) continue;
    }
    if (filter.availableAtWeek !== undefined) {
      const busy = t.commitments?.some(c =>
        !c.isHoldingDeal &&
        c.startWeek <= filter.availableAtWeek! &&
        c.endWeek >= filter.availableAtWeek!
      );
      if (busy) continue;
    }
    if (filter.genres?.length && t.preferredGenres?.length) {
      const overlap = filter.genres.some(g => t.preferredGenres.includes(g));
      if (!overlap) continue;
    }
    result.push(t);
  }
  return result;
};
