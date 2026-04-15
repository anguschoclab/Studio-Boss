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
export const selectInternal = (state: GameState | null) => state?.studio?.internal || null;
export const selectProjectsRaw = (state: GameState | null) => state?.entities?.projects || EMPTY_PROJECTS;

let _lastProjectsRaw: Record<string, Project> | null = null;
let _lastProjectsArray: Project[] = [];
export const selectProjects = (state: GameState | null): Project[] => {
  const projects = selectProjectsRaw(state);
  if (projects !== _lastProjectsRaw) {
    _lastProjectsRaw = projects;
    _lastProjectsArray = [];
    for (const key in projects) {
      if (Object.prototype.hasOwnProperty.call(projects, key)) {
        _lastProjectsArray.push(projects[key]);
      }
    }
  }
  return _lastProjectsArray;
};

export const selectFinance = (state: GameState | null) => state?.finance || EMPTY_FINANCE;
export const selectCash = (state: GameState | null) => selectFinance(state).cash || 0;

export const selectIndustry = (state: GameState | null) => state?.industry || null;
export const selectRivalsRaw = (state: GameState | null) => state?.entities?.rivals || EMPTY_RIVALS;

let _lastRivalsRaw: Record<string, RivalStudio> | null = null;
let _lastRivalsArray: RivalStudio[] = [];
export const selectRivals = (state: GameState | null): RivalStudio[] => {
  const rivals = selectRivalsRaw(state);
  if (rivals !== _lastRivalsRaw) {
    _lastRivalsRaw = rivals;
    _lastRivalsArray = [];
    for (const key in rivals) {
      if (Object.prototype.hasOwnProperty.call(rivals, key)) {
        _lastRivalsArray.push(rivals[key]);
      }
    }
  }
  return _lastRivalsArray;
};

export const selectTalentPoolRaw = (state: GameState | null) => state?.entities?.talents || EMPTY_TALENT_POOL;

let _lastTalentPoolRaw: Record<string, Talent> | null = null;
let _lastTalentPoolArray: Talent[] = [];
export const selectTalentPool = (state: GameState | null): Talent[] => {
  const talents = selectTalentPoolRaw(state);
  if (talents !== _lastTalentPoolRaw) {
    _lastTalentPoolRaw = talents;
    _lastTalentPoolArray = [];
    for (const key in talents) {
      if (Object.prototype.hasOwnProperty.call(talents, key)) {
        _lastTalentPoolArray.push(talents[key]);
      }
    }
  }
  return _lastTalentPoolArray;
};

let _lastActiveProjectsRaw: Record<string, Project> | null = null;
let _lastActiveProjectsArray: Project[] = [];
export const selectActiveProjects = (state: GameState | null): Project[] => {
  const projects = selectProjectsRaw(state);
  if (projects !== _lastActiveProjectsRaw) {
    _lastActiveProjectsRaw = projects;
    _lastActiveProjectsArray = [];
    for (const key in projects) {
      if (Object.prototype.hasOwnProperty.call(projects, key)) {
        const p = projects[key];
        if (p.state !== 'released' && p.state !== 'archived' && p.state !== 'post_release') {
          _lastActiveProjectsArray.push(p);
        }
      }
    }
  }
  return _lastActiveProjectsArray;
};

let _lastReleasedProjectsRaw: Record<string, Project> | null = null;
let _lastReleasedProjectsArray: Project[] = [];
export const selectReleasedProjects = (state: GameState | null): Project[] => {
  const projects = selectProjectsRaw(state);
  if (projects !== _lastReleasedProjectsRaw) {
    _lastReleasedProjectsRaw = projects;
    _lastReleasedProjectsArray = [];
    for (const key in projects) {
      if (Object.prototype.hasOwnProperty.call(projects, key)) {
        const p = projects[key];
        if (p.state === 'released' || p.state === 'post_release' || p.state === 'archived') {
          _lastReleasedProjectsArray.push(p);
        }
      }
    }
  }
  return _lastReleasedProjectsArray;
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
  const result: Talent[] = [];
  const pool = state.entities.talents || EMPTY_TALENT_POOL;
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

// ============================================================================
// VISUALIZATION SELECTORS - Phase 1: Financial Core
// ============================================================================

/**
 * Cash flow trends over time for CashFlowChart visualization
 * Aggregates revenue and expenses from weekly financial snapshots
 */
export const selectCashFlowTrends = (state: GameState | null, weeks: number = 12) => {
  const history = selectFinance(state).weeklyHistory || [];
  return history.slice(-weeks).map(snapshot => {
    let totalExpenses = 0;
    for (const key in snapshot.expenses) {
      if (Object.prototype.hasOwnProperty.call(snapshot.expenses, key)) {
        totalExpenses += snapshot.expenses[key as keyof typeof snapshot.expenses];
      }
    }
    return {
      week: snapshot.week,
      revenue: snapshot.revenue.theatrical + snapshot.revenue.streaming +
                snapshot.revenue.merch + snapshot.revenue.passive,
      expenses: totalExpenses,
      net: snapshot.net
    };
  });
};

/**
 * Revenue breakdown by source for RevenueBreakdown visualization
 */
export const selectRevenueBreakdown = (state: GameState | null) => {
  const snapshot = selectLatestSnapshot(state);
  if (!snapshot) return [];
  
  return [
    { name: 'Theatrical', value: snapshot.revenue.theatrical, color: '#3b82f6' },
    { name: 'Streaming', value: snapshot.revenue.streaming, color: '#10b981' },
    { name: 'Merchandise', value: snapshot.revenue.merch, color: '#f59e0b' },
    { name: 'Passive', value: snapshot.revenue.passive, color: '#8b5cf6' },
  ].filter(item => item.value > 0);
};

/**
 * Weekly revenue history for WeeklyRevenueSpark visualization
 */
export const selectWeeklyRevenueHistory = (state: GameState | null, weeks: number = 12) => {
  const history = selectFinance(state).weeklyHistory || [];
  return history.slice(-weeks).map(h => h.net);
};

/**
 * Budget burn rate for a specific project for BudgetBurnRate visualization
 */
export const selectBudgetBurnData = (state: GameState | null, projectId: string) => {
  const project = selectProjectsRaw(state)[projectId];
  if (!project) return null;
  
  const weeksInProduction = project.productionWeeks || 0;
  const weeklyHistory = selectFinance(state).weeklyHistory || [];
  
  // Calculate weekly burn from financial snapshots
  return weeklyHistory
    .filter(h => h.projectRecoupment?.[projectId] !== undefined)
    .map(h => ({
      week: h.week,
      planned: project.budget / Math.max(weeksInProduction, 1),
      actual: h.expenses.production / Math.max(weeksInProduction, 1),
      remaining: project.budget - (project.accumulatedCost || 0)
    }));
};

/**
 * Recoupment status for all projects for RecoupmentStatus visualization
 */
export const selectRecoupmentStatus = (state: GameState | null) => {
  const projects = selectProjects(state);
  const recoupmentMap = selectRecoupmentMap(state);
  
  return projects.map(project => {
    const recouped = recoupmentMap[project.id] || 0;
    const percentage = project.budget > 0 ? (recouped / project.budget) * 100 : 0;
    
    return {
      title: project.title,
      recouped: percentage,
      revenue: recouped,
      budget: project.budget,
      status: percentage >= 120 ? 'profitable' : 
              percentage >= 100 ? 'recouped' : 
              percentage >= 50 ? 'in_progress' : 'at_risk'
    };
  });
};

// ============================================================================
// VISUALIZATION SELECTORS - Phase 2: Project Status
// ============================================================================

/**
 * Project timeline data for ProjectTimeline visualization
 * Shows project counts by state over time
 */
export const selectProjectTimelineData = (state: GameState | null, weeks: number = 12) => {
  const projects = selectProjects(state);
  const currentWeek = state?.week || 1;
  
  return Array.from({ length: weeks }, (_, i) => {
    const week = currentWeek - weeks + i + 1;
    
    return {
      week: `W${week}`,
      development: projects.filter(p => p.state === 'development').length,
      preProduction: projects.filter(p => p.state === 'pitching').length,
      production: projects.filter(p => p.state === 'production').length,
      postProduction: projects.filter(p => p.state === 'post_release').length,
      release: projects.filter(p => p.state === 'released' && p.releaseWeek === week).length,
    };
  });
};

/**
 * Box office data for BoxOfficePerformance visualization
 */
export const selectBoxOfficeData = (state: GameState | null) => {
  const releasedProjects = selectReleasedProjects(state);
  
  return releasedProjects
    .filter(p => p.boxOffice || p.revenue > 0)
    .map(project => {
      const boxOffice = project.boxOffice || { openingWeekendDomestic: 0, totalDomestic: 0 };
      const totalGross = boxOffice.totalDomestic || project.revenue || 0;
      
      // Determine trend
      let trend: 'blockbuster' | 'hit' | 'average' | 'flop' | 'bomb';
      const opening = boxOffice.openingWeekendDomestic || 0;
      if (opening > 50000000) trend = 'blockbuster';
      else if (opening > 20000000) trend = 'hit';
      else if (opening > 10000000) trend = 'average';
      else if (opening > 5000000) trend = 'flop';
      else trend = 'bomb';
      
      return {
        projectTitle: project.title,
        openingWeekend: opening,
        totalGross,
        perTheater: opening > 0 ? opening / 3000 : 0, // Estimate: 3000 theaters average
        trend
      };
    })
    .sort((a, b) => b.totalGross - a.totalGross);
};

/**
 * Production slippage data for ProductionSlippageIndicator visualization
 */
export const selectProductionSlippage = (state: GameState | null) => {
  const projects = selectActiveProjects(state);
  
  return projects
    .filter(p => p.estimatedWindow && p.state !== 'released')
    .map(project => {
      const originalEnd = project.estimatedWindow?.endWeek || 0;
      const currentEnd = originalEnd + (project.weeksInPhase || 0);
      const weeksSlipped = Math.max(0, currentEnd - originalEnd);
      
      return {
        projectName: project.title,
        originalEndWeek: originalEnd,
        currentEndWeek: currentEnd,
        weeksSlipped,
        reason: project.activeCrisis ? project.activeCrisis.description : 'Schedule variance'
      };
    })
    .filter(p => p.weeksSlipped > 0);
};

/**
 * Script quality metrics for ScriptQualityMetrics visualization
 * Derived from scriptHeat and scriptEvents
 */
export const selectScriptQualityMetrics = (state: GameState | null, projectId: string) => {
  const project = selectProjectsRaw(state)[projectId];
  if (!project || !('scriptHeat' in project)) return null;
  
  const scripted = project as any; // Type assertion for ScriptedProject
  
  // Use real scriptMetrics if available
  if (scripted.scriptMetrics) {
    const metrics = scripted.scriptMetrics;
    return [
      { metric: 'Structure', value: metrics.structure, fullMark: 100 },
      { metric: 'Dialogue', value: metrics.dialogue, fullMark: 100 },
      { metric: 'Originality', value: metrics.originality, fullMark: 100 },
      { metric: 'Pacing', value: metrics.pacing, fullMark: 100 },
      { metric: 'Emotional Impact', value: metrics.emotionalImpact, fullMark: 100 },
      { metric: 'Commercial Viability', value: metrics.commercialViability, fullMark: 100 },
    ];
  }
  
  // Fallback to derived calculation if metrics not yet calculated
  const scriptHeat = scripted.scriptHeat || 50;
  const events = scripted.scriptEvents || [];
  
  const structure = Math.min(100, events.filter((e: any) => e.type === 'ARCHETYPE_CHANGE').length * 15 + 50);
  const dialogue = Math.min(100, events.filter((e: any) => e.type === 'DIALOGUE_POLISH').reduce((sum: number, e: any) => sum + (e.qualityImpact || 0), 0) + 50);
  const originality = Math.min(100, events.filter((e: any) => e.type === 'PLOT_TWIST_ADDED').length * 20 + 40);
  const pacing = Math.min(100, events.length * 5 + 40);
  const emotionalImpact = scriptHeat;
  const commercialViability = Math.round((scriptHeat + structure) / 2);
  
  return [
    { metric: 'Structure', value: structure, fullMark: 100 },
    { metric: 'Dialogue', value: dialogue, fullMark: 100 },
    { metric: 'Originality', value: originality, fullMark: 100 },
    { metric: 'Pacing', value: pacing, fullMark: 100 },
    { metric: 'Emotional Impact', value: emotionalImpact, fullMark: 100 },
    { metric: 'Commercial Viability', value: commercialViability, fullMark: 100 },
  ];
};

// ============================================================================
// VISUALIZATION SELECTORS - Phase 3: Market Intelligence
// ============================================================================

/**
 * Genre performance matrix for GenrePerformanceMatrix visualization
 */
export const selectGenrePerformanceMatrix = (state: GameState | null) => {
  const trends = selectMarketTrends(state);
  const projects = selectReleasedProjects(state);
  
  // Get unique genres from trends
  const genres = [...new Set(trends.map(t => t.genre))];
  const metrics = ['ROI', 'Audience', 'Critical', 'Commercial'];
  
  return genres.flatMap(genre => {
    const genreProjects = projects.filter(p => p.genre === genre);
    const avgROI = genreProjects.length > 0
      ? genreProjects.reduce((sum, p) => sum + ((p.revenue || 0) / Math.max(p.budget || 1, 1)), 0) / genreProjects.length
      : 0;
    
    return metrics.map(metric => ({
      genre,
      metric,
      value: calculateGenreMetric(genreProjects, metric, avgROI)
    }));
  });
};

function calculateGenreMetric(projects: Project[], metric: string, roi: number): number {
  switch (metric) {
    case 'ROI': return Math.round((roi - 1) * 100);
    case 'Audience': return Math.round(projects.reduce((sum, p) => sum + (p.reception?.audienceScore || 0), 0) / Math.max(projects.length, 1));
    case 'Critical': return Math.round(projects.reduce((sum, p) => sum + (p.reception?.metaScore || 0), 0) / Math.max(projects.length, 1));
    case 'Commercial': return Math.round(projects.reduce((sum, p) => sum + ((p.boxOffice as any)?.totalDomestic || 0), 0) / 1000000);
    default: return 0;
  }
}

/**
 * Market share data for MarketShareComparison visualization
 * Derived from rival market share and studio prestige
 */
export const selectMarketShareData = (state: GameState | null) => {
  const rivals = selectRivals(state);
  const myProjects = selectReleasedProjects(state);
  const myRevenue = myProjects.reduce((sum, p) => sum + (p.revenue || 0), 0);
  
  // Use real annualRevenue if available
  const rivalRevenues = rivals.map(r => ({
    name: r.name,
    share: 0,
    revenue: r.annualRevenue || r.boxOfficeTotal || Math.random() * 500000000 // Fallback
  }));
  
  const totalRevenue = myRevenue + rivalRevenues.reduce((sum, r) => sum + r.revenue, 0);
  
  return [
    { name: 'Your Studio', share: totalRevenue > 0 ? (myRevenue / totalRevenue) * 100 : 0, isPlayer: true },
    ...rivalRevenues.map(r => ({
      name: r.name,
      share: totalRevenue > 0 ? (r.revenue / totalRevenue) * 100 : 0,
      isPlayer: false
    }))
  ].sort((a, b) => b.share - a.share);
};

/**
 * Streaming viewership data for StreamingViewershipChart visualization
 * Derived from project revenue and streaming distribution
 */
export const selectStreamingViewership = (state: GameState | null, platformName: string) => {
  const projects = selectProjects(state).filter(p => 
    p.distributionStatus === 'streaming' && p.buyerId === platformName
  );
  
  // If projects have real viewership data, use it
  if (projects.some(p => p.streamingViewership && p.streamingViewership.length > 0)) {
    return projects.flatMap(p => {
      const history = p.streamingViewership?.find(v => v.platform === platformName);
      if (!history) return [];
      
      return history.entries.map(entry => ({
        week: entry.week,
        hoursWatched: entry.hoursWatched,
        uniqueViewers: entry.uniqueViewers,
        completionRate: entry.completionRate
      }));
    }).sort((a, b) => a.week - b.week);
  }
  
  // Fallback to estimated data (existing logic)
  return projects.map(p => ({
    week: p.releaseWeek || 1,
    hoursWatched: (p.revenue || 0) / 0.01,
    uniqueViewers: Math.floor((p.revenue || 0) / 5),
    completionRate: p.reception?.audienceScore || 50
  }));
};

// ============================================================================
// VISUALIZATION SELECTORS - Phase 4: Talent Management
// ============================================================================

/**
 * Talent satisfaction data for TalentSatisfactionGauge visualization
 * Uses existing psychology.mood field as morale
 */
export const selectTalentSatisfaction = (state: GameState | null) => {
  const talents = selectTalentPool(state);
  if (talents.length === 0) return { overallScore: 0, byCategory: [] };
  
  const scores = talents.map(t => ({
    id: t.id,
    score: t.psychology.mood || 70, // Uses existing psychology.mood field
    tier: t.tier
  }));
  
  const overallScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  const byCategory = [1, 2, 3, 4].map(tier => ({
    category: tier === 1 ? 'A-list' : tier === 2 ? 'B-list' : tier === 3 ? 'C-list' : 'Emerging',
    score: scores.filter(s => s.tier === tier).length > 0 
      ? scores.filter(s => s.tier === tier).reduce((sum, s) => sum + s.score, 0) / scores.filter(s => s.tier === tier).length
      : 50
  }));
  
  return { overallScore: Math.round(overallScore), byCategory };
};

/**
 * Talent tier distribution for TalentTierDistribution visualization
 */
export const selectTalentTierDistribution = (state: GameState | null) => {
  const talents = selectTalentPool(state);
  
  const tierNames: Record<number, string> = { 1: 'A-list', 2: 'B-list', 3: 'C-list', 4: 'Emerging' };
  
  const byTier = [1, 2, 3, 4].map(tier => {
    const tierTalents = talents.filter(t => t.tier === tier);
    const avgSalary = tierTalents.length > 0
      ? tierTalents.reduce((sum, t) => sum + (t.fee || 0), 0) / tierTalents.length
      : 0;
    
    return {
      tier: tierNames[tier],
      count: tierTalents.length,
      avgSalary
    };
  });
  
  return {
    data: byTier,
    totalTalent: talents.length
  };
};

/**
 * Deal statistics for DealSuccessRate visualization
 */
export const selectDealStats = (state: GameState | null) => {
  const opportunities = selectOpportunities(state);
  const bids = opportunities.filter(o => Object.keys(o.bids || {}).length > 0);
  
  // Calculate from bid history
  const totalDeals = opportunities.reduce((sum, o) => sum + (o.bidHistory?.length || 0), 0);
  const accepted = opportunities.reduce((sum, o) => {
    return sum + (o.bidHistory?.filter(b => b.rivalId === 'PLAYER').length || 0);
  }, 0);
  const rejected = totalDeals - accepted;
  
  return {
    total: totalDeals,
    accepted,
    rejected,
    pending: bids.length,
    avgNegotiationWeeks: totalDeals > 0 ? 2 : 0 // Simplified - would need actual duration tracking
  };
};

// ============================================================================
// VISUALIZATION SELECTORS - Phase 5: Studio Health & Crisis
// ============================================================================

/**
 * Studio health metrics for StudioHealthRadar visualization
 * Complex aggregation of multiple data sources
 */
export const selectStudioHealthMetrics = (state: GameState | null) => {
  const finance = selectFinance(state);
  const projects = selectProjects(state);
  const talents = selectTalentPool(state);
  const studio = selectStudio(state);
  const marketMetrics = selectMarketMetrics(state);
  
  // Finances score: based on cash position vs burn rate
  const cash = finance.cash || 0;
  const monthlyBurn = finance.weeklyHistory?.slice(-4).reduce((sum, h) => sum + h.expenses.burn, 0) || 0;
  const financeScore = Math.min(100, Math.max(0, (cash / Math.max(monthlyBurn, 1)) * 20));
  
  // Talent score: based on average mood (psychology.mood)
  const talentScores = talents.map(t => t.psychology.mood || 70);
  const talentScore = talentScores.length > 0 
    ? talentScores.reduce((sum, t) => sum + t, 0) / talentScores.length 
    : 70;
  
  // Projects score: based on on-time, on-budget percentage
  const activeProjects = projects.filter(p => p.state !== 'released' && p.state !== 'archived');
  const onTrackProjects = activeProjects.filter(p => {
    const onTime = (p.progress || 0) >= ((p.weeksInPhase || 0) / Math.max(p.productionWeeks || 1, 1)) * 100;
    const onBudget = (p.accumulatedCost || 0) <= (p.budget || 0) * 1.1;
    return onTime && onBudget;
  });
  const projectScore = activeProjects.length > 0 ? (onTrackProjects.length / activeProjects.length) * 100 : 70;
  
  // Reputation: studio prestige
  const reputationScore = studio?.prestige || 50;
  
  // Market: based on trend alignment
  const marketScore = 50 + (marketMetrics.sentiment || 0) / 2;
  
  // Operations: based on crisis count
  const crisisCount = projects.filter(p => p.activeCrisis && !p.activeCrisis.resolved).length;
  const operationsScore = Math.max(0, 100 - (crisisCount * 15));
  
  return [
    { metric: 'Finances', score: Math.round(financeScore), fullMark: 100 },
    { metric: 'Talent', score: Math.round(talentScore), fullMark: 100 },
    { metric: 'Projects', score: Math.round(projectScore), fullMark: 100 },
    { metric: 'Reputation', score: Math.round(reputationScore), fullMark: 100 },
    { metric: 'Market', score: Math.round(marketScore), fullMark: 100 },
    { metric: 'Operations', score: Math.round(operationsScore), fullMark: 100 },
  ];
};

/**
 * Crisis risk level for CrisisRiskMeter visualization
 */
export const selectActiveCrisisCount = (state: GameState | null) => {
  const projects = selectProjects(state);
  return projects.filter(p => p.activeCrisis && !p.activeCrisis.resolved).length;
};

export const selectCrisisRiskLevel = (state: GameState | null) => {
  const projects = selectProjects(state);
  const talents = selectTalentPool(state);
  
  const crisisCount = projects.filter(p => p.activeCrisis && !p.activeCrisis.resolved).length;
  const overBudget = projects.filter(p => 
    (p.accumulatedCost || 0) > (p.budget || 0) * 1.1
  ).length;
  const lowMorale = talents.filter(t => t.psychology.mood < 40).length;
  
  // Calculate risk level 0-100
  const riskScore = Math.min(100, 
    (crisisCount * 15) + 
    (overBudget * 10) + 
    (lowMorale * 5)
  );
  
  return {
    riskLevel: riskScore,
    activeThreats: [
      ...(crisisCount > 0 ? [`${crisisCount} production crises`] : []),
      ...(overBudget > 0 ? [`${overBudget} budget overruns`] : []),
      ...(lowMorale > 0 ? [`${lowMorale} talent issues`] : []),
    ]
  };
};

// ============================================================================
// VISUALIZATION SELECTORS - Phase 6: Awards
// ============================================================================

/**
 * Awards probability data for AwardsProbabilityChart visualization
 */
export const selectAwardsProbability = (state: GameState | null) => {
  const projects = selectProjects(state).filter(p => p.awardsProfile || (p.awards && p.awards.length > 0));
  
  return projects.flatMap(project => {
    const profiles = project.awardsProfile ? [project.awardsProfile] : [];
    
    return profiles.map(profile => ({
      projectTitle: project.title,
      awardBody: 'Academy Awards', // Default, would need to track per-award-body profiles
      category: profile.craftScore > 80 ? 'Best Picture' : 'Supporting',
      probability: profile.craftScore || 50,
      trend: 'stable'
    }));
  });
};
