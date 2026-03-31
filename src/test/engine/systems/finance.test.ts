import { describe, it, expect } from "vitest";
import { calculateWeeklyCosts, calculateWeeklyRevenue, calculateProjectROI, calculateStudioNetWorth, generateCashflowForecast, advanceFinance } from "../../../engine/systems/finance";
import { Project, Contract, GameState } from "../../../engine/types";

const mockProjectDev: Project = {
  id: "proj-1", title: "Test Dev", budgetTier: "low", budget: 500000, genre: "Comedy",
  status: "development", developmentWeeks: 2, productionWeeks: 2, weeksInPhase: 0,
  revenue: 0, weeklyRevenue: 0, weeklyCost: 10000, buzz: 50, format: "film", targetAudience: "general", flavor: "indie", releaseWeek: 0
};

const mockProjectProd: Project = { ...mockProjectDev, id: "proj-2", status: "production", weeklyCost: 20000 };
const mockProjectReleased: Project = { ...mockProjectDev, id: "proj-3", status: "released", weeklyCost: 0, weeklyRevenue: 100000 };
const mockProjectArchived: Project = { ...mockProjectDev, id: "proj-4", status: "archived", weeklyCost: 0, weeklyRevenue: 0 };

describe("finance system utilities", () => {
  describe("calculateWeeklyCosts", () => {
    it("sums costs of development and production projects only", () => {
      const costs = calculateWeeklyCosts([mockProjectDev, mockProjectProd, mockProjectReleased, mockProjectArchived]);
      expect(costs).toBe(30000);
    });

    it("applies costMultiplier 0 for upfront contract type in production", () => {
      const upfrontProj = { ...mockProjectProd, contractType: 'upfront' as const };
      const costs = calculateWeeklyCosts([upfrontProj]);
      expect(costs).toBe(0);
    });
  });

  describe("calculateWeeklyRevenue", () => {
    it("sums revenue of released projects, factoring in backend percent", () => {
      const contracts: Contract[] = [
        { id: "c1", projectId: "proj-3", talentId: "t1", fee: 0, backendPercent: 10 }
      ];
      const revenue = calculateWeeklyRevenue([mockProjectReleased], contracts);
      expect(revenue).toBe(90000); // 100k - 10%
    });

    it("returns 0 if no released projects", () => {
      const revenue = calculateWeeklyRevenue([mockProjectDev, mockProjectProd], []);
      expect(revenue).toBe(0);
    });

    it("sums revenue of multiple released projects without contracts", () => {
      const mockProjectReleased2: Project = { ...mockProjectReleased, id: "proj-5", weeklyRevenue: 50000 };
      const revenue = calculateWeeklyRevenue([mockProjectReleased, mockProjectReleased2], []);
      expect(revenue).toBe(150000);
    });

    it("sums backend percentages from multiple contracts on the same project", () => {
      const contracts: Contract[] = [
        { id: "c1", projectId: "proj-3", talentId: "t1", fee: 0, backendPercent: 10 },
        { id: "c2", projectId: "proj-3", talentId: "t2", fee: 0, backendPercent: 5 }
      ];
      const revenue = calculateWeeklyRevenue([mockProjectReleased], contracts);
      expect(revenue).toBe(85000); // 100k - 15%
    });
  });

  describe("calculateProjectROI", () => {
    it("returns correct ROI for a standard project", () => {
      const proj = { ...mockProjectReleased, budget: 1000000, revenue: 2000000 };
      expect(calculateProjectROI(proj)).toBe(2.0);
    });
  });

  describe("calculateStudioNetWorth", () => {
    const mockState: GameState = {
      week: 1,
      cash: 500000,
      studio: {
        name: "Test",
        archetype: "indie",
        prestige: 50,
        internal: {
          projects: {},
          contracts: [],
          financeHistory: []
        }
      },
      market: { opportunities: [], buyers: [] },
      industry: { rivals: [], headlines: [], talentPool: {} },
      finance: { bankBalance: 0, yearToDateRevenue: 0, yearToDateExpenses: 0 }
    } as unknown as GameState;

    it("returns cash when there are no projects with catalog value", () => {
      expect(calculateStudioNetWorth(mockState)).toBe(500000);
    });

    it("adds 100% of catalogValue if rightsOwner is 'studio'", () => {
      const p1: Project = { ...mockProjectReleased, ipRights: { rightsOwner: 'studio', catalogValue: 200000 } };
      const state = { ...mockState, studio: { ...mockState.studio, internal: { ...mockState.studio.internal, projects: { 'p1': p1 } } } };
      expect(calculateStudioNetWorth(state)).toBe(700000);
    });
  });

  describe("advanceFinance", () => {
    const mockState: GameState = {
      week: 1,
      cash: 1000000,
      studio: {
        name: "Test",
        archetype: "major",
        prestige: 50,
        internal: {
          projects: {},
          contracts: [],
          financeHistory: []
        }
      },
      market: { opportunities: [], buyers: [] },
      industry: { rivals: [], headlines: [], talentPool: {} },
      finance: { bankBalance: 0, yearToDateRevenue: 0, yearToDateExpenses: 0 }
    } as unknown as GameState;

    it("advances and properly calculates new cash and history", () => {
      const state = {
        ...mockState,
        studio: {
          ...mockState.studio,
          internal: {
            ...mockState.studio.internal,
            projects: { 'p2': mockProjectProd, 'p3': mockProjectReleased }
          }
        }
      };

      const result = advanceFinance(state, 2);
      expect(result.newCash).toBe(1000000 - 20000 + 100000); // 1,080,000
      expect(result.costs).toBe(20000);
      expect(result.revenue).toBe(100000);
      expect(result.financeHistory).toHaveLength(1);
      expect(result.financeHistory[0]).toStrictEqual({ week: 2, cash: 1080000, revenue: 100000, costs: 20000 });
    });
  });
});