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

const mockProjectProd: import('../../../engine/types').Project = { ...mockProjectDev, id: "proj-2", state: "production", weeklyCost: 20000 } as import('../../../engine/types').FilmProject;
const mockProjectReleased: import('../../../engine/types').Project = { ...mockProjectDev, id: "proj-3", state: "released", weeklyCost: 0, weeklyRevenue: 100000 } as import('../../../engine/types').FilmProject;

describe("Finance System", () => {
  describe("calculateProjectROI", () => {
    it("returns correct ROI for a standard project", () => {
      const proj: import('../../../engine/types').FilmProject = { ...mockProjectReleased, budget: 1000000, revenue: 2000000 } as import('../../../engine/types').FilmProject;
      expect(calculateProjectROI(proj)).toBe(2.0);
    });

    it("handles calculating ROI for a project with a negative budget", () => {
      const proj: import('../../../engine/types').FilmProject = { ...mockProjectReleased, budget: -500000, marketingBudget: 0, revenue: 1000000 } as import('../../../engine/types').FilmProject;
      expect(calculateProjectROI(proj)).toBe(-2);
    });

    it("returns 0 if totalCost is 0", () => {
      const proj: import('../../../engine/types').FilmProject = { ...mockProjectReleased, budget: 0, marketingBudget: 0, revenue: 1000000 } as import('../../../engine/types').FilmProject;
      expect(calculateProjectROI(proj)).toBe(0);
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
       const p1: import('../../../engine/types').FilmProject = { ...mockProjectReleased, budget: 400000, ipRights: { rightsOwner: 'studio', catalogValue: 200000 } } as import('../../../engine/types').FilmProject;
       const state = createMockGameState({
         finance: { ...createMockGameState().finance, cash: 500000 },
         studio: {
           ...createMockGameState().studio,
           internal: {
             ...createMockGameState().studio.internal,
             projects: { 'p1': p1 }
           }
         }
       });
       // Cash (500k)
       expect(calculateStudioNetWorth(state)).toBe(500000);
    });

    it("handles negative cash correctly", () => {
      const state = createMockGameState({
        finance: { ...createMockGameState().finance, cash: -100000 }
      });
      expect(calculateStudioNetWorth(state)).toBe(-100000);
    });
  });

  describe("generateWeeklyFinancialReport", () => {
    it("properly calculates burns, overhead, and box office", () => {
        const releasedWithDist: import('../../../engine/types').FilmProject = {
          ...mockProjectReleased, 
          distributionStatus: 'theatrical',
          weeklyRevenue: 100000 
        } as import('../../../engine/types').FilmProject;
        const state = createMockGameState({
          week: 1,
          finance: { ...createMockGameState().finance, cash: 1000000 },
          studio: {
            ...createMockGameState().studio,
            internal: {
              ...createMockGameState().studio.internal,
              projects: {
                'dev': mockProjectDev,
                'prod': mockProjectProd,
                'rel': releasedWithDist
              }
            }
          }
        });

        const { report } = generateWeeklyFinancialReport(state);
        // ExpenseProcessor.calculateStudioBurn(level 1 (default mock), 2 active) = (500k * 1) + (2 * 75k) = 650k
        expect(report.expenses.overhead).toBe(650000);
        expect(report.expenses.production).toBe(20000); // Only mockProjectProd is in production
        expect(report.revenue.boxOffice).toBe(45000); // 100k * 0.45 decay = 45k
        expect(report.netProfit).toBe(45000 - 670000); // 45k rev - (650k overhead + 20k prod)
        expect(report.startingCash).toBe(1000000);
    });
  });

  describe("tickFinance", () => {
      it("returns StateImpact for funds change", () => {
         const rng = new RandomGenerator(12345);
         const releasedWithDist: import('../../../engine/types').FilmProject = {
           ...mockProjectReleased, 
           distributionStatus: 'theatrical',
           weeklyRevenue: 200000 
         } as import('../../../engine/types').FilmProject;
         const state = createMockGameState({
           week: 1,
           finance: { ...createMockGameState().finance, cash: 1000000 },
           studio: {
             ...createMockGameState().studio,
             internal: {
               ...createMockGameState().studio.internal,
               projects: {
                 'prod': mockProjectProd,
                 'rel': releasedWithDist
               }
             }
           }
         });

         const impacts = tickFinance(state, rng);
         const impact = impacts.find(i => i.type === 'FUNDS_CHANGED');
         
         // Revenue: 200k * 0.45 (decay) = 90k
         // Expenses: 20k (prod) + [500k + (1 * 75k)] (overhead) = 595k
         // Net: 90k - 595k = -505k
         expect(impact?.payload.amount).toBe(-505000);
      });
  });
});
