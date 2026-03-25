import { GameState, WeekSummary, Headline } from '../types';
import { groupContractsByProject, pick } from '../utils';
import { calculateWeeklyCosts, calculateWeeklyRevenue } from '../systems/finance';
import { advanceProject } from '../systems/projects';
import { checkAndTriggerCrisis } from '../systems/crises';
import { updateRival } from '../systems/rivals';
import { calculateBoxOfficeRanks, BoxOfficeEntry } from '../systems/releaseSimulation';
import { updateBuyers } from '../systems/buyers';
import { generateHeadlines } from '../generators/headlines';
import { generateAwardsProfile, runAwardsCeremony } from '../systems/awards';
import { advanceDeals } from '../systems/deals';
import { advanceIPRights } from '../systems/ipRetention';
import { advanceTrends, getTrendMultiplier } from '../systems/trends';
import { resolveFestivals } from '../systems/festivals';
import { advanceMarketEvents } from '../systems/marketEvents';
import { advanceRumors } from '../systems/rumors';
import { processDirectorDisputes } from '../systems/directors';
import { generateScandals, advanceScandals } from '../systems/scandals';
import { TalentSystem } from '../systems/TalentSystem';

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

const processProjectPhase = (
  state: GameState,
  weeklyChanges: WeeklyChanges
): { state: GameState; weeklyChanges: WeeklyChanges } => {
  const nextWeek = state.week + 1;
  const contractsByProject = groupContractsByProject(state.studio.internal.contracts);

  const talentPoolMap = new Map<string, typeof state.industry.talentPool[0]>();
  for (const talent of state.industry.talentPool) {
    talentPoolMap.set(talent.id, talent);
  }

  // ⚡ Bolt: Calculate rivalAvgStrength once outside the loop instead of O(N*M) inside
  let rivalStrengthSum = 0;
  for (let i = 0; i < state.industry.rivals.length; i++) {
    rivalStrengthSum += state.industry.rivals[i].strength;
  }
  const rivalAvgStrength = rivalStrengthSum / Math.max(1, state.industry.rivals.length);

  // ⚡ Bolt: Use a single for loop instead of map -> reduce -> forEach to prevent intermediate array allocations
  const updatedProjects: typeof state.studio.internal.projects = [];
  const boxOfficeEntries: BoxOfficeEntry[] = [];
  const allTalentUpdates = new Map<string, typeof state.industry.talentPool[0]>();

  // Mock state for director disputes to avoid massive object spreads inside the loop
  const mockStateForDisputes = {
    ...state,
    studio: {
      ...state.studio,
      internal: {
        ...state.studio.internal,
        projects: [] as typeof state.studio.internal.projects,
      }
    }
  };

  for (let i = 0; i < state.studio.internal.projects.length; i++) {
    const p = state.studio.internal.projects[i];

    if (p.activeCrisis && !p.activeCrisis.resolved) {
      weeklyChanges.projectUpdates.push(`"${p.title}" production is halted until the active crisis is resolved.`);
      updatedProjects.push(p);
      continue;
    }

    const projectContracts = contractsByProject.get(p.id) || [];
    const trendMult = getTrendMultiplier(p.genre, state);
    const { project, update, talentUpdates } = advanceProject(p, nextWeek, state.studio.prestige, projectContracts, talentPoolMap, rivalAvgStrength, state.industry.awards || [], trendMult);

    if (update) weeklyChanges.projectUpdates.push(update);
    talentUpdates.forEach(t => allTalentUpdates.set(t.id, t));
    
    if (project.status === 'released' && p.status !== 'released' && !project.awardsProfile) {
      project.awardsProfile = generateAwardsProfile(project);
    }

    if (project.status === 'production' && (!project.activeCrisis || project.activeCrisis.resolved)) {
      const newCrisis = checkAndTriggerCrisis(project);
      if (newCrisis) {
        project.activeCrisis = newCrisis;
        weeklyChanges.events.push(`CRISIS: "${project.title}" - ${newCrisis.description}`);
      }
    }

    if (project.status === 'production') {
      mockStateForDisputes.studio.internal.projects = [project];
      const dirDisputeArgs = processDirectorDisputes(mockStateForDisputes);
      if (dirDisputeArgs.newCrises.length > 0 && (!project.activeCrisis || project.activeCrisis.resolved)) {
         project.activeCrisis = dirDisputeArgs.newCrises[0].crisis;
         weeklyChanges.projectUpdates.push(...dirDisputeArgs.updates);
      }
    }

    updatedProjects.push(project);

    if (project.status === 'released') {
      boxOfficeEntries.push({ projectId: project.id, studioName: state.studio.name, weeklyRevenue: project.weeklyRevenue });
    }
  }

  const ranks = calculateBoxOfficeRanks(boxOfficeEntries);
  for (let i = 0; i < updatedProjects.length; i++) {
    const p = updatedProjects[i];
    if (p.status === 'released' && ranks.has(p.id)) {
      p.boxOfficeRank = ranks.get(p.id);
    }
  }

  // Update talent pool with changes from projects
  const updatedTalentPool: typeof state.industry.talentPool[0][] = new Array(state.industry.talentPool.length);
  for (let i = 0; i < state.industry.talentPool.length; i++) {
    const t = state.industry.talentPool[i];
    updatedTalentPool[i] = allTalentUpdates.get(t.id) || t;
  }

  return {
    state: { 
      ...state, 
      studio: { ...state.studio, internal: { ...state.studio.internal, projects: updatedProjects } },
      industry: { ...state.industry, talentPool: updatedTalentPool }
    },
    weeklyChanges,
  };
};

const resolveFinancials = (
  state: GameState,
  weeklyChanges: WeeklyChanges
): { state: GameState; weeklyChanges: WeeklyChanges } => {
  const nextWeek = state.week + 1;
  const costs = calculateWeeklyCosts(state.studio.internal.projects, state.market.activeMarketEvents || []);
  const revenue = calculateWeeklyRevenue(state.studio.internal.projects, state.studio.internal.contracts, state.market.activeMarketEvents || []);
  const newCash = state.cash - costs + revenue;

  // Pre-allocate or slice instead of massive spread
  let financeHistory = state.studio.internal.financeHistory;
  if (financeHistory.length >= 52) {
      financeHistory = financeHistory.slice(1);
  }
  financeHistory = [...financeHistory, { week: nextWeek, cash: newCash, revenue, costs }];

  weeklyChanges.costs += costs;
  weeklyChanges.revenue += revenue;

  return {
    state: { ...state, cash: newCash, studio: { ...state.studio, internal: { ...state.studio.internal, financeHistory } } },
    weeklyChanges,
  };
};

const simulateWorld = (
  state: GameState,
  weeklyChanges: WeeklyChanges
): { state: GameState; weeklyChanges: WeeklyChanges } => {
  const nextWeek = state.week + 1;

  // Simulate Rivals
  const updatedRivals: typeof state.industry.rivals = new Array(state.industry.rivals.length);
  for (let i = 0; i < state.industry.rivals.length; i++) {
    updatedRivals[i] = updateRival(state.industry.rivals[i], state);
  }

  // Update Buyers
  const { updatedBuyers, newHeadlines: buyerHeadlines } = updateBuyers(state.market.buyers || [], nextWeek);

  const formattedBuyerHeadlines: Headline[] = new Array(buyerHeadlines.length);
  for (let i = 0; i < buyerHeadlines.length; i++) {
    formattedBuyerHeadlines[i] = {
      id: `bh-${crypto.randomUUID()}`,
      text: buyerHeadlines[i],
      week: nextWeek,
      category: 'market' as const,
    };
  }

  // Simulate Talent & Opportunities via TalentSystem
  const { updatedOpportunities: updatedOpportunitiesCopy, events: talentEvents } = TalentSystem.advance(state);
  weeklyChanges.events.push(...talentEvents);

  // Random World Events
  if (Math.random() < 0.2) {
    weeklyChanges.events.push(pick(EVENT_POOL));
  }
  if (Math.random() < 0.2) {
    weeklyChanges.events.push(pick(EVENT_POOL));
  }

  const newHeadlines = generateHeadlines(nextWeek, updatedRivals);
  newHeadlines.push(...formattedBuyerHeadlines);

  const year = Math.floor(nextWeek / 52) + 1;
  const ceremonyResult = runAwardsCeremony(state, nextWeek, year);

  const newAwards = ceremonyResult.newAwards;
  const prestigeChange = ceremonyResult.prestigeChange;

  if (newAwards.length > 0) {
    weeklyChanges.projectUpdates.push(...ceremonyResult.projectUpdates);
    const uniqueBodiesSet = new Set<string>();
    for (let i = 0; i < newAwards.length; i++) {
      uniqueBodiesSet.add(newAwards[i].body);
    }
    const uniqueBodies = Array.from(uniqueBodiesSet);
    weeklyChanges.events.push(`The ${uniqueBodies.join(' and ')} took place this week!`);
  }

  let newState: GameState = {
    ...state,
    market: {
      ...state.market,
      opportunities: updatedOpportunitiesCopy,
      buyers: updatedBuyers,
      trends: state.market.trends ? advanceTrends(state.market.trends) : [],
    },
    studio: {
      ...state.studio,
      prestige: state.studio.prestige + prestigeChange
    },
    industry: {
      ...state.industry,
      rivals: updatedRivals,
      awards: [...(state.industry.awards || []), ...newAwards],
      headlines: [...newHeadlines, ...state.industry.headlines].slice(0, 50),
    }
  };

  newState = advanceMarketEvents(newState);
  newState = advanceRumors(newState);
  newState = resolveFestivals(newState);
  newState = advanceScandals(newState);
  
  const scandalResult = generateScandals(newState);
  if (scandalResult.newScandals.length > 0) {
     newState.industry.scandals = [...(newState.industry.scandals || []), ...scandalResult.newScandals];
     newHeadlines.push(...scandalResult.headlines);
  }

  weeklyChanges.newHeadlines.push(...newHeadlines);

  return {
    state: newState,
    weeklyChanges,
  };
};

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
  };

  return { newState: { ...state, week: nextWeek }, summary };
};

export function advanceWeek(state: GameState): { newState: GameState; summary: WeekSummary } {
  let nextState = { ...state };
  let weeklyChanges = initializeWeeklyChanges();

  // 1. Process Projects (Advancement, Quality, Completion)
  const afterProjects = processProjectPhase(nextState, weeklyChanges);
  nextState = afterProjects.state;
  weeklyChanges = afterProjects.weeklyChanges;

  // 2. Resolve Finances (Burn, Revenue, Cash Flow)
  const afterFinance = resolveFinancials(nextState, weeklyChanges);
  nextState = afterFinance.state;
  weeklyChanges = afterFinance.weeklyChanges;

  // 3. Simulate World (Rivals, Talent Stat Decay, Agency Refresh)
  const afterWorld = simulateWorld(nextState, weeklyChanges);
  nextState = afterWorld.state;
  weeklyChanges = afterWorld.weeklyChanges;
  
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
