import { expect, test, describe } from 'bun:test';
import { calculateChemistry } from '../../../engine/systems/productionEngine';
import { Project, TalentProfile } from '../../../engine/types';

describe('productionEngine: calculateChemistry', () => {
  const baseProject: Project = {
    id: 'p1', title: 'Test Project', format: 'film', genre: 'Drama', budgetTier: 'low',
    budget: 1000000, weeklyCost: 10000, targetAudience: 'General Audience', flavor: 'A nice drama',
    status: 'development', buzz: 50, weeksInPhase: 0, developmentWeeks: 4, productionWeeks: 4,
    revenue: 0, weeklyRevenue: 0, releaseWeek: null
  };

  const createTalent = (id: string, roles: string[], ego: number, draw: number, perks: string[]): TalentProfile => ({
    id, name: `Talent ${id}`, roles: roles as any, prestige: 50, fee: 10000, draw,
    temperament: 'Normal', accessLevel: 'outsider', perks, ego
  });

  test('Scripted Chemistry drops when traits conflict', () => {
    const p = { ...baseProject, format: 'film' as const };
    const t1 = createTalent('t1', ['actor'], 50, 50, ['Diva', 'Difficult']);
    const t2 = createTalent('t2', ['actor'], 50, 50, ['Volatile']);

    const chem = calculateChemistry(p, [t1, t2]);
    expect(chem).toBeLessThan(50); // It subtracts for diva, difficult, volatile
  });

  test('Ensemble Chemistry spikes when traits conflict (Docu-soap)', () => {
    const p: Project = {
      ...baseProject,
      format: 'unscripted',
      template: { castingRequirements: [{ roleType: 'ENSEMBLE', count: 2 }] }
    };

    const t1 = createTalent('t1', ['actor'], 80, 50, ['Diva']);
    const t2 = createTalent('t2', ['actor'], 80, 50, ['Hot-Headed']);

    const chem = calculateChemistry(p, [t1, t2]);
    expect(chem).toBeGreaterThan(80); // Base 50 + 30 conflict + (80 * 0.4) = ~112, clamped to 100
    expect(chem).toBe(100);
  });
});
