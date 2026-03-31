import { expect, test, describe } from 'vitest';
import { calculateChemistry, ProductionEngine } from '../../../engine/systems/productionEngine';
import { Project, TalentProfile, GameState, TalentRole } from '../../../engine/types';

describe('productionEngine', () => {
  describe('calculateChemistry', () => {
    const baseProject: Project = {
      id: 'p1', title: 'Test Project', format: 'film', genre: 'Drama', budgetTier: 'low',
      budget: 1000000, weeklyCost: 10000, targetAudience: 'General Audience', flavor: 'A nice drama',
      status: 'development', buzz: 50, weeksInPhase: 0, developmentWeeks: 4, productionWeeks: 4,
      revenue: 0, weeklyRevenue: 0, releaseWeek: null
    };

    const createTalent = (id: string, roles: string[], ego: number, draw: number, perks: string[], skill?: number): TalentProfile => ({
      id, name: `Talent ${id}`, roles: roles as TalentRole[], prestige: 50, fee: 10000, draw,
      temperament: 'Normal', accessLevel: 'outsider', perks, ego, skill
    });

    test('Scripted Chemistry drops when traits conflict', () => {
      const p: Project = { ...baseProject, format: 'film' };
      const t1 = createTalent('t1', ['actor'], 50, 50, ['Diva', 'Difficult']);
      const t2 = createTalent('t2', ['actor'], 50, 50, ['Volatile']);

      const chem = calculateChemistry(p, [t1, t2]);
      expect(chem).toBeLessThan(50); // It subtracts for diva, difficult, volatile
    });

    test('Ensemble Chemistry spikes when traits conflict (Docu-soap)', () => {
      const p: Project = {
        ...baseProject,
        format: 'unscripted',
        unscriptedFormat: 'reality_ensemble',
        // Mock template on the project directly if types allow, else we just test the branch condition by casting locally or providing the structure
        template: { castingRequirements: [{ roleType: 'ENSEMBLE', count: 2 }] }
      } as unknown as Project; // Use unknown -> Project to avoid 'any' but still satisfy the function's internal check if it expects optional undocumented properties on Project in testing.

      const t1 = createTalent('t1', ['actor'], 80, 50, ['Diva']);
      const t2 = createTalent('t2', ['actor'], 80, 50, ['Hot-Headed']);

      const chem = calculateChemistry(p, [t1, t2]);
      expect(chem).toBeGreaterThan(80); // Base 50 + 30 conflict + (80 * 0.4) = ~112, clamped to 100
      expect(chem).toBe(100);
    });

    test('Returns 50 for empty talent list', () => {
      const p: Project = { ...baseProject, format: 'film' };
      const chem = calculateChemistry(p, []);
      expect(chem).toBe(50);
    });

    test('Calculates correctly for talent with 0 skill but 100 ego', () => {
      const p: Project = { ...baseProject, format: 'film' };
      const t1 = createTalent('t1', ['actor'], 100, 0, [], 0); // 0 skill/draw, 100 ego
      const chem = calculateChemistry(p, [t1]);

      // avgActing = 0
      // synergyScore = 0
      // base 50 + 0 + 0 = 50
      expect(chem).toBe(50);
    });

    test('HOST chemistry correctly adds charisma and variety bonus', () => {
      const p: Project = {
        ...baseProject,
        format: 'unscripted',
        template: { castingRequirements: [{ roleType: 'HOST', count: 1 }] }
      } as unknown as Project;

      const t1 = createTalent('t1', ['showrunner'], 50, 80, ['Diva']);
      const t2 = createTalent('t2', ['actor'], 50, 50, ['Hot-Headed', 'Reliable']);

      const chem = calculateChemistry(p, [t1, t2]);
      // Host charismaBonus: 80 * 0.5 = 40
      // Unique traits: 'Diva', 'Hot-Headed', 'Reliable' -> 3 unique -> Math.min(30, 3 * 5 = 15) = 15
      // Base 50 + 40 + 15 = 105 -> clamped to 100
      expect(chem).toBe(100);
    });

    test('Calculates correctly for talent with negative stats (ego/draw/skill)', () => {
      const p: Project = { ...baseProject, format: 'film' };
      const t1 = createTalent('t1', ['actor'], -50, -20, ['Collaborative'], -10);
      const chem = calculateChemistry(p, [t1]);
      // synergyScore = 10
      // avgActing = -10 (skill)
      // base 50 + 10 + (-10 * 0.4) = 56
      expect(chem).toBe(56);
    });

    test('Clamps chemistry to minimum 1 for extreme negative synergy', () => {
      const p: Project = { ...baseProject, format: 'film' };
      const t1 = createTalent('t1', ['actor'], 100, -100, ['Diva', 'Difficult', 'Volatile'], -100);
      const t2 = createTalent('t2', ['actor'], 100, -100, ['Diva', 'Difficult', 'Volatile'], -100);
      const chem = calculateChemistry(p, [t1, t2]);
      // synergyScore = -25 * 2 = -50
      // avgActing = -100
      // base 50 - 50 - 40 = -40, clamped to 1
      expect(chem).toBe(1);
    });

    test('Calculates unscripted ensemble chemistry with negative ego', () => {
      const p: Project = {
        ...baseProject,
        format: 'unscripted',
        template: { castingRequirements: [{ roleType: 'ENSEMBLE', count: 2 }] }
      } as unknown as Project;

      const t1 = createTalent('t1', ['actor'], -100, 50, []);
      const t2 = createTalent('t2', ['actor'], -100, 50, []);

      const chem = calculateChemistry(p, [t1, t2]);
      // avgDrama = -100
      // base 50 + 0 + (-100 * 0.4) = 10
      expect(chem).toBe(10);
    });

    test('Calculates unscripted host chemistry with missing perks', () => {
      const p: Project = {
        ...baseProject,
        format: 'unscripted',
        template: { castingRequirements: [{ roleType: 'HOST', count: 1 }] }
      } as unknown as Project;

      const t1 = createTalent('t1', ['showrunner'], 50, 80, []);
      delete t1.perks; // Ensure perks is undefined safely without any cast

      const chem = calculateChemistry(p, [t1]);
      // charisma = 40, variety = 0
      expect(chem).toBe(90);
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
            projects: {},
            contracts: [],
            financeHistory: []
          }
        },
        market: { opportunities: [], buyers: [] },
        industry: { rivals: [], headlines: [], families: [], agencies: [], agents: [], talentPool: {}, newsHistory: [] },
        culture: { genrePopularity: {} },
        finance: { bankBalance: 1000000, yearToDateRevenue: 0, yearToDateExpenses: 0 },
        history: []
      };

      const result = ProductionEngine.transitionToProduction(emptyState, "nonexistent-project", "Test Headline");
      // The function should return the state unchanged and undefined headline
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
            projects: { "p1": project },
            contracts: [],
            financeHistory: []
          }
        },
        market: { opportunities: [], buyers: [] },
        industry: { rivals: [], headlines: [], families: [], agencies: [], agents: [], talentPool: {}, newsHistory: [] },
        culture: { genrePopularity: {} },
        finance: { bankBalance: 1000000, yearToDateRevenue: 0, yearToDateExpenses: 0 },
        history: []
      };

      const result = ProductionEngine.transitionToProduction(state, "p1", "Test Project begins production!");
      expect(result.newState.studio.internal.projects["p1"].status).toBe("production");
      expect(result.newState.studio.internal.projects["p1"].weeksInPhase).toBe(0);
      expect(result.headline).toBeDefined();
      expect(result.headline?.text).toBe("Test Project begins production!");
      expect(result.newState.industry.headlines).toHaveLength(1);
    });

    test('successfully transitions a project with a negative budget and extra updates', () => {
      const project: Project = {
        id: "p2", title: "Test Negative Budget", budgetTier: "low", budget: -500000, genre: "Comedy",
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
          culture: { prestigeVsCommercial: 0, talentFriendlyVsControlling: 0, nicheVsBroad: 0, filmFirstVsTvFirst: 0 },
          internal: {
            projects: { "p2": project },
            contracts: [],
            financeHistory: []
          }
        },
        market: { opportunities: [], buyers: [] },
        industry: { rivals: [], headlines: [], families: [], agencies: [], agents: [], talentPool: {}, newsHistory: [] },
        culture: { genrePopularity: {} },
        finance: { bankBalance: 1000000, yearToDateRevenue: 0, yearToDateExpenses: 0 },
        history: []
      };

      const result = ProductionEngine.transitionToProduction(state, "p2", "Headline", { buzz: 100 });
      expect(result.newState.studio.internal.projects["p2"].status).toBe("production");
      expect(result.newState.studio.internal.projects["p2"].buzz).toBe(100);
      expect(result.newState.studio.culture).toBeDefined();
      expect(result.newState.industry.headlines[0].category).toBe('market');
    });
  });

  describe('processProductionTick', () => {
    test('returns project unchanged as placeholder', () => {
      const project: Project = {
        id: "p3", title: "Tick Test", budgetTier: "low", budget: 1000, genre: "Comedy",
        status: "production", developmentWeeks: 2, productionWeeks: 2, weeksInPhase: 1,
        revenue: 0, weeklyRevenue: 0, weeklyCost: 10000, buzz: 50, format: "film", targetAudience: "general", flavor: "indie", releaseWeek: 0
      };

      const newProject = ProductionEngine.processProductionTick(project);
      expect(newProject).toStrictEqual(project);
    });
  });
});
