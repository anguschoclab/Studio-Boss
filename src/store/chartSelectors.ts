/**
 * Chart & Visualization Selectors
 *
 * All selectors that exclusively feed visualization components are here.
 * Base game-state selectors (entities, finance, talent) remain in selectors.ts.
 * Import from this file in visualization components; selectors.ts re-exports these
 * for backward compatibility.
 */

import { 
  GameState, 
  Project, 
  RivalStudio, 
  Talent, 
  GameEvent,
  FilmProject,
  SeriesProject,
  ScriptMetrics
} from '../engine/types';
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

export interface RecoupmentStatusData {
  title: string;
  budget: number;
  revenue: number;
  recouped: number;
  status: 'profitable' | 'recouped' | 'in_progress' | 'at_risk';
  isRecouped: boolean;
  weeksSinceRelease: number;
}

export interface ScriptQualityData {
  projectTitle: string;
  scriptHeat: number;
  draftCount: number;
  lastRevisionWeek: number | null;
  issues: number;
}

export interface QualityMetricData {
  metric: string;
  value: number;
}

export interface ScriptQualityReport {
  projectTitle: string;
  writer: string;
  overallScore: number;
  metrics: QualityMetricData[];
  trend: 'improving' | 'stable' | 'declining';
}

export interface CashFlowTrend {
  week: number;
  revenue: number;
  expenses: number;
  net: number;
}

export interface RevenueSource {
  source: string;
  value: number;
}

export interface BudgetBurnData {
  week: number;
  planned: number;
  actual: number;
  remaining: number;
}

export interface BudgetBurnReport {
  projectTitle: string;
  totalBudget: number;
  history: BudgetBurnData[];
}

export interface ProjectTimelinePoint {
  week: number;
  development: number;
  preProduction: number;
  production: number;
  postProduction: number;
  released: number;
}

export interface BoxOfficeData {
  projectTitle: string;
  budget: number;
  openingWeekend: number;
  totalGross: number;
  roi: number;
  releaseWeek: number;
  trend: 'blockbuster' | 'hit' | 'average' | 'flop' | 'bomb';
  theaters: number;
  perTheater: number;
}

export interface ProductionSlippageData {
  projectName: string;
  originalEndWeek: number;
  currentEndWeek: number;
  weeksSlipped: number;
  isSlipping: boolean;
}

export interface GenrePerformance {
  genre: string;
  avgRevenue: number;
  projectCount: number;
  marketTrend: number;
  isHot: boolean;
  metric: string;
  value: number;
}

export interface MarketSharePoint {
  name: string;
  share: number;
  isPlayer: boolean;
}

export interface StreamingViewershipEntry {
  week: number;
  hoursWatched: number;
  uniqueViewers: number;
  completionRate: number;
}

export interface TalentSatisfactionData {
  overallScore: number;
  byCategory: Array<{ category: string; score: number }>;
}

export interface TalentTierData {
  tier: string;
  count: number;
  avgSalary: number;
}

export interface DealStats {
  total: number;
  accepted: number;
  rejected: number;
  pending: number;
  avgNegotiationWeeks: number;
}

export interface StudioHealthMetric {
  metric: string;
  score: number;
  fullMark: number;
}

export interface CrisisRiskData {
  riskLevel: number;
  activeThreats: string[];
}

export interface AwardProbability {
  projectTitle: string;
  awardBody: string;
  category: string;
  probability: number;
  trend: string;
}

// Type Guard for Scripted Projects
const isScripted = (project: Project): project is (FilmProject | SeriesProject) => {
  return 'scriptMetrics' in project;
};

// ============================================================================
// VISUALIZATION SELECTORS - Phase 1: Finance
// ============================================================================

/**
 * Cash flow trends over time for CashFlowChart visualization
 * Aggregates revenue and expenses from weekly financial snapshots
 */
export const selectCashFlowTrends = (state: GameState | null, weeks: number = 12): CashFlowTrend[] => {
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
export const selectRevenueBreakdown = (state: GameState | null): RevenueSource[] => {
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
 * Detailed budget burn report for BudgetBurnRate visualization
 */
export const selectBudgetBurnReport = (state: GameState | null, projectId: string): BudgetBurnReport | null => {
  const project = selectProjectsRaw(state)[projectId];
  if (!project) return null;

  const budget = project.budget || 1;
  const accumulated = project.accumulatedCost || 0;
  
  // Current snapshot as a history entry
  const currentSnapshot: BudgetBurnData = {
    week: state?.week || 0,
    planned: Math.round(budget / Math.max(project.productionWeeks || 1, 1)),
    actual: project.weeklyCost || 0,
    remaining: Math.max(0, budget - accumulated),
  };

  return {
    projectTitle: project.title,
    totalBudget: budget,
    history: [currentSnapshot], // Future: map from actual history if tracked
  };
};

/**
 * Recoupment status for all projects for RecoupmentStatus visualization
 */
export const selectRecoupmentStatus = (state: GameState | null): RecoupmentStatusData[] => {
  const projects = selectProjects(state);
  return projects
    .filter(p => p.state === 'released' || p.state === 'post_release' || p.state === 'archived')
    .map(p => {
      const revenue = p.revenue || 0;
      const budget = p.budget || 1;
      const recouped = Math.round((revenue / budget) * 100);
      
      let status: 'profitable' | 'recouped' | 'in_progress' | 'at_risk' = 'in_progress';
      if (revenue > budget * 1.5) status = 'profitable';
      else if (revenue >= budget) status = 'recouped';
      else if (revenue < budget * 0.3 && (p.weeksInPhase || 0) > 8) status = 'at_risk';

      return {
        title: p.title,
        budget,
        revenue,
        recouped,
        status,
        isRecouped: revenue >= budget,
        weeksSinceRelease: (state?.week || 0) - (p.releaseWeek || 0),
      };
    });
};

/**
 * Project timeline data for ProjectTimeline visualization
 */
export const selectProjectTimelineData = (state: GameState | null, weeks: number = 12): ProjectTimelinePoint[] => {
  const projects = selectProjects(state);
  const currentWeek = state?.week || 1;
  const startWeek = currentWeek - weeks;
  return Array.from({ length: weeks }, (_, i) => {
    const week = startWeek + i;
    return {
      week,
      development: projects.filter(p => p.state === 'development' && (p.estimatedWindow?.startWeek || 0) <= week).length,
      preProduction: projects.filter(p => p.state === 'needs_greenlight' || p.state === 'pitching').length,
      production: projects.filter(p => p.state === 'production').length,
      postProduction: projects.filter(p => p.state === 'marketing').length,
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
export const selectBoxOfficeData = (state: GameState | null): BoxOfficeData[] => {
  const releasedProjects = selectReleasedProjects(state);
  return releasedProjects
    .filter(p => p.boxOffice || p.revenue > 0)
    .map(p => {
      const budget = p.budget || 1;
      const totalGross = p.revenue || 0;
      const roi = Math.round((totalGross / budget) * 100);
      
      let trend: 'blockbuster' | 'hit' | 'average' | 'flop' | 'bomb' = 'average';
      if (roi > 300) trend = 'blockbuster';
      else if (roi > 150) trend = 'hit';
      else if (roi < 40) trend = 'bomb';
      else if (roi < 80) trend = 'flop';

      const theaters = Math.floor(Math.random() * 2000) + 500; // Simulated as not in engine yet
      const perTheater = theaters > 0 ? Math.round(totalGross / theaters) : 0;
      const openingWeekend = p.boxOffice 
        ? p.boxOffice.openingWeekendDomestic + p.boxOffice.openingWeekendForeign 
        : Math.round(totalGross * 0.2);

      return {
        projectTitle: p.title,
        budget,
        openingWeekend,
        totalGross,
        roi,
        releaseWeek: p.releaseWeek || 0,
        trend,
        theaters,
        perTheater,
      };
    })
    .sort((a, b) => b.totalGross - a.totalGross)
    .slice(0, 10);
};

/**
 * Production slippage data for ProductionSlippageIndicator visualization
 */
export const selectProductionSlippage = (state: GameState | null): ProductionSlippageData[] => {
  const projects = selectActiveProjects(state);
  return projects
    .filter(p => p.state === 'production')
    .map(p => {
      const expectedEnd = p.estimatedWindow?.endWeek || (state?.week || 0) + 4;
      const originalEnd = expectedEnd - 2; // Simulated
      const slippage = Math.max(0, expectedEnd - originalEnd);
      return {
        projectName: p.title,
        originalEndWeek: originalEnd,
        currentEndWeek: expectedEnd,
        weeksSlipped: slippage,
        isSlipping: slippage > 0,
      };
    });
};

/**
 * Script quality metrics for ScriptQualityMetrics visualization
 */
export const selectScriptQualityMetrics = (state: GameState | null, projectId: string): ScriptQualityData | null => {
  const project = selectProjectsRaw(state)[projectId];
  if (!project) return null;
  
  if (!isScripted(project)) return null;

  const scriptHeat = project.scriptHeat || 50;
  const scriptEvents = project.scriptEvents || [];
  
  return {
    projectTitle: project.title,
    scriptHeat,
    draftCount: scriptEvents.filter(e => e.type === 'DIALOGUE_POLISH').length || 0, // Map to new Event Types
    lastRevisionWeek: scriptEvents.length > 0 ? scriptEvents[scriptEvents.length - 1].week : null,
    issues: 0, // Placeholder as 'ISSUE' type not in current ScriptEvent union
  };
};

/**
 * Comprehensive script quality report for ScriptQualityMetrics visualization
 */
export const selectScriptQualityReport = (state: GameState | null, projectId: string): ScriptQualityReport | null => {
  const project = state?.entities?.projects[projectId];
  if (!project) return null;

  // Type guard for ScriptedProject
  if (!isScripted(project)) return null;
  
  const metricsData = project.scriptMetrics;
  if (!metricsData) return null;

  const metrics: QualityMetricData[] = [
    { metric: 'Structure', value: metricsData.structure || 0 },
    { metric: 'Dialogue', value: metricsData.dialogue || 0 },
    { metric: 'Originality', value: metricsData.originality || 0 },
    { metric: 'Pacing', value: metricsData.pacing || 0 },
    { metric: 'Emotional', value: metricsData.emotionalImpact || 0 },
  ];

  const overallScore = metricsData.overallScore || 0;

  return {
    projectTitle: project.title,
    writer: 'Internal Team',
    overallScore,
    metrics,
    trend: metricsData.trend || 'stable',
  };
};

/**
 * Genre performance matrix for GenrePerformanceMatrix visualization
 */
export const selectGenrePerformanceMatrix = (state: GameState | null): GenrePerformance[] => {
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
      metric: 'ROI',
      value: avgRevenue > 0 ? 100 : 0 // Simplified for heatmap
    };
  });
};

/**
 * Market share data for MarketShareComparison visualization
 */
export const selectMarketShareData = (state: GameState | null): MarketSharePoint[] => {
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
export const selectStreamingViewership = (state: GameState | null, platformName: string): StreamingViewershipEntry[] => {
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
export const selectTalentSatisfaction = (state: GameState | null): TalentSatisfactionData => {
  const talents = selectTalentPool(state);
  if (talents.length === 0) return { overallScore: 0, byCategory: [] };
  const scores = talents.map(t => ({ id: t.id, score: t.psychology?.mood || 70, tier: t.tier }));
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
export const selectTalentTierDistribution = (state: GameState | null): { data: TalentTierData[]; totalTalent: number } => {
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
export const selectDealStats = (state: GameState | null): DealStats => {
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
export const selectStudioHealthMetrics = (state: GameState | null): StudioHealthMetric[] => {
  const finance = selectFinance(state);
  const projects = selectProjects(state);
  const talents = selectTalentPool(state);
  const studio = selectStudio(state);
  const marketMetrics = selectMarketMetrics(state);
  const cash = finance.cash || 0;
  const history = finance.weeklyHistory || [];
  const monthlyBurn = history.slice(-4).reduce((sum, h) => sum + (h.expenses?.burn || 0), 0) || 0;
  const financeScore = Math.min(100, Math.max(0, (cash / Math.max(monthlyBurn, 1)) * 20));
  const talentScores = talents.map(t => t.psychology?.mood || 70);
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
export const selectCrisisRiskLevel = (state: GameState | null): CrisisRiskData => {
  const projects = selectProjects(state);
  const talents = selectTalentPool(state);
  const crisisCount = projects.filter(p => p.activeCrisis && !p.activeCrisis.resolved).length;
  const overBudget = projects.filter(p => (p.accumulatedCost || 0) > (p.budget || 0) * 1.1).length;
  const lowMorale = talents.filter(t => (t.psychology?.mood ?? 100) < 40).length;
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
export const selectAwardsProbability = (state: GameState | null): AwardProbability[] => {
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
