import { Project, Contract, TalentProfile } from '../types';
import { BUDGET_TIERS } from '../data/budgetTiers';
import { clamp, randRange } from '../utils';

export function advanceProject(
  project: Project,
  currentWeek: number,
  studioPrestige: number,
  projectContracts: Contract[],
  talentPool: TalentProfile[]
): { project: Project; update: string | null } {
  if (project.status === 'archived') return { project, update: null };

  const p = { ...project, weeksInPhase: project.weeksInPhase + 1 };
  let update: string | null = null;

  if (p.status === 'development' && p.weeksInPhase >= p.developmentWeeks) {
    if (p.format === 'tv') {
      p.status = 'pitching';
      p.weeksInPhase = 0;
      update = `"${p.title}" is ready to be pitched to networks/streamers.`;
    } else {
      p.status = 'production';
      p.weeksInPhase = 0;
      update = `"${p.title}" enters production`;
    }
  } else if (p.status === 'production' && p.weeksInPhase >= p.productionWeeks) {
    p.status = 'released';
    p.weeksInPhase = 0;
    p.releaseWeek = currentWeek;
    const tier = BUDGET_TIERS[p.budgetTier];
    const [minRev, maxRev] = tier.revenueRange;
    const buzzFactor = p.buzz / 100;
    const prestigeFactor = 0.5 + studioPrestige / 200;
    const randomFactor = randRange(0.7, 1.3);

    // Talent impact
    const attachedTalent = projectContracts.map(c => talentPool.find(t => t.id === c.talentId)).filter(t => t !== undefined) as TalentProfile[];
    const talentDrawFactor = attachedTalent.reduce((sum, t) => sum + (t.draw / 100), 1);

    const totalGross = (minRev + (maxRev - minRev) * buzzFactor * prestigeFactor * randomFactor) * talentDrawFactor;
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
    const attachedTalent = projectContracts.map(c => talentPool.find(t => t.id === c.talentId)).filter(t => t !== undefined) as TalentProfile[];
    const talentBuzzBonus = attachedTalent.reduce((sum, t) => sum + (t.draw / 50), 0);
    p.buzz = clamp(p.buzz + randRange(-4, 6) + talentBuzzBonus, 0, 100);
  }

  return { project: p, update };
}
