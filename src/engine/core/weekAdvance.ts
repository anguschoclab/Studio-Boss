import { GameState, WeekSummary, Award } from '../types';
import { calculateWeeklyCosts, calculateWeeklyRevenue } from '../systems/finance';
import { advanceProject } from '../systems/projects';
import { updateRival } from '../systems/rivals';
import { generateHeadlines } from '../generators/headlines';
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
  const newAwards: Award[] = [];
  if (nextWeek % 52 === 0) {
    const year = Math.floor(nextWeek / 52);
    events.push(`Year ${year} Awards Ceremony!`);

    // Simple logic: projects released this year with high total quality/buzz have a chance to win
    const eligibleProjects = state.projects.filter(p => p.status === 'released' || p.status === 'archived');
    // Only count projects released roughly in the last 52 weeks
    const recentProjects = eligibleProjects.filter(p => p.releaseWeek !== null && p.releaseWeek > nextWeek - 52);

    if (recentProjects.length > 0) {
        // Find best project
        const bestProject = recentProjects.sort((a, b) => {
            const aContracts = state.contracts.filter(c => c.projectId === a.id);
            const aCraft = aContracts.reduce((sum, c) => {
                const t = state.talentPool.find(tp => tp.id === c.talentId);
                return sum + (t ? t.craft : 0);
            }, 0);

            const bContracts = state.contracts.filter(c => c.projectId === b.id);
            const bCraft = bContracts.reduce((sum, c) => {
                const t = state.talentPool.find(tp => tp.id === c.talentId);
                return sum + (t ? t.craft : 0);
            }, 0);
            return (b.revenue + bCraft * 1000000) - (a.revenue + aCraft * 1000000);
        })[0];

        // If it's somewhat good, award it
        if (bestProject && Math.random() < 0.3 + (state.studio.prestige / 200)) {
            newAwards.push({
                id: `award-${crypto.randomUUID()}`,
                projectId: bestProject.id,
                name: 'Best Picture',
                category: 'Top Honor',
                year,
            });
            prestigeChange += 5;
            projectUpdates.push(`🏆 "${bestProject.title}" wins Best Picture at the annual awards!`);
        }
    }
  }

  const newState: GameState = {
    ...state,
    week: nextWeek,
    cash: newCash,
    studio: { ...state.studio, prestige: state.studio.prestige + prestigeChange },
    projects: updatedProjects,
    rivals: updatedRivals,
    awards: [...state.awards, ...newAwards],
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
