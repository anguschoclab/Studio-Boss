/**
 * Chart & Visualization Selectors
 *
 * All selectors that exclusively feed visualization components are here.
 * Base game-state selectors (entities, finance, talent) remain in selectors.ts.
 * Import from this file in visualization components; selectors.ts re-exports these
 * for backward compatibility.
 */

import { GameState } from '../engine/types';
import {
  selectFinance,
  selectLatestSnapshot,
  selectRecoupmentMap,
  selectProjects,
  selectProjectsRaw,
  selectActiveProjects,
  selectReleasedProjects,
  selectRivals,
  selectTalentPool,
  selectMarketTrends,
  selectMarketMetrics,
  selectOpportunities,
  selectStudio,
} from './selectors';

// ============================================================================
// VISUALIZATION SELECTORS - Phase 1: Finance
// ============================================================================

/**
 * Cash flow trends over time for CashFlowChart visualization
 * Aggregates revenue and expenses from weekly financial snapshots
 */
export const selectCashFlowTrends = (state: GameState | null, weeks: number = 12) => {
  const history = selectFinance(state).weeklyHistory || [];
  return history.slice(-weeks).map(snapshot => {
    const totalExpenses = Object.values(snapshot.expenses).reduce((sum, val) => sum + val, 0);
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
    { source: 'Theatrical', value: snapshot.revenue.theatrical },
    { source: 'Streaming', value: snapshot.revenue.streaming },
    { source: 'Merch', value: snapshot.revenue.merch },
    { source: 'Passive', value: snapshot.revenue.passive },
  ].filter(r => r.value > 0);
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
  const weeklyBurn = project.weeklyCost || 0;
  const accumulated = project.accumulatedCost || 0;
  const budget = project.budget || 1;
  const burnRate = (accumulated / budget) * 100;
  return {
    projectTitle: project.title,
    budget,
    accumulated,
    weeklyBurn,
    burnRate: Math.round(burnRate),
    weeksRemaining: weeklyBurn > 0 ? Math.round((budget - accumulated) / weeklyBurn) : null,
    isOverBudget: accumulated > budget
  };
};

/**
 * Recoupment status for all projects for RecoupmentStatus visualization
 */
export const selectRecoupmentStatus = (state: GameState | null) => {
  const projects = selectProjects(state);
  const recoupmentMap = selectRecoupmentMap(state);
  return projects
    .filter(p => p.state === 'released' || p.state === 'post_release' || p.state === 'archived')
    .map(p => {
      const recoupment = recoupmentMap[p.id];
      const revenue = p.revenue || 0;
      const budget = p.budget || 1;
      const recoupPercent = Math.round((revenue / budget) * 100);
      return {
        title: p.title,
        budget,
        revenue,
        recoupPercent,
        isRecouped: revenue >= budget,
        weeksSinceRelease: recoupment ? (state?.week || 0) - (p.releaseWeek || 0) : null,
      };
    });
};

/**
 * Project timeline data for ProjectTimeline visualization
 */
export const selectProjectTimelineData = (state: GameState | null, weeks: number = 12) => {
  const projects = selectProjects(state);
  const currentWeek = state?.week || 1;
  const startWeek = currentWeek - weeks;
  return Array.from({ length: weeks }, (_, i) => {
    const week = startWeek + i;
    return {
      week,
      development: projects.filter(p => p.state === 'development' && (p.estimatedWindow?.startWeek || 0) <= week).length,
      production: projects.filter(p => p.state === 'production').length,
      released: projects.filter(p => p.releaseWeek === week).length,
    };
  });
};

// ============================================================================
// VISUALIZATION SELECTORS - Phase 2: Box Office & Market
// ============================================================================

/**
 * Box office data for BoxOfficePerformance visualization
 */
export const selectBoxOfficeData = (state: GameState | null) => {
  const releasedProjects = selectReleasedProjects(state);
  return releasedProjects
    .filter(p => p.boxOffice || p.revenue > 0)
    .map(p => ({
      title: p.title,
      budget: p.budget || 0,
      domestic: p.boxOffice?.totalDomestic || Math.round((p.revenue || 0) * 0.6),
      international: p.boxOffice?.openingWeekendForeign || Math.round((p.revenue || 0) * 0.4),
      total: p.revenue || 0,
      roi: p.budget ? Math.round(((p.revenue || 0) / p.budget) * 100) : 0,
      releaseWeek: p.releaseWeek || 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
};

/**
 * Production slippage data for ProductionSlippageIndicator visualization
 */
export const selectProductionSlippage = (state: GameState | null) => {
  const projects = selectActiveProjects(state);
  return projects
    .filter(p => p.state === 'production')
    .map(p => {
      const expectedProgress = p.productionWeeks
        ? Math.min(100, ((p.weeksInPhase || 0) / p.productionWeeks) * 100)
        : 50;
      const actualProgress = p.progress || 0;
      const slippage = Math.max(0, expectedProgress - actualProgress);
      return {
        title: p.title,
        expectedProgress: Math.round(expectedProgress),
        actualProgress: Math.round(actualProgress),
        slippage: Math.round(slippage),
        isSlipping: slippage > 10,
      };
    });
};

/**
 * Script quality metrics for ScriptQualityMetrics visualization
 */
export const selectScriptQualityMetrics = (state: GameState | null, projectId: string) => {
  const project = selectProjectsRaw(state)[projectId];
  if (!project || !('scriptHeat' in project)) return null;
  const p = project as any;
  return {
    projectTitle: project.title,
    scriptHeat: p.scriptHeat || 50,
    draftCount: p.scriptEvents?.filter((e: any) => e.type === 'DRAFT_COMPLETED').length || 0,
    lastRevisionWeek: p.scriptEvents?.slice(-1)[0]?.week || null,
    issues: p.scriptEvents?.filter((e: any) => e.type === 'ISSUE').length || 0,
  };
};

/**
 * Genre performance matrix for GenrePerformanceMatrix visualization
 */
export const selectGenrePerformanceMatrix = (state: GameState | null) => {
  const trends = selectMarketTrends(state);
  const projects = selectReleasedProjects(state);
  const genres = [...new Set(trends.map(t => t.genre))];
  return genres.map(genre => {
    const genreProjects = projects.filter(p => p.genre === genre);
    const avgRevenue = genreProjects.length > 0
      ? genreProjects.reduce((sum, p) => sum + (p.revenue || 0), 0) / genreProjects.length
      : 0;
    const trend = trends.find(t => t.genre === genre);
    return {
      genre,
      avgRevenue: Math.round(avgRevenue),
      projectCount: genreProjects.length,
      marketTrend: trend?.heat || 0,
      isHot: trend?.direction === 'hot' || trend?.direction === 'rising',
    };
  });
};

/**
 * Market share data for MarketShareComparison visualization
 */
export const selectMarketShareData = (state: GameState | null) => {
  const rivals = selectRivals(state);
  const myProjects = selectReleasedProjects(state);
  const myRevenue = myProjects.reduce((sum, p) => sum + (p.revenue || 0), 0);
  const rivalRevenues = rivals.map(r => ({
    name: r.name,
    revenue: r.annualRevenue || r.boxOfficeTotal || 0
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
 */
export const selectStreamingViewership = (state: GameState | null, platformName: string) => {
  const projects = selectProjects(state).filter(p =>
    p.distributionStatus === 'streaming' && p.buyerId === platformName
  );
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
  return projects.map(p => ({
    week: p.releaseWeek || 1,
    hoursWatched: (p.revenue || 0) / 0.01,
    uniqueViewers: Math.floor((p.revenue || 0) / 5),
    completionRate: p.reception?.audienceScore || 50
  }));
};

// ============================================================================
// VISUALIZATION SELECTORS - Phase 3: Talent
// ============================================================================

/**
 * Talent satisfaction data for TalentSatisfactionGauge visualization
 */
export const selectTalentSatisfaction = (state: GameState | null) => {
  const talents = selectTalentPool(state);
  if (talents.length === 0) return { overallScore: 0, byCategory: [] };
  const scores = talents.map(t => ({ id: t.id, score: t.psychology.mood || 70, tier: t.tier }));
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
    return { tier: tierNames[tier], count: tierTalents.length, avgSalary };
  });
  return { data: byTier, totalTalent: talents.length };
};

/**
 * Deal statistics for DealSuccessRate visualization
 */
export const selectDealStats = (state: GameState | null) => {
  const opportunities = selectOpportunities(state);
  const bids = opportunities.filter(o => Object.keys(o.bids || {}).length > 0);
  const totalDeals = opportunities.reduce((sum, o) => sum + (o.bidHistory?.length || 0), 0);
  const accepted = opportunities.reduce((sum, o) => {
    return sum + (o.bidHistory?.filter(b => b.rivalId === 'PLAYER').length || 0);
  }, 0);
  return {
    total: totalDeals,
    accepted,
    rejected: totalDeals - accepted,
    pending: bids.length,
    avgNegotiationWeeks: totalDeals > 0 ? 2 : 0
  };
};

// ============================================================================
// VISUALIZATION SELECTORS - Phase 4: Studio Health & Crisis
// ============================================================================

/**
 * Studio health metrics for StudioHealthRadar visualization
 */
export const selectStudioHealthMetrics = (state: GameState | null) => {
  const finance = selectFinance(state);
  const projects = selectProjects(state);
  const talents = selectTalentPool(state);
  const studio = selectStudio(state);
  const marketMetrics = selectMarketMetrics(state);
  const cash = finance.cash || 0;
  const monthlyBurn = finance.weeklyHistory?.slice(-4).reduce((sum, h) => sum + h.expenses.burn, 0) || 0;
  const financeScore = Math.min(100, Math.max(0, (cash / Math.max(monthlyBurn, 1)) * 20));
  const talentScores = talents.map(t => t.psychology.mood || 70);
  const talentScore = talentScores.length > 0
    ? talentScores.reduce((sum, t) => sum + t, 0) / talentScores.length
    : 70;
  const activeProjects = projects.filter(p => p.state !== 'released' && p.state !== 'archived');
  const onTrackProjects = activeProjects.filter(p => {
    const onTime = (p.progress || 0) >= ((p.weeksInPhase || 0) / Math.max(p.productionWeeks || 1, 1)) * 100;
    const onBudget = (p.accumulatedCost || 0) <= (p.budget || 0) * 1.1;
    return onTime && onBudget;
  });
  const projectScore = activeProjects.length > 0 ? (onTrackProjects.length / activeProjects.length) * 100 : 70;
  const reputationScore = studio?.prestige || 50;
  const marketScore = 50 + (marketMetrics.sentiment || 0) / 2;
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
 * Active crisis count for CrisisRiskMeter visualization
 */
export const selectActiveCrisisCount = (state: GameState | null) => {
  const projects = selectProjects(state);
  return projects.filter(p => p.activeCrisis && !p.activeCrisis.resolved).length;
};

/**
 * Crisis risk level for CrisisRiskMeter visualization
 */
export const selectCrisisRiskLevel = (state: GameState | null) => {
  const projects = selectProjects(state);
  const talents = selectTalentPool(state);
  const crisisCount = projects.filter(p => p.activeCrisis && !p.activeCrisis.resolved).length;
  const overBudget = projects.filter(p => (p.accumulatedCost || 0) > (p.budget || 0) * 1.1).length;
  const lowMorale = talents.filter(t => t.psychology.mood < 40).length;
  const riskScore = Math.min(100, (crisisCount * 15) + (overBudget * 10) + (lowMorale * 5));
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
// VISUALIZATION SELECTORS - Phase 5: Awards
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
      awardBody: 'Academy Awards',
      category: profile.craftScore > 80 ? 'Best Picture' : 'Supporting',
      probability: profile.craftScore || 50,
      trend: 'stable'
    }));
  });
};
