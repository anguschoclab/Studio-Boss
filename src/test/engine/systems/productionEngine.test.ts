import { expect, test, describe } from 'vitest';
import { calculateChemistry, ProductionEngine } from '../../../engine/systems/productionEngine';
import { Project, TalentProfile, GameState } from '../../../engine/types';

describe('productionEngine', () => {
  describe('calculateChemistry', () => {
    const baseProject: Project = {
      id: 'p1', title: 'Test Project', format: 'film', genre: 'Drama', budgetTier: 'low',
      budget: 1000000, weeklyCost: 10000, targetAudience: 'General Audience', flavor: 'A nice drama',
      status: 'development', buzz: 50, weeksInPhase: 0, developmentWeeks: 4, productionWeeks: 4,
      revenue: 0, weeklyRevenue: 0, releaseWeek: null
    };

    const createTalent = (id: string, roles: string[], ego: number, draw: number, perks: string[], skill?: number): TalentProfile => ({
      id, name: `Talent ${id}`, roles: roles as any, prestige: 50, fee: 10000, draw,
      temperament: 'Normal', accessLevel: 'outsider', perks, ego, skill
    });

    test('Scripted Chemistry drops when traits conflict', () => {
      const p = { ...baseProject, format: 'film' as const };
      const t1 = createTalent('t1', ['actor'], 50, 50, ['Diva', 'Difficult']);
      const t2 = createTalent('t2', ['actor'], 50, 50, ['Volatile']);

      const chem = calculateChemistry(p, [t1, t2]);
      expect(chem).toBeLessThan(50); // It subtracts for diva, difficult, volatile
    });

    test('Ensemble Chemistry spikes when traits conflict (Docu-soap)', () => {
      const p: Project | any = {
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

    test('Returns 50 for empty talent list', () => {
      const p = { ...baseProject, format: 'film' as const };
      const chem = calculateChemistry(p, []);
      expect(chem).toBe(50);
    });

    test('Calculates correctly for talent with 0 skill but 100 ego', () => {
      const p = { ...baseProject, format: 'film' as const };
      const t1 = createTalent('t1', ['actor'], 100, 0, [], 0); // 0 skill/draw, 100 ego
      const chem = calculateChemistry(p, [t1]);

      // avgActing = 0
      // synergyScore = 0
      // base 50 + 0 + 0 = 50
      expect(chem).toBe(50);
    });

    test('HOST chemistry correctly adds charisma and variety bonus', () => {
      const p: Project | any = {
        ...baseProject,
        format: 'unscripted',
        template: { castingRequirements: [{ roleType: 'HOST', count: 1 }] }
      };

      const t1 = createTalent('t1', ['showrunner'], 50, 80, ['Diva']);
      const t2 = createTalent('t2', ['actor'], 50, 50, ['Hot-Headed', 'Reliable']);

      const chem = calculateChemistry(p, [t1, t2]);
      // Host charismaBonus: 80 * 0.5 = 40
      // Unique traits: 'Diva', 'Hot-Headed', 'Reliable' -> 3 unique -> Math.min(30, 3 * 5 = 15) = 15
      // Base 50 + 40 + 15 = 105 -> clamped to 100
      expect(chem).toBe(100);
    });
  });

  describe('transitionToProduction', () => {
    test('handles an invalid/empty pipeline gracefully', () => {
      const emptyState: GameState = {
        week: 1,
        cash: 1000000,
        studio: {
          name: "Test Studio",
          archetype: "major",
          prestige: 50,
          internal: {
            projects: [],
            contracts: [],
            financeHistory: []
          }
        },
        market: { opportunities: [], buyers: [] },
        industry: { rivals: [], headlines: [], families: [], agencies: [], agents: [], talentPool: [], newsHistory: [] },
        culture: { genrePopularity: {} },
        finance: { bankBalance: 1000000, yearToDateRevenue: 0, yearToDateExpenses: 0 },
        history: []
      };

      const result = ProductionEngine.transitionToProduction(emptyState, "nonexistent-project", "Test Headline");
      expect(result.newState).toStrictEqual(emptyState);
      expect(result.headline).toBeUndefined();
    });

    test('successfully transitions a project to production', () => {
      const project: Project = {
        id: "p1", title: "Test Dev Project", budgetTier: "low", budget: 500000, genre: "Comedy",
        status: "development", developmentWeeks: 2, productionWeeks: 2, weeksInPhase: 1,
        revenue: 0, weeklyRevenue: 0, weeklyCost: 10000, buzz: 50, format: "film", targetAudience: "general", flavor: "indie", releaseWeek: 0
      };

      const state: GameState = {
        week: 1,
        cash: 1000000,
        studio: {
          name: "Test Studio",
          archetype: "major",
          prestige: 50,
          internal: {
            projects: [project],
            contracts: [],
            financeHistory: []
          }
        },
        market: { opportunities: [], buyers: [] },
        industry: { rivals: [], headlines: [], families: [], agencies: [], agents: [], talentPool: [], newsHistory: [] },
        culture: { genrePopularity: {} },
        finance: { bankBalance: 1000000, yearToDateRevenue: 0, yearToDateExpenses: 0 },
        history: []
      };

      const result = ProductionEngine.transitionToProduction(state, "p1", "Test Project begins production!");
      expect(result.newState.studio.internal.projects[0].status).toBe("production");
      expect(result.newState.studio.internal.projects[0].weeksInPhase).toBe(0);
      expect(result.headline).toBeDefined();
      expect(result.headline?.text).toBe("Test Project begins production!");
      expect(result.newState.industry.headlines).toHaveLength(1);
    });
  });
});