import { GameState, WeekSummary, Award, Contract } from '../types';
import { calculateWeeklyCosts, calculateWeeklyRevenue } from '../systems/finance';
import { advanceProject } from '../systems/projects';
import { updateRival } from '../systems/rivals';
import { updateBuyers } from '../systems/buyers';
import { generateHeadlines } from '../generators/headlines';
import { generateAwardsProfile, runAwardsCeremony } from '../systems/awards';
import { pick } from '../utils';

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
  const nextWeek = state.week + 1;

  // Group contracts by projectId for O(1) lookup
  const contractsByProject = new Map<string, Contract[]>();
  for (const contract of state.contracts) {
    if (!contractsByProject.has(contract.projectId)) {
      contractsByProject.set(contract.projectId, []);
    }
    contractsByProject.get(contract.projectId)!.push(contract);
  }

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
  const formattedBuyerHeadlines = buyerHeadlines.map(text => ({
    id: `bh-${crypto.randomUUID()}`,
    text,
    week: nextWeek,
    category: 'market' as const,
  }));

  // Generate headlines
  const newHeadlines = generateHeadlines(nextWeek, updatedRivals);

  // Random events
  const events: string[] = [];
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

  const newState: GameState = {
    ...state,
    week: nextWeek,
    cash: newCash,
    studio: { ...state.studio, prestige: state.studio.prestige + prestigeChange },
    projects: updatedProjects,
    buyers: updatedBuyers,
    talentPool: Array.from(talentPoolMap.values()),
    rivals: updatedRivals,
    awards: [...(state.awards || []), ...newAwards],
    headlines: [...formattedBuyerHeadlines, ...newHeadlines, ...state.headlines].slice(0, 50),
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

function handleAwardsCeremony(state: GameState, nextWeek: number) {
  let prestigeChange = 0;
  let newAwards: Award[] = [];
  const events: string[] = [];
  const projectUpdates: string[] = [];

  if (nextWeek % 52 === 0) {
    const year = Math.floor(nextWeek / 52);
    events.push(`Year ${year} Awards Ceremony!`);

    const ceremonyResult = runAwardsCeremony(state, year);

    newAwards = ceremonyResult.newAwards;
    prestigeChange = ceremonyResult.prestigeChange;
    projectUpdates.push(...ceremonyResult.projectUpdates);
  }

  return { prestigeChange, newAwards, events, projectUpdates };
}
