import { Project } from '../types';
import { BUDGET_TIERS } from '../data/budgetTiers';
import { clamp, randRange } from '../utils';

export function advanceProject(
  project: Project,
  currentWeek: number,
  studioPrestige: number,
): { project: Project; update: string | null } {
  if (project.status === 'archived') return { project, update: null };

  const p = { ...project, weeksInPhase: project.weeksInPhase + 1 };
  let update: string | null = null;

  if (p.status === 'development' && p.weeksInPhase >= p.developmentWeeks) {
    p.status = 'production';
    p.weeksInPhase = 0;
    update = `"${p.title}" enters production`;
  } else if (p.status === 'production' && p.weeksInPhase >= p.productionWeeks) {
    p.status = 'released';
    p.weeksInPhase = 0;
    p.releaseWeek = currentWeek;
    const tier = BUDGET_TIERS[p.budgetTier];
    const [minRev, maxRev] = tier.revenueRange;
    const buzzFactor = p.buzz / 100;
    const prestigeFactor = 0.5 + studioPrestige / 200;
    const randomFactor = randRange(0.7, 1.3);
    const totalGross = minRev + (maxRev - minRev) * buzzFactor * prestigeFactor * randomFactor;
    p.weeklyRevenue = totalGross * 0.35;
    p.revenue = 0;
    const strength = p.weeklyRevenue > totalGross * 0.25 ? 'strong' : 'modest';
    update = `"${p.title}" releases to a ${strength} opening!`;
  } else if (p.status === 'released') {
    p.revenue += p.weeklyRevenue;
    p.weeklyRevenue *= randRange(0.5, 0.7);
    if (p.weeklyRevenue < 100_000 || p.weeksInPhase > 12) {
      p.status = 'archived';
      update = `"${p.title}" completes its run — total gross: $${(p.revenue / 1_000_000).toFixed(1)}M`;
    }
  }

  // Buzz drift during active phases
  if (p.status === 'development' || p.status === 'production') {
    p.buzz = clamp(p.buzz + randRange(-4, 6), 0, 100);
  }

  return { project: p, update };
}
