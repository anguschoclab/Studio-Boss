import { createSelector } from 'reselect';
import { GameState, Project, RivalStudio, Talent, GameEvent } from '../engine/types';

const EMPTY_PROJECTS = {};
const EMPTY_FINANCE = { cash: 0, ledger: [] };
const EMPTY_MARKET = { buyers: [], opportunities: [], trends: [], activeMarketEvents: [] };
const EMPTY_TALENT_POOL = {};
const EMPTY_RIVALS: Record<string, RivalStudio> = {}; // Records in Phase 7
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
  [selectGameState],
  (state): Record<string, Project> => state?.entities?.projects || EMPTY_PROJECTS
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

export const selectCashFlowTrends = createSelector(
  [selectFinance, (_state, weeksPast: number = 12) => weeksPast],
  (finance, weeksPast) => {
    const history = (finance.weeklyHistory || []).slice(-weeksPast);
    return history.map(h => ({
      week: h.week,
      revenue: Object.values(h.revenue || {}).reduce((a, b) => a + (b || 0), 0),
      expenses: Object.values(h.expenses || {}).reduce((a, b) => a + (b || 0), 0),
      net: h.net
    }));
  }
);

export const selectRevenueBreakdown = createSelector(
  [selectFinance],
  (finance) => {
    const history = finance.weeklyHistory || [];
    const latest = history[history.length - 1];
    if (!latest || !latest.revenue) return [];
    return [
      { source: 'Theatrical', value: latest.revenue.theatrical || 0 },
      { source: 'Streaming', value: latest.revenue.streaming || 0 },
      { source: 'Merchandise', value: latest.revenue.merch || 0 },
      { source: 'Passive', value: latest.revenue.passive || 0 }
    ].filter(s => s.value > 0);
  }
);

export const selectWeeklyRevenueHistory = createSelector(
  [selectFinance],
  (finance) => (finance.weeklyHistory || []).map(h => h.net)
);

/**
 * Industry Selectors
 */
export const selectIndustry = createSelector(
  [selectGameState],
  (state): GameState['industry'] | null => state?.industry || null
);

export const selectRivalsRaw = createSelector(
  [selectGameState],
  (state): Record<string, RivalStudio> => state?.entities?.rivals || EMPTY_RIVALS
);

export const selectRivals = createSelector(
  [selectRivalsRaw],
  (rivals): RivalStudio[] => Object.values(rivals)
);

export const selectTalentPool = createSelector(
  [selectGameState],
  (state): Record<string, Talent> => state?.entities?.talents || EMPTY_TALENT_POOL
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

export const selectRecoupmentStatus = createSelector(
  [selectProjects],
  (projects) => projects.filter(p => p.state === 'released').map(p => ({
    title: p.title,
    recoupPercent: p.accumulatedCost > 0 ? (p.revenue / p.accumulatedCost) * 100 : 0,
    isRecouped: p.revenue >= (p.accumulatedCost * 1.2) // Profitable threshold
  }))
);

/**
 * The most recent weekly financial snapshot, or null if none recorded yet.
 * Consumed by chartSelectors.selectRevenueBreakdown.
 */
export const selectLatestSnapshot = (state: GameState | null) => {
  const history = state?.finance?.weeklyHistory ?? [];
  return history.length > 0 ? history[history.length - 1] : null;
};

/**
 * Map of released-project id -> recoup percentage (revenue / cost * 100).
 * The pre-refactor snapshot.projectRecoupment field no longer exists, so this
 * is derived directly from current project state.
 */
export const selectRecoupmentMap = (state: GameState | null): Record<string, number> => {
  const projects = Object.values(state?.entities?.projects ?? {});
  const map: Record<string, number> = {};
  for (const p of projects) {
    if (p.state === 'released' && (p.accumulatedCost ?? 0) > 0) {
      map[p.id] = ((p.revenue ?? 0) / p.accumulatedCost) * 100;
    }
  }
  return map;
};

/**
 * Macro market metrics for studio-health scoring. MarketState no longer carries
 * a sentiment/cycle signal, so sentiment defaults to 0 (neutral) until a real
 * sentiment source is wired; debtRate/savingsRate are the live values.
 */
export const selectMarketMetrics = (state: GameState | null) => {
  const m = state?.finance?.marketState;
  return {
    sentiment: 0,
    debtRate: m?.debtRate ?? 0,
    savingsRate: m?.savingsYield ?? 0,
  };
};

export const selectBudgetBurnData = (state: GameState, projectId: string) => {
  const project = state.entities.projects[projectId];
  if (!project) return null;
  return {
    projectTitle: project.title,
    budget: project.budget,
    accumulated: project.accumulatedCost,
    burnRate: project.budget > 0 ? (project.accumulatedCost / project.budget) * 100 : 0
  };
};

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

export const selectBoxOfficeData = createSelector(
  [selectReleasedProjects],
  (released) => released.filter(p => !!p.boxOffice).map(p => ({
    title: p.title,
    total: p.revenue,
    roi: p.accumulatedCost > 0 ? (p.revenue / p.accumulatedCost) * 100 : 0,
    opening: (p.boxOffice?.openingWeekendDomestic || 0) + (p.boxOffice?.openingWeekendForeign || 0)
  }))
);

export const selectProductionSlippage = createSelector(
  [selectProjects],
  (projects) => projects.filter(p => p.state === 'production' && p.weeksInPhase > p.productionWeeks).map(p => ({
    title: p.title,
    slippage: p.weeksInPhase - p.productionWeeks
  }))
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

export const selectProjectTimelineData = (state: GameState | null, weeksPast: number = 12) => {
  if (!state) return [];
  const projects = Object.values(state.entities.projects || {});
  const currentWeek = state.week;

  // For each week in the range, count projects in each state
  const data = [];
  for (let i = 0; i < weeksPast; i++) {
    const targetWeek = currentWeek - (weeksPast - 1) + i;
    data.push({
      week: targetWeek,
      development: projects.filter(p => p.state === 'development').length,
      preProduction: projects.filter(p => p.state === 'pre_production' || p.state === 'pre-production').length,
      production: projects.filter(p => p.state === 'production').length,
      postProduction: projects.filter(p => p.state === 'post_production' || p.state === 'post-production').length,
      released: projects.filter(p => p.releaseWeek === targetWeek).length,
    });
  }
  return data;
};

export const selectTalentSatisfaction = createSelector(
  [selectTalentPool],
  (talents) => {
    const list = Object.values(talents);
    if (list.length === 0) return { overallScore: 0, byCategory: [] };
    const avgMood = list.reduce((sum, t) => sum + (t.psychology?.mood || 0), 0) / list.length;
    return {
      overallScore: avgMood,
      byCategory: ['Actor', 'Director', 'Writer', 'Star'].map(cat => ({ category: cat, score: avgMood }))
    };
  }
);

export const selectTalentTierDistribution = createSelector(
  [selectTalentPool],
  (talents) => {
    const list = Object.values(talents);
    const distribution = [
      { tier: 'A-list', count: list.filter(t => t.tier === 1 || t.tier === 'A_LIST').length },
      { tier: 'B-list', count: list.filter(t => t.tier === 2 || t.tier === 'B_LIST').length },
      { tier: 'C-list', count: list.filter(t => t.tier === 3 || t.tier === 'C_LIST').length },
      { tier: 'D-list', count: list.filter(t => t.tier === 4 || t.tier === 'D_LIST').length },
    ];
    return { data: distribution, totalTalent: list.length };
  }
);

export const selectDealStats = createSelector(
  [selectOpportunities],
  (opps) => {
    const allBids = opps.flatMap(o => o.bidHistory || []);
    return {
      total: allBids.length,
      accepted: allBids.filter(b => b.rivalId === 'PLAYER').length,
      rejected: allBids.filter(b => b.rivalId !== 'PLAYER').length,
      pending: 0
    };
  }
);

export const selectStudioHealthMetrics = createSelector(
  [selectFinance, selectCash],
  (finance, cash) => {
    const latestBurn = finance.weeklyHistory?.slice(-1)[0]?.expenses?.burn || 0;
    const financeScore = latestBurn > 0 ? Math.min(100, (cash / (latestBurn * 10)) * 100) : 100;
    return [
      { metric: 'Finances', score: financeScore },
      { metric: 'Talent', score: 80 },
      { metric: 'IP', score: 70 },
      { metric: 'Market', score: 60 },
      { metric: 'Production', score: 50 },
      { metric: 'Culture', score: 90 }
    ];
  }
);

export const selectCrisisRiskLevel = createSelector(
  [selectProjects],
  (projects) => {
    const activeCrises = projects.filter(p => !!p.activeCrisis && !p.activeCrisis.resolved);
    const overBudgetCount = projects.filter(p => p.accumulatedCost > p.budget).length;
    return {
      riskLevel: activeCrises.length * 30 + overBudgetCount * 10,
      activeThreats: activeCrises.map(p => ({ title: p.title, threat: p.activeCrisis!.description }))
    };
  }
);

export const selectAwardsProbability = createSelector(
  [selectProjects],
  (projects) => projects.filter(p => !!p.awardsProfile).map(p => {
    const ap = p.awardsProfile!;
    return {
      projectTitle: p.title,
      probability: Math.min(100, Math.round(((ap.criticScore + ap.academyAppeal) / 2) + 5))
    };
  })
);

export const selectGenrePerformanceMatrix = createSelector(
  [selectMarketTrends, selectProjects],
  (trends, projects) => {
    return trends.map(t => {
      const genreProjects = projects.filter(p => p.genre === t.genre);
      return {
        genre: t.genre,
        heat: t.heat,
        roi: genreProjects.length > 0 ? genreProjects.reduce((sum, p) => sum + (p.revenue / p.accumulatedCost), 0) / genreProjects.length : 0
      };
    });
  }
);
