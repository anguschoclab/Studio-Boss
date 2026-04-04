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
    // Normal project
    const normalProject = { ...baseProject, weeklyRevenue: 50000 };
    const mockStateNormal = {
      studio: { internal: { projects: { p1: { ...normalProject, distributionStatus: 'theatrical' } } } },
      market: { buyers: [] }
    } as any;
    const revNormal = calculateWeeklyRevenue(mockStateNormal);
    expect(revNormal).toBe(20000); // 50000 * 0.40

    // Cult classic project overrides low base with ironic viewing multiplier
    const cultProject = { ...baseProject, isCultClassic: true, weeklyRevenue: 50000 };
    const mockStateCult = {
      studio: { internal: { projects: { p1: { ...cultProject, distributionStatus: 'theatrical' } } } },
      market: { buyers: [] }
    } as any;
    const revCult = calculateWeeklyRevenue(mockStateCult);

    // applyIronicViewingMultiplier gives Math.max(20000 * 1.8, 150000)
    expect(revCult).toBe(150000); // Because 20000 * 1.8 = 36000, so it hits the 150000 minimum floor
  });
});
