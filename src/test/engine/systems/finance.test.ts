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
      industry: { rivals: [], headlines: [], talentPool: {} },
      ip: { vault: [], franchises: {} }
,

    } as unknown as GameState;

    it("returns cash when there are no projects with catalog value", () => {
      expect(calculateStudioNetWorth(mockState)).toBe(500000);
    });

    it("adds 100% of catalogValue if rightsOwner is 'studio'", () => {
       const p1: Project = { ...mockProjectReleased, ipRights: { rightsOwner: 'studio', catalogValue: 200000 } } as any;
       const state = { ...mockState, ip: { vault: [{ baseValue: 200000, decayRate: 1.0, projectId: 'p1', quality: 50, type: 'original' }] } } as any;
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
      ip: { vault: [], franchises: {} }


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
        // ExpenseProcessor.calculateStudioBurn(Level 3, 2 active [unreleased])
        // levelScale = 1.25^2 = 1.5625
        // overhead = (750k * 1.5625) + (2 * 200k) = 1,171,875 + 400,000 = 1,571,875
        expect(report.expenses.overhead).toBe(1571875);
        expect(report.expenses.production).toBe(20000); // Only mockProjectProd is in production
        expect(report.revenue.boxOffice).toBe(40000); // 100k * 0.40
        // Net: 40k - 1,571,875 (overhead) - 20k (prod) + 481 (savings yield) = -1,551,394
        expect(report.netProfit).toBe(-1551394);
        expect(report.startingCash).toBe(1000000);
    });
  });

  describe("tickFinance", () => {
      const mockState: GameState = {
        week: 1,
        gameSeed: 1,
        tickCount: 0,
        finance: { 
          cash: 1000000, 
          ledger: [],
          marketState: {
            baseRate: 0.05,
            savingsYield: 0.02,
            debtRate: 0.1,
            loanRate: 0.08,
            rateHistory: [],
            sentiment: 50,
            cycle: 'STABLE'
          }
        },
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
        market: { opportunities: [], buyers: [], trends: [] },
        industry: { rivals: [], newsHistory: [], talentPool: {}, awards: [] },
        ip: { vault: [], franchises: {} },
        culture: { genrePopularity: {} }
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
         
         // Revenue: 200k * 0.40 = 80k
         // Overhead: Level 3, 1 active unreleased = (750k * 1.5625) + (1 * 200k) = 1,171,875 + 200,000 = 1,371,875
         // Production: 20k
         // Savings Yield: 1M * (0.02 / 52) = ~385
         // Total Expenses: 1,391,875 - 385 = 1,391,490
         // Net: 80k - 1,391,490 = -1,311,490
         expect(impact?.payload.amount).toBe(-1311490);
      });
  });
});