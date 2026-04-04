import { describe, expect, test } from 'vitest';
import { calculateWeeklyRevenue } from '../../../engine/systems/finance';
import { Project } from '../../../engine/types';

describe('Finance: Cult Classic Revenue', () => {
  const baseProject: Project = {
    id: 'p1', title: 'Flop', format: 'film', genre: 'Drama', budgetTier: 'low',
    budget: 1000000, weeklyCost: 10000, targetAudience: 'General Audience', flavor: 'A nice drama',
    state: 'released', buzz: 50, weeksInPhase: 0, developmentWeeks: 4, productionWeeks: 4,
    revenue: 0, weeklyRevenue: 50000, releaseWeek: null
  } as Project;

  it('Cult Classic projects generate long-tail revenue minimums', () => {
    // calculateWeeklyRevenue expects a state object. We need to mock it properly.
    const stateWithNormalProject = {
      studio: { internal: { projects: { p1: { ...baseProject, weeklyRevenue: 50000, distributionStatus: 'theatrical' } } } },
      market: { buyers: [] }
    } as any;
    const revNormal = calculateWeeklyRevenue(stateWithNormalProject);
    expect(revNormal).toBe(17500); // 50000 * 0.35

    const stateWithCultProject = {
      studio: { internal: { projects: { p1: { ...baseProject, isCultClassic: true, weeklyRevenue: 50000, distributionStatus: 'theatrical' } } } },
      market: { buyers: [] }
    } as any;
    const revCult = calculateWeeklyRevenue(stateWithCultProject);

    // applyIronicViewingMultiplier gives Math.max(17500 * 1.8, 200000)
    expect(revCult).toBe(200000); // Because 17500 * 1.8 = 31500, so it hits the 200000 minimum floor
  });
});
