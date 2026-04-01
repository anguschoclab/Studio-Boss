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

    it("adds 100% of catalogValue if rightsOwner is 'studio'", () => {
       const p1: Project = { ...mockProjectReleased, ipRights: { rightsOwner: 'studio', catalogValue: 200000 } } as any;
       const state = { ...mockState, studio: { ...mockState.studio, internal: { ...mockState.studio.internal, projects: { 'p1': p1 } } } } as any;
       expect(calculateStudioNetWorth(state)).toBe(700000);
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
        // ExpenseProcessor.calculateStudioBurn(1, 2 active) = 500k + 250k + (2 * 50k) = 850k
        expect(report.expenses.overhead).toBe(850000);
        expect(report.expenses.production).toBe(20000); // Only mockProjectProd is in production
        expect(report.revenue.boxOffice).toBe(50000);
        expect(report.netProfit).toBe(50000 - 870000);
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
         // Expenses: 20k (prod) + [500k + 250k + (1 * 50k)] (overhead) = 820k
         // Net: 100k - 820k = -720k
         expect(impact?.payload.amount).toBe(-720000);
      });
  });
});