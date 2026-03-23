import { GameState, WeekSummary, Headline } from '../types';
import { groupContractsByProject, pick } from '../utils';
import { calculateWeeklyCosts, calculateWeeklyRevenue } from '../systems/finance';
import { advanceProject } from '../systems/projects';
import { checkAndTriggerCrisis } from '../systems/crises';
import { updateRival } from '../systems/rivals';
import { calculateBoxOfficeRanks, BoxOfficeEntry } from '../systems/releaseSimulation';
import { updateBuyers } from '../systems/buyers';
import { generateHeadlines } from '../generators/headlines';
import { generateOpportunity } from '../generators/opportunities';
import { generateAwardsProfile, runAwardsCeremony } from '../systems/awards';
import { advanceDeals } from '../systems/deals';
import { advanceIPRights } from '../systems/ipRetention';
import { advanceTrends, getTrendMultiplier } from '../systems/trends';
import { resolveFestivals } from '../systems/festivals';
import { advanceMarketEvents } from '../systems/marketEvents';
import { advanceRumors } from '../systems/rumors';
import { processDirectorDisputes } from '../systems/directors';
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

const processProjectPhase = (
  state: GameState,
  weeklyChanges: WeeklyChanges
): { state: GameState; weeklyChanges: WeeklyChanges } => {
  const nextWeek = state.week + 1;
  const contractsByProject = groupContractsByProject(state.contracts);

  const talentPoolMap = new Map<string, typeof state.talentPool[0]>();
  for (const talent of state.talentPool) {
    talentPoolMap.set(talent.id, talent);
  }

  const projectUpdates: string[] = [];
  const events: string[] = [];

  // ⚡ Bolt: Calculate rivalAvgStrength once outside the loop instead of O(N*M) inside
  let rivalStrengthSum = 0;
  for (let i = 0; i < state.rivals.length; i++) {
    rivalStrengthSum += state.rivals[i].strength;
  }
  const rivalAvgStrength = rivalStrengthSum / Math.max(1, state.rivals.length);

  // ⚡ Bolt: Use a single for loop instead of map -> reduce -> forEach to prevent intermediate array allocations
  const updatedProjects: typeof state.projects = [];
  const boxOfficeEntries: BoxOfficeEntry[] = [];

  for (let i = 0; i < state.projects.length; i++) {
    const p = state.projects[i];

    if (p.activeCrisis && !p.activeCrisis.resolved) {
      projectUpdates.push(`"${p.title}" production is halted until the active crisis is resolved.`);
      updatedProjects.push(p);
      continue;
    }

    const projectContracts = contractsByProject.get(p.id) || [];
    const trendMult = getTrendMultiplier(p.genre, state);
    const { project, update } = advanceProject(p, nextWeek, state.studio.prestige, projectContracts, talentPoolMap, rivalAvgStrength, state.awards, trendMult);

    if (update) projectUpdates.push(update);

    if (project.status === 'released' && p.status !== 'released' && !project.awardsProfile) {
      project.awardsProfile = generateAwardsProfile(project);
    }

    if (project.status === 'production' && (!project.activeCrisis || project.activeCrisis.resolved)) {
      const newCrisis = checkAndTriggerCrisis(project);
      if (newCrisis) {
        project.activeCrisis = newCrisis;
        events.push(`CRISIS: "${project.title}" - ${newCrisis.description}`);
      }
    }

    // Sprint J: Director disputes
    if (project.status === 'production') {
      const dirDisputeArgs = processDirectorDisputes({ ...state, projects: [project] });
      if (dirDisputeArgs.newCrises.length > 0 && (!project.activeCrisis || project.activeCrisis.resolved)) {
         project.activeCrisis = dirDisputeArgs.newCrises[0].crisis;
         projectUpdates.push(...dirDisputeArgs.updates);
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

  return {
    state: { ...state, projects: updatedProjects },
    weeklyChanges: {
      ...weeklyChanges,
      projectUpdates: [...weeklyChanges.projectUpdates, ...projectUpdates],
      events: [...weeklyChanges.events, ...events],
    },
  };
};

const resolveFinancials = (
  state: GameState,
  weeklyChanges: WeeklyChanges
): { state: GameState; weeklyChanges: WeeklyChanges } => {
  const nextWeek = state.week + 1;
  const costs = calculateWeeklyCosts(state.projects, state.activeMarketEvents);
  const revenue = calculateWeeklyRevenue(state.projects, state.contracts, state.activeMarketEvents);
  const newCash = state.cash - costs + revenue;

  const financeHistory = [
    ...state.financeHistory,
    { week: nextWeek, cash: newCash, revenue, costs },
  ].slice(-52);

  return {
    state: { ...state, cash: newCash, financeHistory },
    weeklyChanges: {
      ...weeklyChanges,
      costs: weeklyChanges.costs + costs,
      revenue: weeklyChanges.revenue + revenue,
    },
  };
};

const simulateWorld = (
  state: GameState,
  weeklyChanges: WeeklyChanges
): { state: GameState; weeklyChanges: WeeklyChanges } => {
  const nextWeek = state.week + 1;
  const projectUpdates: string[] = [];
  const events: string[] = [];

  // ⚡ Bolt: Single pass for loops instead of map to avoid allocations
  const updatedRivals: typeof state.rivals = [];
  for (let i = 0; i < state.rivals.length; i++) {
    updatedRivals.push(updateRival(state.rivals[i], state));
  }

  const { updatedBuyers, newHeadlines: buyerHeadlines } = updateBuyers(state.buyers || [], nextWeek);

  const formattedBuyerHeadlines: Headline[] = [];
  for (let i = 0; i < buyerHeadlines.length; i++) {
    formattedBuyerHeadlines.push({
      id: `bh-${crypto.randomUUID()}`,
      text: buyerHeadlines[i],
      week: nextWeek,
      category: 'market' as const,
    });
  }

  const updatedOpportunitiesCopy: typeof state.opportunities = [];
  const opportunities = state.opportunities || [];

  // ⚡ Bolt: Single pass for loop instead of filter/map/reduce
  for (let i = 0; i < opportunities.length; i++) {
    const opp = opportunities[i];
    const newWeeks = opp.weeksUntilExpiry - 1;
    if (newWeeks > 0) {
      updatedOpportunitiesCopy.push({
        ...opp,
        weeksUntilExpiry: newWeeks,
      });
    }
  }

  // ⚡ Bolt: Lazy load oppNames set so it doesn't map on every tick if not needed
  let oppNames: Set<string> | null = null;
  const getOppNames = () => {
    if (!oppNames) {
      oppNames = new Set();
      for (let i = 0; i < updatedOpportunitiesCopy.length; i++) {
        oppNames.add(updatedOpportunitiesCopy[i].title);
      }
    }
    return oppNames;
  };

  // Opportunity 1 (Specific to available talent)
  // ⚡ Bolt: Keep expensive mapping inside the probability block so it doesn't run every tick
  if (Math.random() < 0.2) {
    // ⚡ Bolt: Avoid extra allocations with an in-place Set builder and a straight loop
    const activeTalentIds = new Set<string>();
    for (let i = 0; i < state.contracts.length; i++) {
      activeTalentIds.add(state.contracts[i].talentId);
    }

    const availableTalentIds: string[] = [];
    for (let i = 0; i < state.talentPool.length; i++) {
      const t = state.talentPool[i];
      if (!activeTalentIds.has(t.id)) {
        availableTalentIds.push(t.id);
      }
    }

    if (availableTalentIds.length > 0) {
      const newOpp = generateOpportunity(availableTalentIds);
      if (!getOppNames().has(newOpp.title)) {
        updatedOpportunitiesCopy.push(newOpp);
        getOppNames().add(newOpp.title);
        events.push(`A new script "${newOpp.title}" hit the market.`);
      }
    }
  }

  // Event 1
  if (Math.random() < 0.15) {
    events.push(pick(EVENT_POOL));
  }

  // Opportunity 2 (General)
  if (Math.random() < 0.2) {
    const newOpp = generateOpportunity();
    if (!getOppNames().has(newOpp.title)) {
      updatedOpportunitiesCopy.push(newOpp);
      getOppNames().add(newOpp.title);
      events.push(`A new script "${newOpp.title}" just hit the market!`);
    }
  }

  // Opportunity 3 (General batch)
  if (Math.random() < 0.15) {
    const newOpp = generateOpportunity();
    if (!getOppNames().has(newOpp.title)) {
      updatedOpportunitiesCopy.push(newOpp);
      getOppNames().add(newOpp.title);
      events.push('New opportunities have hit the market!');
    }
  }

  // Event 2
  if (Math.random() < 0.15) {
    events.push(pick(EVENT_POOL));
  }

  // Opportunity 4 (Fallback)
  if (Math.random() < 0.15 && updatedOpportunitiesCopy.length < 3) {
    const newOpp = generateOpportunity();
    if (!getOppNames().has(newOpp.title)) {
      updatedOpportunitiesCopy.push(newOpp);
      getOppNames().add(newOpp.title);
      events.push(`A new ${newOpp.budgetTier} ${newOpp.format} package hit the market.`);
    }
  }

  const newHeadlines = generateHeadlines(nextWeek, updatedRivals);
  newHeadlines.push(...formattedBuyerHeadlines);

  const year = Math.floor(nextWeek / 52) + 1;
  const ceremonyResult = runAwardsCeremony(state, nextWeek, year);

  const newAwards = ceremonyResult.newAwards;
  const prestigeChange = ceremonyResult.prestigeChange;

  if (newAwards.length > 0) {
    projectUpdates.push(...ceremonyResult.projectUpdates);
    const uniqueBodiesSet = new Set<string>();
    for (let i = 0; i < newAwards.length; i++) {
      uniqueBodiesSet.add(newAwards[i].body);
    }
    const uniqueBodies = Array.from(uniqueBodiesSet);
    events.push(`The ${uniqueBodies.join(' and ')} took place this week!`);
  }

  let newState: GameState = {
    ...state,
    opportunities: updatedOpportunitiesCopy,
    studio: { ...state.studio, prestige: state.studio.prestige + prestigeChange },
    buyers: updatedBuyers,
    rivals: updatedRivals,
    trends: state.trends ? advanceTrends(state.trends) : [],
    awards: [...(state.awards || []), ...newAwards],
    headlines: [...newHeadlines, ...state.headlines].slice(0, 50),
  };

  newState = advanceMarketEvents(newState);
  newState = advanceRumors(newState);
  newState = resolveFestivals(newState);
  newState = advanceScandals(newState);
  
  // Scans talent pool and spawns new scandals
  const scandalResult = generateScandals(newState);
  if (scandalResult.newScandals.length > 0) {
     newState.scandals = [...(newState.scandals || []), ...scandalResult.newScandals];
     newHeadlines.push(...scandalResult.headlines);
  }

  return {
    state: newState,
    weeklyChanges: {
      ...weeklyChanges,
      projectUpdates: [...weeklyChanges.projectUpdates, ...projectUpdates],
      events: [...weeklyChanges.events, ...events],
      newHeadlines: [...weeklyChanges.newHeadlines, ...newHeadlines],
    },
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
  const { projects: updatedProjects, messages: ipMessages } = advanceIPRights(nextState.projects, nextState.week + 1);
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

  // 5. Finalize
  return finalizeWeek(nextState, weeklyChanges, state);
}
