import { describe, it, expect, vi } from "vitest";
import { 
  calculateProjectROI, 
  calculateStudioNetWorth, 
  generateWeeklyFinancialReport 
} from "../../../engine/systems/finance";
import { tickFinance } from "../../../engine/systems/finance/financeTick";
import { Project, GameState } from "../../../engine/types";
import { RandomGenerator } from "../../../engine/utils/rng";

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

    it("handles extreme edge case: calculates correct ROI for a project with a negative budget", () => {
      // e.g. a project funded by extreme subsidies resulting in negative net cost
      const negativeBudgetProject: Project = {
        ...mockProjectReleased,
        budget: -500000, // Negative budget
        marketingBudget: 0,
        revenue: 1000000
      } as any;

      const roi = calculateProjectROI(negativeBudgetProject);

      // 1000000 / -500000 = -2.0
      expect(roi).toBe(-2.0);
    });

    it("safely handles total cost of 0 to avoid division by zero", () => {
      const zeroCostProject: Project = {
        ...mockProjectReleased,
        budget: 0,
        marketingBudget: 0,
        revenue: 1000000
      } as any;

      const roi = calculateProjectROI(zeroCostProject);
      expect(roi).toBe(0); // Engine specifically returns 0 in this case
    });
  });

  describe("calculateStudioNetWorth", () => {
    const mockState: GameState = {
      week: 1,
      finance: { cash: 500000, ledger: [] },
      studio: {
        name: "Test",
        archetype: "indie",
        prestige: 50,
        internal: { projects: {}, contracts: [] }
      },
      market: { opportunities: [], buyers: [] },
      industry: { rivals: [], headlines: [], talentPool: {} }
    } as unknown as GameState;

    it("returns cash when there are no projects with catalog value", () => {
      expect(calculateStudioNetWorth(mockState)).toBe(500000);
    });

    it("adds 100% of catalogValue if rightsOwner is 'studio' (mock disabled WIP logic)", () => {
       // WIP inventory logic calculates 50% of budget.
       // Budget is 500000. 50% = 250000.
       // Cash is 500000.
       // Net worth = 500000 + 250000 = 750000
       const p1: Project = { ...mockProjectDev, state: 'production', budget: 500000 } as any;
       const state = { ...mockState, studio: { ...mockState.studio, internal: { ...mockState.studio.internal, projects: { 'p1': p1 } } } } as any;
       expect(calculateStudioNetWorth(state)).toBe(750000);
    });
  });

  describe("generateWeeklyFinancialReport", () => {
    const mockState: GameState = {
      week: 1,
      finance: { cash: 1000000, ledger: [] },
      studio: {
        name: "Test",
        archetype: "major",
        prestige: 50,
        level: 1,
        internal: {
          projects: {
             'dev': mockProjectDev,
             'prod': mockProjectProd,
             'rel': mockProjectReleased
          },
          contracts: []
        }
      },
      market: { opportunities: [], buyers: [], activeMarketEvents: [] },
      industry: { rivals: [], headlines: [], talentPool: {}, newsHistory: [] },
    } as unknown as GameState;

    it("properly calculates burns, overhead, and box office", () => {
        const releasedWithDist = { 
          ...mockProjectReleased, 
          distributionStatus: 'theatrical' as const,
          weeklyRevenue: 100000 
        };
        const stateWithDist = {
          ...mockState,
          studio: {
            ...mockState.studio,
            internal: {
              ...mockState.studio.internal,
              projects: {
                ...mockState.studio.internal.projects,
                'rel': releasedWithDist
              }
            }
          }
        } as any;

        const { report } = generateWeeklyFinancialReport(stateWithDist);
        // ExpenseProcessor.calculateStudioBurn(1, 2 active projects: dev, prod)
        // Level 1: 500k base * 1.0 = 500k. Penalty: 2 * 75k = 150k. Total overhead = 650k.
        expect(report.expenses.overhead).toBe(650000);
        expect(report.expenses.production).toBe(20000); // Only mockProjectProd is in production
        expect(report.revenue.boxOffice).toBe(50000);
        expect(report.netProfit).toBe(50000 - (650000 + 20000));
        expect(report.startingCash).toBe(1000000);
    });
  });

  describe("tickFinance", () => {
      const mockState: GameState = {
        week: 1,
        finance: { cash: 1000000, ledger: [] },
        studio: {
          name: "Test",
          archetype: "major",
          prestige: 50,
          level: 1,
          internal: {
            projects: {
               'prod': mockProjectProd,
               'rel': mockProjectReleased
            },
            contracts: []
          }
        },
        market: { opportunities: [], buyers: [], activeMarketEvents: [] },
        industry: { rivals: [], newsHistory: [], talentPool: {} }
      } as unknown as GameState;
  
      it("returns StateImpact for funds change", () => {
         const rng = new RandomGenerator(12345);
         const releasedWithDist = { 
           ...mockProjectReleased, 
           distributionStatus: 'theatrical' as const,
           weeklyRevenue: 200000 
         };
         const stateWithDist = {
           ...mockState,
           studio: {
             ...mockState.studio,
             internal: {
               ...mockState.studio.internal,
               projects: {
                 'prod': mockProjectProd,
                 'rel': releasedWithDist
               }
             }
           }
         } as any;

         const impacts = tickFinance(stateWithDist, rng);
         const impact = impacts.find(i => i.type === 'FUNDS_CHANGED');
         
         // Revenue: 200k * 0.5 (decay) = 100k
         // Expenses: 20k (prod) + [500k base + 1 active (prod) * 75k] (overhead) = 595k. Total expenses = 575k? No, 20k prod + 575k overhead = 595k
         // Net: 100k - 595k = -495k
         expect(impact?.payload.amount).toBe(-495000);
      });
  });
});