import { GameState, WeekSummary, Headline } from '../types';
import { pick } from '../utils';
import { advanceFinance } from '../systems/finance';
import { advanceProjects } from '../systems/projects';
import { advanceRivals } from '../systems/rivals';
import { advanceTalent } from '../systems/talent';
import { updateBuyers } from '../systems/buyers';
import { generateHeadlines } from '../generators/headlines';
import { runAwardsCeremony } from '../systems/awards';
import { advanceDeals } from '../systems/deals';
import { advanceIPRights } from '../systems/ipRetention';
import { advanceTrends } from '../systems/trends';
import { resolveFestivals } from '../systems/festivals';
import { advanceMarketEvents } from '../systems/marketEvents';
import { advanceRumors } from '../systems/rumors';
import { generateScandals, advanceScandals } from '../systems/scandals';

const EVENT_POOL = [
  'Market analysts upgrade entertainment sector outlook.',
  'A high-profile talent dispute makes industry headlines.',
  'Streaming platform announces major content budget increase.',
  'International box office sets new quarterly record.',
  'Film festival announces lineup — buzz is building.',
  'Regulators announce new content distribution guidelines.',
  'A viral social media trend boosts genre film interest.',
  'Nepotism debate dominates the weekly trades.',
  'Sibling duo announces unexpected co-production.',
  'Famous dynasty patriarch announces retirement.',
  'Former child star attempts a serious prestige comeback.',
  'Public family feud leaks during an awards press tour.'
];

export interface WeeklyChanges {
  projectUpdates: string[];
  events: string[];
  newHeadlines: Headline[];
  costs: number;
  revenue: number;
}

const initializeWeeklyChanges = (): WeeklyChanges => ({
  projectUpdates: [],
  events: [],
  newHeadlines: [],
  costs: 0,
  revenue: 0,
});

export function advanceWeek(state: GameState): { newState: GameState; summary: WeekSummary } {
  const nextWeek = state.week + 1;
  let nextState = { ...state };
  let weeklyChanges = initializeWeeklyChanges();

  // 1. Projects System
  const projectResult = advanceProjects(nextState, nextWeek);
  nextState.projects = projectResult.updatedProjects;
  weeklyChanges.projectUpdates.push(...projectResult.projectUpdates);
  weeklyChanges.events.push(...projectResult.events);

  // 2. Finance System
  const financeResult = advanceFinance(nextState, nextWeek);
  nextState.cash = financeResult.newCash;
  nextState.financeHistory = financeResult.financeHistory;
  weeklyChanges.costs = financeResult.costs;
  weeklyChanges.revenue = financeResult.revenue;

  // 3. Rivals System
  const rivalResult = advanceRivals(nextState);
  nextState.rivals = rivalResult.updatedRivals;

  // 4. Talent System
  const talentResult = advanceTalent(nextState);
  nextState.opportunities = talentResult.updatedOpportunities;
  weeklyChanges.events.push(...talentResult.events);

  // 5. World / Buyers / Events
  const { updatedBuyers, newHeadlines: buyerHeadlines } = updateBuyers(nextState.buyers || [], nextWeek);
  nextState.buyers = updatedBuyers;

  const formattedBuyerHeadlines: Headline[] = buyerHeadlines.map(text => ({
    id: `bh-${crypto.randomUUID()}`,
    text,
    week: nextWeek,
    category: 'market' as const,
  }));

  if (Math.random() < 0.3) {
    weeklyChanges.events.push(pick(EVENT_POOL));
  }

  const newHeadlines = generateHeadlines(nextWeek, nextState.rivals);
  newHeadlines.push(...formattedBuyerHeadlines);

  // 6. Awards Ceremony
  const year = Math.floor(nextWeek / 52) + 1;
  const ceremonyResult = runAwardsCeremony(nextState, nextWeek, year);
  
  if (ceremonyResult.newAwards.length > 0) {
    nextState.awards = [...(nextState.awards || []), ...ceremonyResult.newAwards];
    nextState.studio.prestige += ceremonyResult.prestigeChange;
    weeklyChanges.projectUpdates.push(...ceremonyResult.projectUpdates);
    const uniqueBodies = [...new Set(ceremonyResult.newAwards.map(a => a.body))];
    weeklyChanges.events.push(`The ${uniqueBodies.join(' and ')} took place this week!`);
  }

  // 7. Other Systems
  nextState.trends = nextState.trends ? advanceTrends(nextState.trends) : [];
  nextState = advanceMarketEvents(nextState);
  nextState = advanceRumors(nextState);
  nextState = resolveFestivals(nextState);
  nextState = advanceScandals(nextState);

  const scandalResult = generateScandals(nextState);
  if (scandalResult.newScandals.length > 0) {
    nextState.scandals = [...(nextState.scandals || []), ...scandalResult.newScandals];
    newHeadlines.push(...scandalResult.headlines);
  }

  // 8. IP Rights & Deals
  const { projects: updatedProjects, messages: ipMessages } = advanceIPRights(nextState.projects, nextWeek);
  nextState.projects = updatedProjects;
  weeklyChanges.events.push(...ipMessages);

  if (nextState.firstLookDeals) {
    const activeDeals = advanceDeals(nextState.firstLookDeals);
    const expiredDeals = nextState.firstLookDeals.length - activeDeals.length;
    if (expiredDeals > 0) {
      weeklyChanges.events.push(`${expiredDeals} first-look talent deal(s) expired this week.`);
    }
    nextState.firstLookDeals = activeDeals;
  }

  // 9. Finalize
  weeklyChanges.newHeadlines = newHeadlines;
  nextState.headlines = [...newHeadlines, ...nextState.headlines].slice(0, 50);
  nextState.week = nextWeek;

  const summary: WeekSummary = {
    fromWeek: state.week,
    toWeek: nextWeek,
    cashBefore: state.cash,
    cashAfter: nextState.cash,
    totalRevenue: weeklyChanges.revenue,
    totalCosts: weeklyChanges.costs,
    projectUpdates: weeklyChanges.projectUpdates,
    newHeadlines: weeklyChanges.newHeadlines,
    events: weeklyChanges.events,
  };

  return { newState: nextState, summary };
}
