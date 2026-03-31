import { GameState, WeekSummary, Headline, NewsEvent, StudioSnapshot } from '@/engine/types';
import { ALL_GENRES } from '../systems/trends';
import { secureRandom } from '../utils';
import { advanceIPRights } from '../systems/ipRetention';
import { advanceDeals } from '../systems/deals';
import { processProduction } from '../systems/processors/processProduction';
import { processFinance } from '../systems/processors/processFinance';
import { processWorldEvents } from '../systems/processors/processWorldEvents';
import { applyStateImpact } from '../../store/storeUtils';
import { mergeImpacts } from '../utils/impactUtils';

/**
 * Creates a snapshot of the current studio state for historical tracking.
 */
function createSnapshot(state: GameState, originalWeek: number): StudioSnapshot {
  let activeProjectsCount = 0;
  let releasedProjectsCount = 0;
  const projects = Object.values(state.studio.internal.projects);
  
  for (const p of projects) {
    if (p.status === 'released' || p.status === 'post_release' || p.status === 'archived') {
      releasedProjectsCount++;
    } else {
      activeProjectsCount++;
    }
  }

  return {
    year: Math.floor((originalWeek - 1) / 52) + 1,
    week: ((originalWeek - 1) % 52) + 1,
    funds: state.cash,
    activeProjects: activeProjectsCount,
    completedProjects: releasedProjectsCount,
    totalPrestige: state.studio.prestige,
    timestamp: new Date().toISOString()
  };
}

/**
 * Updates the culture and finance slices of the state based on simulation results.
 */
function finalizeStateMetadata(state: GameState, originalState: GameState, totalRevenue: number, totalCosts: number): GameState {
  const nextWeek = originalState.week + 1;

  // 1. Update Culture (Genre Popularity)
  const nextTrends = state.market.trends || [];
  const genrePopularity: Record<string, number> = {};
  const trendMap = new Map<string, number>();
  for (const t of nextTrends) trendMap.set(t.genre, t.heat);
  
  for (const g of ALL_GENRES) {
    const heat = trendMap.get(g);
    genrePopularity[g.toLowerCase()] = heat !== undefined ? heat / 100 : 0.2 + secureRandom() * 0.1;
  }

  // 2. Update Finance Summary
  const nextFinance = {
    bankBalance: state.cash,
    yearToDateRevenue: (state.finance?.yearToDateRevenue || 0) + totalRevenue,
    yearToDateExpenses: (state.finance?.yearToDateExpenses || 0) + totalCosts,
  };

  // 3. Update History
  const currentSnapshot = createSnapshot(state, originalState.week);
  const oldHistory = state.history || [];
  const nextHistory = [...oldHistory.slice(-51), currentSnapshot];

  return {
    ...state,
    week: nextWeek,
    culture: { genrePopularity },
    finance: nextFinance,
    history: nextHistory,
  };
}

/**
 * The Weekly Simulation Orchestrator.
 * Coordinates all simulation systems in a deterministic, sequential pipeline.
 */
export function advanceWeek(state: GameState): { newState: GameState; summary: WeekSummary } {
  const originalState = state;
  let currentState = state;
  let cumulativeImpact = {};

  // 1. Process Studio Production (Advancement, Quality, Completion)
  const productionImpact = processProduction(currentState);
  currentState = applyStateImpact(currentState, productionImpact);

  // 2. Resolve Studio Finances (Burn, Revenue, Cash Flow)
  const financeImpact = processFinance(currentState);
  currentState = applyStateImpact(currentState, financeImpact);

  // 3. Simulate World (Rivals, Talent, Market, Awards, Scandals)
  const worldImpact = processWorldEvents(currentState);
  currentState = applyStateImpact(currentState, worldImpact);

  // 4. IP Rights & Deals
  const ipImpact = advanceIPRights(Object.values(currentState.studio.internal.projects), currentState.week);
  currentState = applyStateImpact(currentState, ipImpact);
  
  const dealsImpact = advanceDeals(currentState.studio.internal.firstLookDeals || []);
  currentState = applyStateImpact(currentState, dealsImpact);

  // 5. Build Cumulative Summary
  const allImpacts = mergeImpacts(productionImpact, financeImpact, worldImpact, ipImpact, dealsImpact);
  
  const totalRevenue = financeImpact.cashChange && financeImpact.cashChange > 0 ? financeImpact.cashChange : 0;
  const totalCosts = financeImpact.cashChange && financeImpact.cashChange < 0 ? -financeImpact.cashChange : 0;

  const summary: WeekSummary = {
    fromWeek: originalState.week,
    toWeek: originalState.week + 1,
    cashBefore: originalState.cash,
    cashAfter: currentState.cash,
    totalRevenue: totalRevenue,
    totalCosts: totalCosts,
    projectUpdates: allImpacts.uiNotifications || [],
    newHeadlines: (allImpacts.newHeadlines as Headline[]) || [],
    events: allImpacts.uiNotifications || [], // Overlapping for now, unified in later sprints
    newsEvents: (allImpacts.newsEvents as NewsEvent[]) || []
  };

  // 6. Finalize State (Metadata, History, Finance slices)
  const finalState = finalizeStateMetadata(currentState, originalState, totalRevenue, totalCosts);

  return { newState: finalState, summary };
}
