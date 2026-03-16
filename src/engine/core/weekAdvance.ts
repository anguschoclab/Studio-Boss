import { groupContractsByProject } from "../utils";
import { GameState, WeekSummary } from '../types';
import { calculateWeeklyCosts, calculateWeeklyRevenue } from '../systems/finance';
import { advanceProject } from '../systems/projects';
import { checkAndTriggerCrisis } from '../systems/crises';
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
    // Stop progression if project is in an active unresolved crisis
    if (p.activeCrisis && !p.activeCrisis.resolved) {
      projectUpdates.push(`"${p.title}" production is halted until the active crisis is resolved.`);
      return p;
    }

    const projectContracts = contractsByProject.get(p.id) || [];
    const { project, update } = advanceProject(p, nextWeek, state.studio.prestige, projectContracts, talentPoolMap);
    if (update) projectUpdates.push(update);

    // Generate awards profile if newly released
    if (project.status === 'released' && p.status !== 'released' && !project.awardsProfile) {
      project.awardsProfile = generateAwardsProfile(project);
    }

    // Check for new crisis after advancing week if still in production
    if (project.status === 'production' && (!project.activeCrisis || project.activeCrisis.resolved)) {
      const newCrisis = checkAndTriggerCrisis(project);
      if (newCrisis) {
        project.activeCrisis = newCrisis;
        events.push(`CRISIS: "${project.title}" - ${newCrisis.description}`);
      }
    }

    return project;
  });

  // Update opportunities


  // Calculate finances
  const costs = calculateWeeklyCosts(updatedProjects);
  const revenue = calculateWeeklyRevenue(updatedProjects, state.contracts);
  const newCash = state.cash - costs + revenue;

  // Update rivals
  const updatedRivals = state.rivals.map(updateRival);


  // Update buyers and mandates
  const { updatedBuyers, newHeadlines: buyerHeadlines } = updateBuyers(state.buyers || [], nextWeek);

  // Merge buyer headlines into normal headlines
  const formattedBuyerHeadlines = buyerHeadlines.map(text => ({
    id: `bh-${crypto.randomUUID()}`,
    text,
    week: nextWeek,
    category: 'market' as const,
  }));


  // Update opportunities
  let updatedOpportunitiesCopy = state.opportunities ? [...state.opportunities] : [];

  updatedOpportunitiesCopy = updatedOpportunitiesCopy
    .map(opp => ({
      ...opp,
      weeksUntilExpiry: opp.weeksUntilExpiry - 1,
    }))
    .filter(opp => opp.weeksUntilExpiry > 0);

  // Sometimes spawn new opportunities
  if (Math.random() < 0.2) {
    const oppNames = updatedOpportunitiesCopy.map(o => o.title);
    const availableTalentIds = state.talentPool
      .filter(t => !contractsByProject.has(t.id))
      .map(t => t.id);

    if (availableTalentIds.length > 0) {
      const newOpp = generateOpportunity(availableTalentIds);
        if (!oppNames.includes(newOpp.title)) {
          updatedOpportunitiesCopy.push(newOpp);
          events.push(`A new script "${newOpp.title}" hit the market.`);
        }
    }
  }

  // Generate headlines
  const newHeadlines = [...formattedBuyerHeadlines, ...generateHeadlines(nextWeek, updatedRivals)];

  // Random events
  if (Math.random() < 0.15) {
    events.push(pick(EVENT_POOL));
  }

  // Possibly spawn a new opportunity
  if (Math.random() < 0.2) { // 20% chance per week
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



  // Update opportunities
  updatedOpportunitiesCopy = state.opportunities
    .map(opp => ({ ...opp, weeksUntilExpiry: opp.weeksUntilExpiry - 1 }))
    .filter(opp => opp.weeksUntilExpiry > 0);



  // Random chance to spawn a new opportunity
  if (Math.random() < 0.15 && updatedOpportunitiesCopy.length < 3) {
    const newOpp = generateOpportunity(state.week, state.studio.prestige);
    updatedOpportunitiesCopy.push(newOpp);
    events.push(`A new ${newOpp.budgetTier} ${newOpp.format} package hit the market.`);
  }

  const newState: GameState = {
    ...state,
    week: nextWeek,
    cash: newCash,
    opportunities: updatedOpportunitiesCopy,
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
