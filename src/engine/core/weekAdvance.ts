import { GameState, WeekSummary, Headline } from '../types';
import { groupContractsByProject, pick } from '../utils';
import { calculateWeeklyCosts, calculateWeeklyRevenue } from '../systems/finance';
import { advanceProject } from '../systems/projects';
import { checkAndTriggerCrisis } from '../systems/crises';
import { updateRival } from '../systems/rivals';
import { calculateBoxOfficeRanks, BoxOfficeEntry } from '../systems/releaseSimulation';
import { updateBuyers } from '../systems/buyers';
import { generateHeadlines } from '../generators/headlines';
import { generateAwardsProfile, runAwardsCeremony, processRazzies } from '../systems/awards';
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
): GameState => {
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
    ...state,
    studio: { ...state.studio, internal: { ...state.studio.internal, projects: updatedProjects } },
    industry: { ...state.industry, talentPool: updatedTalentPool }
  };
};

const resolveFinancials = (
  state: GameState,
  weeklyChanges: WeeklyChanges
): GameState => {
  const nextWeek = state.week + 1;
  const costs = calculateWeeklyCosts(state.studio.internal.projects, state.market.activeMarketEvents || []);
  const revenue = calculateWeeklyRevenue(state.studio.internal.projects, state.studio.internal.contracts, state.market.activeMarketEvents || []);
  const newCash = state.cash - costs + revenue;

  // Pre-allocate or slice instead of massive spread
  let financeHistory = state.studio.internal.financeHistory;
  if (financeHistory.length >= 52) {
      financeHistory = financeHistory.slice(1);
  }
  const newHistory = new Array(financeHistory.length + 1);
  for(let i=0; i<financeHistory.length; i++) newHistory[i] = financeHistory[i];
  newHistory[financeHistory.length] = { week: nextWeek, cash: newCash, revenue, costs };
  financeHistory = newHistory;

  weeklyChanges.costs += costs;
  weeklyChanges.revenue += revenue;

  return { ...state, cash: newCash, studio: { ...state.studio, internal: { ...state.studio.internal, financeHistory } } };
};

const simulateWorld = (
  state: GameState,
  weeklyChanges: WeeklyChanges
): GameState => {
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

  let prestigeChange = ceremonyResult.prestigeChange;

  if (nextWeek % 52 === 4) {
     const razzies = processRazzies(state, nextWeek);
     if (razzies.projectUpdates.length > 0) {
        weeklyChanges.projectUpdates.push(...razzies.projectUpdates);
        weeklyChanges.newHeadlines.push(...razzies.newHeadlines);
        prestigeChange -= razzies.studioPrestigePenalty; // Decrease studio prestige

        // Apply cult classic flags
        if (razzies.cultClassicProjectIds.length > 0) {
           for (const p of state.studio.internal.projects) {
              if (razzies.cultClassicProjectIds.includes(p.id)) {
                 p.isCultClassic = true;
              }
           }
        }

        // Apply razzie winners and trigger crisis
        if (razzies.razzieWinnerTalentIds.length > 0) {
           for (const t of state.industry.talentPool) {
              if (razzies.razzieWinnerTalentIds.includes(t.id)) {
                 t.hasRazzie = true;

                 // Ego Crisis logic for the specific talent project
                 const relatedProject = state.studio.internal.projects.find(p => p.id === razzies.cultClassicProjectIds[0]); // fallback to worst picture
                 if (relatedProject && !relatedProject.activeCrisis) {
                    relatedProject.activeCrisis = {
                        description: `The Razzies have destroyed ${t.name}'s ego. They are having a meltdown on set of their next project, or refusing to promote this one.`,
                        resolved: false,
                        severity: 'high',
                        options: [
                           { text: 'Apologize for being "misunderstood"', effectDescription: 'Lose 10 buzz.', buzzPenalty: 10 },
                           { text: 'Ignore the noise', effectDescription: 'Lose $500k in PR damage.', cashPenalty: 500000 }
                        ]
                    };
                    weeklyChanges.events.push(`CRISIS: "${relatedProject.title}" - ${relatedProject.activeCrisis.description}`);
                 }
              }
           }
        }
     }
  }

  const newAwards = ceremonyResult.newAwards;

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
      awards: (() => {
        const oldAwards = state.industry.awards || [];
        const combined = new Array(oldAwards.length + newAwards.length);
        for (let i = 0; i < oldAwards.length; i++) combined[i] = oldAwards[i];
        for (let i = 0; i < newAwards.length; i++) combined[oldAwards.length + i] = newAwards[i];
        return combined;
      })(),
      headlines: (() => {
        const oldHeadlines = state.industry.headlines || [];
        const totalLen = Math.min(50, newHeadlines.length + oldHeadlines.length);
        const combined = new Array(totalLen);
        let idx = 0;
        for (let i = 0; i < newHeadlines.length && idx < 50; i++) combined[idx++] = newHeadlines[i];
        for (let i = 0; i < oldHeadlines.length && idx < 50; i++) combined[idx++] = oldHeadlines[i];
        return combined;
      })(),
    }
  };

  newState = advanceMarketEvents(newState);
  newState = advanceRumors(newState);
  newState = resolveFestivals(newState);
  newState = advanceScandals(newState);
  
  const scandalResult = generateScandals(newState);
  if (scandalResult.newScandals.length > 0) {
     const oldScandals = newState.industry.scandals || [];
     const combinedScandals = new Array(oldScandals.length + scandalResult.newScandals.length);
     for(let i = 0; i < oldScandals.length; i++) combinedScandals[i] = oldScandals[i];
     for(let i = 0; i < scandalResult.newScandals.length; i++) combinedScandals[oldScandals.length + i] = scandalResult.newScandals[i];
     newState.industry.scandals = combinedScandals;
     newHeadlines.push(...scandalResult.headlines);
     
     // Apply project crises from scandals
     for (const update of scandalResult.projectUpdates) {
       const project = newState.studio.internal.projects.find(p => p.id === update.projectId);
       if (project && !project.activeCrisis) {
         project.activeCrisis = update.crisis;
         weeklyChanges.events.push(`CRISIS: "${project.title}" - ${update.crisis.description}`);
       }
     }
  }


  weeklyChanges.newHeadlines.push(...newHeadlines);

  return newState;
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
  const weeklyChanges = initializeWeeklyChanges();

  // 1. Process Projects (Advancement, Quality, Completion)
  nextState = processProjectPhase(nextState, weeklyChanges);

  // 2. Resolve Finances (Burn, Revenue, Cash Flow)
  nextState = resolveFinancials(nextState, weeklyChanges);

  // 3. Simulate World (Rivals, Talent Stat Decay, Agency Refresh)
  nextState = simulateWorld(nextState, weeklyChanges);
  
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
