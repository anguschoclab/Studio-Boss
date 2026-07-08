import { describe, it, expect } from 'vitest';
import { RivalStudio, Project } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';
import { RivalRevenueCalculator } from '@/engine/systems/rivals/RivalRevenueCalculator';
import { createMockRival } from '@/test/utils/mockFactories';

function releasedProject(ownerId: string): Project {
  return {
    id: `proj-${ownerId}`,
    title: 'Rival Film',
    type: 'FILM',
    format: 'film',
    genre: 'Action',
    budgetTier: 'high',
    budget: 80_000_000,
    weeklyCost: 8_000_000,
    targetAudience: 'Broad',
    flavor: 'Rival blockbuster',
    state: 'released',
    buzz: 80,
    weeksInPhase: 0,
    developmentWeeks: 12,
    productionWeeks: 16,
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: 5,
    ownerId,
    distributionStatus: 'theatrical',
    boxOffice: { openingWeekendDomestic: 50_000_000, openingWeekendForeign: 20_000_000, totalDomestic: 200_000_000, totalForeign: 100_000_000, multiplier: 3 },
    reviewScore: 75,
    rating: 'PG-13',
  } as unknown as Project;
}

describe('RivalRevenueCalculator — integration', () => {
  it('returns > 0 once a rival owns a released project', () => {
    const rival: RivalStudio = {
      ...createMockRival({ id: 'r1' }),
      projects: { 'proj-r1': releasedProject('r1') },
    };
    const revenue = RivalRevenueCalculator.calculateWeeklyRevenue(rival, 10, new RandomGenerator(1), { entities: { projects: { 'proj-r1': releasedProject('r1') } } } as any);
    expect(revenue.total).toBeGreaterThan(0);
  });

  it('returns 0 when the rival owns no released projects', () => {
    const rival = createMockRival({ id: 'r1' });
    const revenue = RivalRevenueCalculator.calculateWeeklyRevenue(rival, 10, new RandomGenerator(1), { entities: { projects: {} } } as any);
    expect(revenue.total).toBe(0);
  });
});
