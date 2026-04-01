import { describe, it, expect, vi } from "vitest";
import { 
  calculateProjectROI, 
  calculateStudioNetWorth, 
  generateWeeklyFinancialReport 
} from "../../../engine/systems/finance";
import { tickFinance } from "../../../engine/systems/finance/financeTick";
import { Project, GameState } from "../../../engine/types";
import { RandomGenerator } from "../../../engine/utils/rng";

const mockProjectDev: Project = {
  id: "proj-1", title: "Test Dev", budgetTier: "low", budget: 500000, genre: "Comedy",
  state: "development", developmentWeeks: 2, productionWeeks: 2, weeksInPhase: 0,
  revenue: 0, weeklyRevenue: 0, weeklyCost: 10000, buzz: 50, format: "film", targetAudience: "general", flavor: "indie", releaseWeek: 0,
  momentum: 50, progress: 0, accumulatedCost: 0, activeCrisis: null
} as Project;

const mockProjectProd: Project = { ...mockProjectDev, id: "proj-2", state: "production", weeklyCost: 20000 } as Project;
const mockProjectReleased: Project = { ...mockProjectDev, id: "proj-3", state: "released", weeklyCost: 0, weeklyRevenue: 100000 } as Project;

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
        const report = generateWeeklyFinancialReport(mockState);
        // Overhead is hardcoded to 500,000 right now.
        // Prod costs are 20,000 normally.
        expect(report.expenses.overhead).toBe(500000);
        expect(report.expenses.production).toBe(20000); 
        expect(report.revenue.boxOffice).toBe(100000);
        expect(report.netProfit).toBe(100000 - 520000);
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
         const impacts = tickFinance(mockState, rng);
         const impact = impacts.find(i => i.type === 'FUNDS_CHANGED');
         // Net profit = 100k - (20k + 500k) = -420k
         expect(impact?.payload.amount).toBe(-420000);
      });
  });
});