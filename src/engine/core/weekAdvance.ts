import { GameState, WeekSummary, Headline, NewsEvent, StudioSnapshot } from '@/engine/types';
import { ALL_GENRES } from '../systems/trends';
import { advanceIPRights } from '../systems/ipRetention';
import { advanceDeals } from '../systems/deals';
import { processProduction, WeeklyChanges as ProductionWeeklyChanges } from '../systems/processors/processProduction';
import { processFinance, WeeklyChanges as FinanceWeeklyChanges } from '../systems/processors/processFinance';
import { processWorldEvents, WeeklyChanges as WorldWeeklyChanges } from '../systems/processors/processWorldEvents';

// Consolidated WeeklyChanges interface for the orchestrator
export interface WeeklyChanges extends ProductionWeeklyChanges, FinanceWeeklyChanges, WorldWeeklyChanges {
  projectUpdates: string[];
  events: string[];
  newHeadlines: Headline[];
  costs: number;
  revenue: number;
  newsEvents: Omit<NewsEvent, 'id' | 'week'>[];
}

const initializeWeeklyChanges = (): WeeklyChanges => ({
  projectUpdates: [],
  events: [],
  newHeadlines: [],
  costs: 0,
  revenue: 0,
  newsEvents: [],
});

const finalizeWeek = (
  state: GameState,
  weeklyChanges: WeeklyChanges,
  originalState: GameState
): { newState: GameState; summary: WeekSummary } => {
  const nextWeek = originalState.week + 1;

  const nextNewsEvents = new Array(weeklyChanges.newsEvents.length);
  for (let i = 0; i < weeklyChanges.newsEvents.length; i++) {
    nextNewsEvents[i] = {
      ...weeklyChanges.newsEvents[i],
      id: `ne-${crypto.randomUUID()}`,
      week: nextWeek
    };
  }

  const summary: WeekSummary = {
    fromWeek: originalState.week,
    toWeek: nextWeek,
    cashBefore: originalState.cash,
    cashAfter: state.cash,
    totalRevenue: weeklyChanges.revenue,
    totalCosts: weeklyChanges.costs,
    projectUpdates: weeklyChanges.projectUpdates,
    newHeadlines: weeklyChanges.newHeadlines,
    events: weeklyChanges.events,
    newsEvents: nextNewsEvents
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
    yearToDateRevenue: (state.finance?.yearToDateRevenue || 0) + weeklyChanges.revenue,
    yearToDateExpenses: (state.finance?.yearToDateExpenses || 0) + weeklyChanges.costs,
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
  const startIdx = oldHistory.length >= 52 ? oldHistory.length - 51 : 0;
  const newLength = Math.min(oldHistory.length + 1, 52);
  const nextHistory = new Array(newLength);
  let destIdx = 0;
  for (let i = startIdx; i < oldHistory.length; i++) {
    nextHistory[destIdx++] = oldHistory[i];
  }
  nextHistory[destIdx] = currentSnapshot; // Keep last year of history

  const newState: GameState = {
    ...state,
    week: nextWeek,
    culture: { genrePopularity },
    finance: nextFinance,
    history: nextHistory,
  };

  return { newState, summary };
}

/**
 * The Weekly Simulation Orchestrator
 * This function coordinates the various sub-processes that occur every game week.
 */
export function advanceWeek(state: GameState): { newState: GameState; summary: WeekSummary } {
  const weeklyChanges = initializeWeeklyChanges();

  // 1. Process Projects (Advancement, Quality, Completion)
  let nextState = processProduction(state, weeklyChanges);

  // 2. Resolve Finances (Burn, Revenue, Cash Flow)
  nextState = processFinance(nextState, weeklyChanges);

  // 3. Simulate World (Rivals, Talent, Market, Awards)
  nextState = processWorldEvents(nextState, weeklyChanges);

  // 4. Rights & Deals (Sprint E)
  const { projects: updatedProjects, messages: ipMessages } = advanceIPRights(nextState.studio.internal.projects, nextState.week + 1);

  const finalInternal = {
    ...nextState.studio.internal,
    projects: updatedProjects,
  };

  for (let i = 0; i < ipMessages.length; i++) {
    weeklyChanges.events.push(ipMessages[i]);
  }
  
  let activeDeals = nextState.studio.internal.firstLookDeals;
  if (nextState.studio.internal.firstLookDeals) {
    activeDeals = advanceDeals(nextState.studio.internal.firstLookDeals);
    const expiredDeals = nextState.studio.internal.firstLookDeals.length - activeDeals.length;
    if (expiredDeals > 0) {
      weeklyChanges.events.push(`${expiredDeals} first-look talent deal(s) expired this week.`);
    }
    finalInternal.firstLookDeals = activeDeals;
  }

  nextState = {
    ...nextState,
    studio: {
      ...nextState.studio,
      internal: finalInternal
    }
  };

  // 5. Finalize
  return finalizeWeek(finalState, weeklyChanges, state);
}
