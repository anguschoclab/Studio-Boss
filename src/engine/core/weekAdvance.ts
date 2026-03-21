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

  const updatedProjects = state.projects.map(p => {
    if (p.activeCrisis && !p.activeCrisis.resolved) {
      projectUpdates.push(`"${p.title}" production is halted until the active crisis is resolved.`);
      return p;
    }

    const projectContracts = contractsByProject.get(p.id) || [];
    const rivalAvgStrength = state.rivals.reduce((sum, r) => sum + r.strength, 0) / Math.max(1, state.rivals.length);
    const { project, update } = advanceProject(p, nextWeek, state.studio.prestige, projectContracts, talentPoolMap, rivalAvgStrength, state.awards);
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

    return project;
  });

  const boxOfficeEntries = updatedProjects.reduce((acc, p) => {
    if (p.status === 'released') {
      acc.push({ projectId: p.id, studioName: state.studio.name, weeklyRevenue: p.weeklyRevenue });
    }
    return acc;
  }, [] as BoxOfficeEntry[]);

  const ranks = calculateBoxOfficeRanks(boxOfficeEntries);
  updatedProjects.forEach(p => {
    if (p.status === 'released' && ranks.has(p.id)) {
      p.boxOfficeRank = ranks.get(p.id);
    }
  });

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
  const costs = calculateWeeklyCosts(state.projects);
  const revenue = calculateWeeklyRevenue(state.projects, state.contracts);
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

  const updatedRivals = state.rivals.map(updateRival);

  const { updatedBuyers, newHeadlines: buyerHeadlines } = updateBuyers(state.buyers || [], nextWeek);

  const formattedBuyerHeadlines = buyerHeadlines.map(text => ({
    id: `bh-${crypto.randomUUID()}`,
    text,
    week: nextWeek,
    category: 'market' as const,
  }));

  let updatedOpportunitiesCopy = state.opportunities ? [...state.opportunities] : [];

  // ⚡ Bolt: Single pass reduce to prevent intermediate array allocation from map().filter()
  updatedOpportunitiesCopy = updatedOpportunitiesCopy.reduce((acc, opp) => {
    const newWeeks = opp.weeksUntilExpiry - 1;
    if (newWeeks > 0) {
      acc.push({
        ...opp,
        weeksUntilExpiry: newWeeks,
      });
    }
    return acc;
  }, [] as typeof updatedOpportunitiesCopy);

  if (Math.random() < 0.2) {
    const oppNames = new Set(updatedOpportunitiesCopy.map(o => o.title));

    // ⚡ Bolt: Use a Set for O(1) active talent lookup instead of Map keyed by project ID,
    // and process in a single reduce pass to prevent intermediate array allocations.
    const activeTalentIds = new Set(state.contracts.map(c => c.talentId));
    const availableTalentIds = state.talentPool.reduce((acc, t) => {
      if (!activeTalentIds.has(t.id)) {
        acc.push(t.id);
      }
      return acc;
    }, [] as string[]);

    if (availableTalentIds.length > 0) {
      const newOpp = generateOpportunity(availableTalentIds);
      if (!oppNames.has(newOpp.title)) {
        updatedOpportunitiesCopy.push(newOpp);
        events.push(`A new script "${newOpp.title}" hit the market.`);
      }
    }
  }

  const newHeadlines = generateHeadlines(nextWeek, updatedRivals);
  newHeadlines.push(...formattedBuyerHeadlines);

  if (Math.random() < 0.15) {
    events.push(pick(EVENT_POOL));
  }

  if (Math.random() < 0.2) {
    const newOpp = generateOpportunity(state.week, state.studio.prestige);
    updatedOpportunitiesCopy.push(newOpp);
    events.push(`A new script "${newOpp.title}" just hit the market!`);
  }

  if (Math.random() < 0.15) {
    events.push('New opportunities have hit the market!');
    updatedOpportunitiesCopy.push({
      id: `opp-${crypto.randomUUID()}`,
      type: 'script',
      weeksUntilExpiry: 4,
      cost: 500000,
      details: {
        title: 'Spec Script',
        genre: 'Action',
      }
    } as typeof state.opportunities[0]);
  }

  if (Math.random() < 0.15) {
    events.push(pick(EVENT_POOL));
  }

  const year = Math.floor(nextWeek / 52) + 1;
  const ceremonyResult = runAwardsCeremony(state, nextWeek, year);

  const newAwards = ceremonyResult.newAwards;
  const prestigeChange = ceremonyResult.prestigeChange;

  if (newAwards.length > 0) {
    projectUpdates.push(...ceremonyResult.projectUpdates);
    const uniqueBodies = [...new Set(newAwards.map(a => a.body))];
    events.push(`The ${uniqueBodies.join(' and ')} took place this week!`);
  }

  if (Math.random() < 0.15 && updatedOpportunitiesCopy.length < 3) {
    const newOpp = generateOpportunity(state.week, state.studio.prestige);
    updatedOpportunitiesCopy.push(newOpp);
    events.push(`A new ${newOpp.budgetTier} ${newOpp.format} package hit the market.`);
  }

  const talentPoolMap = new Map<string, typeof state.talentPool[0]>();
  for (const talent of state.talentPool) {
    talentPoolMap.set(talent.id, talent);
  }

  const newState: GameState = {
    ...state,
    opportunities: updatedOpportunitiesCopy,
    studio: { ...state.studio, prestige: state.studio.prestige + prestigeChange },
    buyers: updatedBuyers,
    talentPool: Array.from(talentPoolMap.values()),
    rivals: updatedRivals,
    awards: [...(state.awards || []), ...newAwards],
    headlines: [...newHeadlines, ...state.headlines].slice(0, 50),
  };

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

  // 4. Finalize
  return finalizeWeek(nextState, weeklyChanges, state);
}
