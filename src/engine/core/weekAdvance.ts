import { GameState, WeekSummary, Headline, NewsEvent, StudioSnapshot } from '@/engine/types';
import { ALL_GENRES } from '../systems/trends';
import { advanceIPRights } from '../systems/ipRetention';
import { advanceDeals } from '../systems/deals';
import { processProduction, WeeklyChanges as ProductionWeeklyChanges } from '../systems/processors/processProduction';
import { processFinance, WeeklyChanges as FinanceWeeklyChanges } from '../systems/processors/processFinance';
import { processWorldEvents, WeeklyChanges as WorldWeeklyChanges } from '../systems/processors/processWorldEvents';
import { useGameStore } from '../../store/gameStore';

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
    newsEvents: weeklyChanges.newsEvents.map(ne => ({
      ...ne,
      id: `ne-${crypto.randomUUID()}`,
      week: nextWeek
    }))
  };

  // Update UI Data Vis Extensions (Epic 4)
  const nextTrends = state.market.trends || [];
  const genrePopularity: Record<string, number> = {};
  ALL_GENRES.forEach(g => {
    const trend = nextTrends.find(t => t.genre === g);
    genrePopularity[g.toLowerCase()] = trend ? trend.heat / 100 : 0.2 + Math.random() * 0.1;
  });

  const nextFinance = {
    bankBalance: state.cash,
    yearToDateRevenue: (state.finance?.yearToDateRevenue || 0) + weeklyChanges.revenue,
    yearToDateExpenses: (state.finance?.yearToDateExpenses || 0) + weeklyChanges.costs,
  };

  // Create Snapshot for history
  // ⚡ Bolt: Calculate project counts in a single O(N) pass to prevent intermediate array allocations from .filter()
  let activeProjectsCount = 0;
  let releasedProjectsCount = 0;
  for (let i = 0; i < state.studio.internal.projects.length; i++) {
    const status = state.studio.internal.projects[i].status;
    if (status === 'released' || status === 'post_release' || status === 'archived') {
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

  const nextHistory = [...(state.history || []), currentSnapshot].slice(-52); // Keep last year of history

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
  let nextState = { ...state };
  const weeklyChanges = initializeWeeklyChanges();

  // 1. Process Projects (Advancement, Quality, Completion)
  nextState = processProduction(nextState, weeklyChanges);

  // 2. Resolve Finances (Burn, Revenue, Cash Flow)
  nextState = processFinance(nextState, weeklyChanges);

  // 3. Simulate World (Rivals, Talent, Market, Awards)
  nextState = processWorldEvents(nextState, weeklyChanges);

  // 4. Rights & Deals (Sprint E)
  const { projects: updatedProjects, messages: ipMessages } = advanceIPRights(nextState.studio.internal.projects, nextState.week + 1);
  nextState.studio.internal.projects = updatedProjects;
  weeklyChanges.events.push(...ipMessages);
  
  if (nextState.studio.internal.firstLookDeals) {
    const activeDeals = advanceDeals(nextState.studio.internal.firstLookDeals);
    const expiredDeals = nextState.studio.internal.firstLookDeals.length - activeDeals.length;
    if (expiredDeals > 0) {
      weeklyChanges.events.push(`${expiredDeals} first-look talent deal(s) expired this week.`);
    }
    nextState.studio.internal.firstLookDeals = activeDeals;
  }

  // 5. Finalize
  return finalizeWeek(nextState, weeklyChanges, state);
}
