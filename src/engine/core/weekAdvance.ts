import { GameState, WeekSummary, Headline, NewsEvent, StudioSnapshot } from '@/engine/types';
import { ALL_GENRES } from '../systems/trends';
import { secureRandom } from '../utils';
import { advanceIPRights } from '../systems/ipRetention';
import { advanceDeals } from '../systems/deals';
import { processProduction } from '../systems/processors/processProduction';
import { processRivalProduction } from '../systems/processors/processRivalProduction';
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
    funds: state.finance.cash,
    activeProjects: activeProjectsCount,
    completedProjects: releasedProjectsCount,
    totalPrestige: state.studio.prestige,
    timestamp: new Date().toISOString()
  };
}

/**
 * Updates the culture and history slices of the state.
 */
function finalizeStateMetadata(state: GameState, originalState: GameState): GameState {
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

  // 2. Update History
  const currentSnapshot = createSnapshot(state, originalState.week);
  const oldHistory = state.history || [];
  const nextHistory = [...oldHistory.slice(-51), currentSnapshot];

  return {
    ...state,
    week: nextWeek,
    culture: { genrePopularity },
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

  // 1. Process Studio Production (Advancement, Quality, Completion)
  const productionImpact = processProduction(currentState);
  currentState = applyStateImpact(currentState, productionImpact);

  // 2. Process Rival Production (Advancement for competitors)
  const rivalProdImpact = processRivalProduction(currentState);
  currentState = applyStateImpact(currentState, rivalProdImpact);

  // 3. Resolve Studio Finances (Burn, Revenue, Cash Flow)
  // TRANSFORMER: Directly returns new GameState
  currentState = processFinance(currentState);
  
  // Extract report from ledger for summary
  const lastReport = currentState.finance.ledger[currentState.finance.ledger.length - 1];
  const totalRevenue = lastReport?.revenue.boxOffice + lastReport?.revenue.distribution + lastReport?.revenue.other || 0;
  const totalCosts = lastReport?.expenses.production + lastReport?.expenses.marketing + lastReport?.expenses.overhead || 0;

  // 4. Simulate World (Rivals, Talent, Market, Awards, Scandals)
  const worldImpact = processWorldEvents(currentState);
  currentState = applyStateImpact(currentState, worldImpact);

  // 5. IP Rights & Deals
  const ipImpact = advanceIPRights(Object.values(currentState.studio.internal.projects), currentState.week);
  currentState = applyStateImpact(currentState, ipImpact);
  
  const dealsImpact = advanceDeals(currentState.studio.internal.firstLookDeals || []);
  currentState = applyStateImpact(currentState, dealsImpact);

  // 6. Build Cumulative Summary
  const allImpacts = mergeImpacts(productionImpact, rivalProdImpact, worldImpact, ipImpact, dealsImpact);
  
  const summary: WeekSummary = {
    fromWeek: originalState.week,
    toWeek: originalState.week + 1,
    cashBefore: originalState.finance.cash,
    cashAfter: currentState.finance.cash,
    totalRevenue,
    totalCosts,
    projectUpdates: allImpacts.uiNotifications || [],
    newHeadlines: (allImpacts.newHeadlines as Headline[]) || [],
    events: allImpacts.uiNotifications || [], 
    newsEvents: (allImpacts.newsEvents as NewsEvent[]) || []
  };

  // 7. Finalize State (Metadata, History)
  const finalState = finalizeStateMetadata(currentState, originalState);

  return { newState: finalState, summary };
}
