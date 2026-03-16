import { generateOpportunity } from '../generators/opportunities';
import { GameState, WeekSummary } from '../types';
import { calculateWeeklyCosts, calculateWeeklyRevenue } from '../systems/finance';
import { advanceProject } from '../systems/projects';
import { updateRival } from '../systems/rivals';
import { updateBuyers } from '../systems/buyers';
import { generateHeadlines } from '../generators/headlines';
import { generateOpportunity } from '../generators/opportunities';
import { generateAwardsProfile, runAwardsCeremony } from '../systems/awards';
import { pick, groupContractsByProject } from '../utils';
import { generateOpportunity } from '../generators/opportunities';

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

export function advanceWeek(state: GameState): { newState: GameState; summary: WeekSummary } {
  const projectUpdates: string[] = [];
  const events: string[] = [];
  const nextWeek = state.week + 1;

  const contractsByProject = groupContractsByProject(state.contracts);

  // Group talent by id for O(1) lookup
  const talentPoolMap = new Map<string, typeof state.talentPool[0]>();
  for (const talent of state.talentPool) {
    talentPoolMap.set(talent.id, talent);
  }

  // Advance projects
  const updatedProjects = state.projects.map(p => {
    const projectContracts = contractsByProject.get(p.id) || [];
    const { project, update } = advanceProject(p, nextWeek, state.studio.prestige, projectContracts, talentPoolMap);
    if (update) projectUpdates.push(update);

    // Generate awards profile if newly released
    if (project.status === 'released' && p.status !== 'released' && !project.awardsProfile) {
      project.awardsProfile = generateAwardsProfile(project);
    }

    return project;
  });

  // Calculate finances
  const costs = calculateWeeklyCosts(updatedProjects);
  const revenue = calculateWeeklyRevenue(updatedProjects, state.contracts);
  const newCash = state.cash - costs + revenue;

  // Update rivals
  const updatedRivals = state.rivals.map(updateRival);


  // Update buyers and mandates
  const { updatedBuyers, newHeadlines: buyerHeadlines } = updateBuyers(state.buyers || [], nextWeek);

  // Merge buyer headlines into normal headlines
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formattedBuyerHeadlines = buyerHeadlines.map(text => ({
    id: `bh-${crypto.randomUUID()}`,
    text,
    week: nextWeek,
    category: 'market' as const,
  }));


  // Update opportunities
  let updatedOpportunities = state.opportunities ? [...state.opportunities] : [];

  updatedOpportunities = updatedOpportunities
    .map(opp => ({
      ...opp,
      weeksUntilExpiry: opp.weeksUntilExpiry - 1,
    }))
    .filter(opp => opp.weeksUntilExpiry > 0);

  // Sometimes spawn new opportunities
  if (Math.random() < 0.2) {
    const oppNames = updatedOpportunities.map(o => o.title);
    const availableTalentIds = state.talentPool
      .filter(t => !contractsByProject.has(t.id))
      .map(t => t.id);

    if (availableTalentIds.length > 0) {
      const newOpp = generateOpportunity(availableTalentIds);
        if (!oppNames.includes(newOpp.title)) {
          updatedOpportunities.push(newOpp);
          events.push(`A new script "${newOpp.title}" hit the market.`);
        }
    }
  }

  // Generate headlines
  const newHeadlines = generateHeadlines(nextWeek, updatedRivals);
  newHeadlines.push(...formattedBuyerHeadlines);

  // Manage Opportunities
  const updatedOpportunities = state.opportunities
    .map(opp => ({ ...opp, weeksUntilExpiry: opp.weeksUntilExpiry - 1 }))
    .filter(opp => opp.weeksUntilExpiry > 0);

  // Random events
  if (Math.random() < 0.15) {
    events.push(pick(EVENT_POOL));
  }

  // Possibly spawn a new opportunity
  if (Math.random() < 0.2) { // 20% chance per week
    const newOpp = generateOpportunity(state.week, state.studio.prestige);
    updatedOpportunities.push(newOpp);
    events.push(`A new script "${newOpp.title}" just hit the market!`);
  }
  if (Math.random() < 0.15) {
    events.push(pick(EVENT_POOL));
  }

    // Run any awards ceremonies scheduled for this week
  const year = Math.floor(nextWeek / 52) + 1; // 1-indexed year
  const ceremonyResult = runAwardsCeremony(state, nextWeek, year);

  const newAwards = ceremonyResult.newAwards;
  const prestigeChange = ceremonyResult.prestigeChange;

  if (newAwards.length > 0) {
    projectUpdates.push(...ceremonyResult.projectUpdates);

    // Check which bodies fired to announce it
    const uniqueBodies = [...new Set(newAwards.map(a => a.body))];
    events.push(`The ${uniqueBodies.join(' and ')} took place this week!`);
  }


  // Decrease opportunity expiry weeks and remove expired ones
  const updatedOpportunities = (state.opportunities || []).reduce((acc, o) => {
    if (o.weeksUntilExpiry > 1) {
      acc.push({ ...o, weeksUntilExpiry: o.weeksUntilExpiry - 1 });
    }
    return acc;
  }, [] as typeof state.opportunities);

  // Sometimes spawn new opportunities
  if (Math.random() < 0.2 && updatedOpportunities.length < 5) {
    const newOpp = generateOpportunity(nextWeek);
    updatedOpportunities.push(newOpp);
    events.push(`A new ${newOpp.type} has hit the market!`);
  }

  const newState: GameState = {
    ...state,
    week: nextWeek,
    cash: newCash,
    opportunities: updatedOpportunities,
    studio: { ...state.studio, prestige: state.studio.prestige + prestigeChange },
    projects: updatedProjects,
    buyers: updatedBuyers,
    talentPool: Array.from(talentPoolMap.values()),
    rivals: updatedRivals,
    awards: [...(state.awards || []), ...newAwards],
    headlines: [...newHeadlines, ...formattedBuyerHeadlines, ...state.headlines].slice(0, 50),
    financeHistory: [
      ...state.financeHistory,
      { week: nextWeek, cash: newCash, revenue, costs },
    ].slice(-52),
  };

  const summary: WeekSummary = {
    fromWeek: state.week,
    toWeek: nextWeek,
    cashBefore: state.cash,
    cashAfter: newCash,
    totalRevenue: revenue,
    totalCosts: costs,
    projectUpdates,
    newHeadlines,
    events,
  };
  return { newState, summary };
}
