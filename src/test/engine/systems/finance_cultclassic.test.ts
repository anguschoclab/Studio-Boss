import { describe, expect, test } from 'vitest';
import { calculateWeeklyRevenue } from '../../../engine/systems/finance';
import { Project } from '../../../engine/types';
import { createMockGameState } from '../../utils/mockFactories';

describe('Finance: Cult Classic Revenue', () => {
  const baseProject: Project = {
    id: 'p1', title: 'Flop', format: 'film', genre: 'Drama', budgetTier: 'low',
    budget: 1000000, weeklyCost: 10000, targetAudience: 'General Audience', flavor: 'A nice drama',
    state: 'released', buzz: 50, weeksInPhase: 0, developmentWeeks: 4, productionWeeks: 4,
    revenue: 0, weeklyRevenue: 50000, releaseWeek: 1
  } as Project;

  test('Cult Classic projects generate long-tail revenue minimums', () => {
    // Normal project
    const normalProject = { ...baseProject, weeklyRevenue: 50000 };
    const stateNormal = createMockGameState();
    stateNormal.entities.projects['p1'] = { ...normalProject, distributionStatus: 'theatrical' } as any;
    
    const revNormal = calculateWeeklyRevenue(stateNormal);
    expect(revNormal).toBe(7500); // 50000 * 0.15

    // Cult classic project overrides low base with ironic viewing multiplier
    const cultProject = { ...baseProject, isCultClassic: true, weeklyRevenue: 50000 };
    const stateCult = createMockGameState();
    stateCult.entities.projects['p1'] = { ...cultProject, distributionStatus: 'theatrical' } as any;
    
    const revCult = calculateWeeklyRevenue(stateCult);

    // applyIronicViewingMultiplier gives Math.max(7500 * 2.0, 50000)
    expect(revCult).toBe(50000); // Because 7500 * 2.0 = 15000, so it hits the 50000 minimum floor
  });
});
