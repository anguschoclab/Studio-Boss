import { GameState, WeekSummary, Award } from '../types';
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

  // Advance projects
  const updatedProjects = state.projects.map(p => {
    const projectContracts = state.contracts.filter(c => c.projectId === p.id);
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
