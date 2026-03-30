import { GameState, WeekSummary, Headline, NewsEvent, StudioSnapshot } from '@/engine/types';
import { ALL_GENRES } from '../systems/trends';
import { secureRandom } from '../utils';
import { advanceIPRights } from '../systems/ipRetention';
import { advanceDeals } from '../systems/deals';
import { processProduction } from '../systems/processors/processProduction';
import { processFinance } from '../systems/processors/processFinance';
import { processWorldEvents } from '../systems/processors/processWorldEvents';
import { applyStateImpact } from '@/store/storeUtils';
import { mergeImpacts } from '../utils/impactUtils';
import { StateImpact } from '../types/state.types';

const finalizeWeek = (
  state: GameState,
  mergedImpact: StateImpact,
  originalState: GameState
): { newState: GameState; summary: WeekSummary } => {
  const nextWeek = state.week; // Already advanced in newState? No, let's be careful.
  // Actually, we usually advance week number at the very end. 
  // Let's assume 'state' passed here is the result of all impacts, and we'll increment week now.

  const summary: WeekSummary = {
    fromWeek: originalState.week,
    toWeek: originalState.week + 1,
    cashBefore: originalState.cash,
    cashAfter: state.cash,
    totalRevenue: (mergedImpact.cashChange || 0) > 0 ? (mergedImpact.cashChange || 0) : 0, // Simplified
    totalCosts: (mergedImpact.cashChange || 0) < 0 ? -(mergedImpact.cashChange || 0) : 0, // Simplified
    projectUpdates: mergedImpact.uiNotifications || [], // Using notifications as the human-readable project log
    newHeadlines: (mergedImpact.newHeadlines || []) as Headline[],
    events: mergedImpact.uiNotifications || [],
    newsEvents: (mergedImpact.newsEvents || []) as NewsEvent[]
  };

  // Update UI Data Vis Extensions (Epic 4)
  const nextTrends = state.market.trends || [];
  const genrePopularity: Record<string, number> = {};
  const trendMap = new Map<string, number>();
  for (let i = 0; i < nextTrends.length; i++) {
    trendMap.set(nextTrends[i].genre, nextTrends[i].heat);
  }
  for (let i = 0; i < ALL_GENRES.length; i++) {
    const g = ALL_GENRES[i];
    const heat = trendMap.get(g);
    genrePopularity[g.toLowerCase()] = heat !== undefined ? heat / 100 : 0.2 + secureRandom() * 0.1;
  }

  const nextFinance = {
    bankBalance: state.cash,
    yearToDateRevenue: (state.finance?.yearToDateRevenue || 0) + (summary.totalRevenue || 0),
    yearToDateExpenses: (state.finance?.yearToDateExpenses || 0) + (summary.totalCosts || 0),
  };

  // Create Snapshot for history
  let activeProjectsCount = 0;
  let releasedProjectsCount = 0;
  const projects = state.studio.internal.projects;
  for (let i = 0; i < projects.length; i++) {
    const s = projects[i].status;
    if (s === 'released' || s === 'post_release' || s === 'archived') {
      releasedProjectsCount++;
    } else {
      activeProjectsCount++;
    }
  }

  const currentSnapshot: StudioSnapshot = {
    year: Math.floor((originalState.week - 1) / 52) + 1,
    week: ((originalState.week - 1) % 52) + 1,
    funds: state.cash,
    activeProjects: activeProjectsCount,
    completedProjects: releasedProjectsCount,
    totalPrestige: state.studio.prestige,
    timestamp: new Date().toISOString()
  };

  const oldHistory = state.history || [];
  const nextHistory = [...oldHistory.slice(oldHistory.length >= 52 ? 1 : 0), currentSnapshot];

  const newState: GameState = {
    ...state,
    week: originalState.week + 1,
    culture: { genrePopularity },
    finance: nextFinance,
    history: nextHistory,
  };

  return { newState, summary };
}

/**
 * The Weekly Simulation Orchestrator
 * This function coordinates the various sub-processes that occur every game week.
 * Now implements a sequential StateImpact pipeline for determinism.
 */
export function advanceWeek(state: GameState): { newState: GameState; summary: WeekSummary } {
  const impacts: StateImpact[] = [];

  // 1. Process World Events (Independent, usually happens "during" the week)
  const worldImpact = processWorldEvents(state);
  impacts.push(worldImpact);
  let workingState = applyStateImpact(state, worldImpact);

  // 2. Process Projects (Advancement, Quality, Completion)
  const productionImpact = processProduction(workingState);
  impacts.push(productionImpact);
  workingState = applyStateImpact(workingState, productionImpact);

  // 3. Resolve Finances (Burn, Revenue, Cash Flow)
  const financeImpact = processFinance(workingState);
  impacts.push(financeImpact);
  workingState = applyStateImpact(workingState, financeImpact);

  // 4. Rights & Deals (Remaining Logic)
  const { projects: updatedProjects, messages: ipMessages } = advanceIPRights(workingState.studio.internal.projects, workingState.week + 1);
  const ipImpact: StateImpact = {
      projectUpdates: updatedProjects.map(p => ({ projectId: p.id, update: p })),
      uiNotifications: ipMessages
  };
  impacts.push(ipImpact);
  workingState = applyStateImpact(workingState, ipImpact);
  
  if (workingState.studio.internal.firstLookDeals) {
    const activeDeals = advanceDeals(workingState.studio.internal.firstLookDeals);
    const expiredDeals = workingState.studio.internal.firstLookDeals.length - activeDeals.length;
    const dealImpact: StateImpact = {
        uiNotifications: expiredDeals > 0 ? [`${expiredDeals} first-look talent deal(s) expired this week.`] : []
    };
    // Note: Manual assignment for deals until we have a field for it in StateImpact
    workingState = {
        ...workingState,
        studio: {
            ...workingState.studio,
            internal: {
                ...workingState.studio.internal,
                firstLookDeals: activeDeals
            }
        }
    };
    impacts.push(dealImpact);
  }

  // 5. Finalize
  const totalImpact = mergeImpacts(...impacts);
  return finalizeWeek(workingState, totalImpact, state);
}

