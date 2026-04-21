import { describe, it, expect, vi } from "vitest";
import { 
  calculateProjectROI, 
  calculateStudioNetWorth, 
  generateWeeklyFinancialReport 
} from "../../../engine/systems/finance";
import { tickFinance } from "../../../engine/systems/finance/financeTick";
import { Project, GameState } from "../../../engine/types";
import { RandomGenerator } from "../../../engine/utils/rng";
import { createMockGameState } from "../../mockFactory";

const mockProjectDev: import('../../../engine/types').Project = {
  id: "proj-1", title: "Test Dev", budgetTier: "low", budget: 500000, genre: "Comedy",
  state: "development", developmentWeeks: 2, productionWeeks: 2, weeksInPhase: 0,
  revenue: 0, weeklyRevenue: 0, weeklyCost: 10000, buzz: 50, format: "film", targetAudience: "general", flavor: "indie", releaseWeek: 0,
  momentum: 50, progress: 0, accumulatedCost: 0, activeCrisis: null,
  type: 'FILM', scriptHeat: 50, activeRoles: [], scriptEvents: []
} as import('../../../engine/types').FilmProject;

const mockProjectProd: import('../../../engine/types').Project = { ...mockProjectDev, id: "proj-2", state: "production", weeklyCost: 20000 } as any;
const mockProjectReleased: import('../../../engine/types').Project = { ...mockProjectDev, id: "proj-3", state: "released", weeklyCost: 0, weeklyRevenue: 100000 } as any;

describe("Finance System", () => {
  describe("calculateProjectROI", () => {
    it("returns correct ROI for a standard project", () => {
      const proj = { ...mockProjectReleased, budget: 1000000, revenue: 2000000 } as any;
      expect(calculateProjectROI(proj)).toBe(2.0);
    });
  });

  describe("calculateStudioNetWorth", () => {
    it("returns cash when there are no projects with catalog value", () => {
      const state = createMockGameState({
        finance: { ...createMockGameState().finance, cash: 500000 }
      });
      expect(calculateStudioNetWorth(state)).toBe(500000);
    });

    it("adds 100% of catalogValue if rightsOwner is 'studio'", () => {
       const p1: Project = { ...mockProjectReleased, ipRights: { rightsOwner: 'studio', catalogValue: 200000 } } as any;
       const state = createMockGameState({
         finance: { ...createMockGameState().finance, cash: 500000 },
         entities: {
           ...createMockGameState().entities,
           projects: { 'p1': p1 }
         }
       });
       expect(calculateStudioNetWorth(state)).toBe(700000);
    });
  });

  describe("generateWeeklyFinancialReport", () => {
    it("properly calculates burns, overhead, and box office", () => {
        const releasedWithDist = { 
          ...mockProjectReleased, 
          distributionStatus: 'theatrical' as const,
          weeklyRevenue: 100000 
        };
        const state = createMockGameState({
          week: 1,
          finance: { ...createMockGameState().finance, cash: 1000000 },
          entities: {
            ...createMockGameState().entities,
            projects: {
               'dev': mockProjectDev,
               'prod': mockProjectProd,
               'rel': releasedWithDist
            }
          }
        });

        const { report } = generateWeeklyFinancialReport(
          state,
          'player',
          state.entities.projects,
          state.finance.cash,
          state.studio.archetype,
          state.studio.prestige,
          [],
          [],
          new RandomGenerator(1)
        );
        // ExpenseProcessor.calculateStudioBurn(level 2, 2 active) = (500k * 1.25) + (2 * 75k) = 775k
        expect(report.expenses.overhead).toBe(775000);
        expect(report.expenses.production).toBe(20000); // Only mockProjectProd is in production
        expect(report.revenue.boxOffice).toBe(50000); // 100k * 0.5 decay = 50k
        expect(report.netProfit).toBe(50000 - 795000); // 50k rev - (775k overhead + 20k prod)
        expect(report.startingCash).toBe(1000000);
    });
  });

  describe("tickFinance", () => {
      it("returns StateImpact for funds change", () => {
         const rng = new RandomGenerator(12345);
         const releasedWithDist = { 
           ...mockProjectReleased, 
           distributionStatus: 'theatrical' as const,
           weeklyRevenue: 200000 
         };
         const state = createMockGameState({
           week: 1,
           finance: { ...createMockGameState().finance, cash: 1000000 },
           entities: {
             ...createMockGameState().entities,
             projects: {
                'prod': mockProjectProd,
                'rel': releasedWithDist
             }
           }
         });

         const impacts = tickFinance(state, rng);
         const impact = impacts.find(i => i.type === 'FUNDS_CHANGED');
         
         // Revenue: 200k * 0.5 (decay) = 100k
         // Expenses: 20k (prod) + [500k + (1 * 75k)] (overhead) = 595k
         // Net: 100k - 595k = -495k
         expect(impact?.payload.amount).toBe(-620000);
      });
  });
});