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
    const revNormal = calculateWeeklyRevenue([normalProject], [], []);
    expect(revNormal).toBe(50000);

    // Cult classic project overrides low base with ironic viewing multiplier
    const cultProject = { ...baseProject, isCultClassic: true, weeklyRevenue: 50000 };
    const revCult = calculateWeeklyRevenue([cultProject], [], []);

    // applyIronicViewingMultiplier gives Math.max(50000 * 1.5, 100000)
    expect(revCult).toBe(100000); // Because 50000 * 1.5 = 75000, so it hits the 100000 minimum floor
  });
});
