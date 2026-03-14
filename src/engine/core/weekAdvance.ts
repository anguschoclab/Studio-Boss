import { GameState, WeekSummary, Award, Contract } from '../types';
import { calculateWeeklyCosts, calculateWeeklyRevenue } from '../systems/finance';
import { advanceProject } from '../systems/projects';
import { updateRival } from '../systems/rivals';
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

  // Advance projects
  const updatedProjects = state.projects.map(p => {
    const projectContracts = contractsByProject.get(p.id) || [];
    const { project, update } = advanceProject(p, nextWeek, state.studio.prestige, projectContracts, state.talentPool);
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

  // Generate headlines
  const newHeadlines = generateHeadlines(nextWeek, updatedRivals);

  // Random events
  const events: string[] = [];
  if (Math.random() < 0.15) {
    events.push(pick(EVENT_POOL));
  }

    // Awards logic (Week 52)
  let prestigeChange = 0;
  let newAwards: Award[] = [];
  if (nextWeek % 52 === 0) {
    const year = Math.floor(nextWeek / 52);
    events.push(`Year ${year} Awards Ceremony!`);

    const ceremonyResult = runAwardsCeremony(state, year);

    newAwards = ceremonyResult.newAwards;
    prestigeChange = ceremonyResult.prestigeChange;
    projectUpdates.push(...ceremonyResult.projectUpdates);
  }

  const newState: GameState = {
    ...state,
    week: nextWeek,
    cash: newCash,
    studio: { ...state.studio, prestige: state.studio.prestige + prestigeChange },
    projects: updatedProjects,
    rivals: updatedRivals,
    awards: [...(state.awards || []), ...newAwards],
    headlines: [...newHeadlines, ...state.headlines].slice(0, 50),
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
