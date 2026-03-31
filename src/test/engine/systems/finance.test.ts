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

describe("finance", () => {
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

    it("applies costMultiplier 0.5 for deficit contract type in production", () => {
      const deficitProj = { ...mockProjectProd, contractType: 'deficit' as const, weeklyCost: 10000 };
      const costs = calculateWeeklyCosts([deficitProj]);
      expect(costs).toBe(5000); // 10000 * 0.5
    });

    it("handles negative weeklyCost safely", () => {
      const negProj = { ...mockProjectProd, weeklyCost: -5000 };
      const costs = calculateWeeklyCosts([negProj]);
      expect(costs).toBe(-5000);
    });

    it("ignores contract types for development phase projects", () => {
      const upfrontDev = { ...mockProjectDev, contractType: 'upfront' as const, weeklyCost: 10000 };
      const costs = calculateWeeklyCosts([upfrontDev]);
      expect(costs).toBe(10000); // Still 100% in development
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

    it("ignores contracts that belong to a different project", () => {
      const contracts: Contract[] = [
        { id: "c1", projectId: "proj-99", talentId: "t1", fee: 0, backendPercent: 50 }
      ];
      const revenue = calculateWeeklyRevenue([mockProjectReleased], contracts);
      expect(revenue).toBe(100000); // No reduction
    });

    it("handles a released project with zero weekly revenue", () => {
      const mockProjectReleasedZero: Project = { ...mockProjectReleased, id: "proj-6", weeklyRevenue: 0 };
      const contracts: Contract[] = [
        { id: "c1", projectId: "proj-6", talentId: "t1", fee: 0, backendPercent: 10 }
      ];
      const revenue = calculateWeeklyRevenue([mockProjectReleasedZero], contracts);
      expect(revenue).toBe(0);
    });

    it("handles backend percentages greater than 100%", () => {
      const contracts: Contract[] = [
        { id: "c1", projectId: "proj-3", talentId: "t1", fee: 0, backendPercent: 80 },
        { id: "c2", projectId: "proj-3", talentId: "t2", fee: 0, backendPercent: 50 } // Total 130%
      ];
      const revenue = calculateWeeklyRevenue([mockProjectReleased], contracts);
      expect(revenue).toBe(-30000); // Studio pays out of pocket
    });

    it("handles negative weeklyRevenue safely", () => {
      const negProj = { ...mockProjectReleased, weeklyRevenue: -10000 };
      const contracts: Contract[] = [
        { id: "c1", projectId: "proj-3", talentId: "t1", fee: 0, backendPercent: 10 }
      ];
      const revenue = calculateWeeklyRevenue([negProj], contracts);
      // Revenue = -10000 - (-10000 * 0.1) = -10000 - (-1000) = -9000
      expect(revenue).toBe(-9000);
    });

    it("returns 0 revenue for upfront contract type", () => {
      const upfrontProj = { ...mockProjectReleased, contractType: 'upfront' as const, weeklyRevenue: 100000 };
      const contracts: Contract[] = [
        { id: "c1", projectId: "proj-3", talentId: "t1", fee: 0, backendPercent: 10 }
      ];
      const revenue = calculateWeeklyRevenue([upfrontProj], contracts);
      // revenue is forced to 0. 0 - (0 * 0.1) = 0
      expect(revenue).toBe(0);
    });

    it("calculates 100% of revenue for deficit contract type minus backend", () => {
      const deficitProj = { ...mockProjectReleased, contractType: 'deficit' as const, weeklyRevenue: 100000 };
      const contracts: Contract[] = [
        { id: "c1", projectId: "proj-3", talentId: "t1", fee: 0, backendPercent: 20 }
      ];
      const revenue = calculateWeeklyRevenue([deficitProj], contracts);
      expect(revenue).toBe(80000);
    });
  });

  describe("calculateProjectROI", () => {
    it("returns correct ROI for a standard project", () => {
      const proj = { ...mockProjectReleased, budget: 1000000, revenue: 2000000 };
      expect(calculateProjectROI(proj)).toBe(2.0);
    });

    it("returns 0 if the total cost is 0", () => {
      const proj = { ...mockProjectReleased, budget: 0, marketingBudget: 0, revenue: 1000000 };
      expect(calculateProjectROI(proj)).toBe(0);
    });

    it("handles negative budget correctly", () => {
      const proj = { ...mockProjectReleased, budget: -10000, revenue: 50000 };
      expect(calculateProjectROI(proj)).toBe(-5.0);
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
          projects: [],
          contracts: [],
          financeHistory: []
        }
      },
      market: { opportunities: [], buyers: [] },
      industry: { rivals: [], headlines: [], families: [], agencies: [], agents: [], talentPool: [], newsHistory: [] },
      culture: { genrePopularity: {} },
      finance: { bankBalance: 0, yearToDateRevenue: 0, yearToDateExpenses: 0 },
      history: []
    };

    it("returns cash when there are no projects with catalog value", () => {
      expect(calculateStudioNetWorth(mockState)).toBe(500000);
    });

    it("adds 100% of catalogValue if rightsOwner is 'studio'", () => {
      const p1: Project = { ...mockProjectReleased, ipRights: { rightsOwner: 'studio', catalogValue: 200000 } };
      const state = { ...mockState, studio: { ...mockState.studio, internal: { ...mockState.studio.internal, projects: [p1] } } };
      expect(calculateStudioNetWorth(state)).toBe(700000);
    });

    it("adds 50% of catalogValue if rightsOwner is 'shared'", () => {
      const p1: Project = { ...mockProjectReleased, ipRights: { rightsOwner: 'shared', catalogValue: 200000 } };
      const state = { ...mockState, studio: { ...mockState.studio, internal: { ...mockState.studio.internal, projects: [p1] } } };
      expect(calculateStudioNetWorth(state)).toBe(600000);
    });
  });

  describe("generateCashflowForecast", () => {
    const mockState: GameState = {
      week: 1,
      cash: 1000000,
      studio: {
        name: "Test",
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
      finance: { bankBalance: 0, yearToDateRevenue: 0, yearToDateExpenses: 0 },
      history: []
    };

    it("simulates advancing weeks with an empty pipeline (no projects or revenue)", () => {
      const forecast = generateCashflowForecast(mockState, 8);
      expect(forecast).toHaveLength(8);

      forecast.forEach((f, idx) => {
        expect(f.week).toBe(mockState.week + idx + 1);
        expect(f.projectedRevenue).toBe(0);
        expect(f.projectedCosts).toBe(0);
        expect(f.projectedCash).toBe(1000000);
      });
    });

    it("simulates decay with existing revenue/costs", () => {
      const state = {
        ...mockState,
        studio: {
          ...mockState.studio,
          internal: {
            ...mockState.studio.internal,
            projects: [mockProjectProd, mockProjectReleased]
          }
        }
      };

      const forecast = generateCashflowForecast(state, 1);

      // In finance.ts, calculateProjectDecay returns 0.40 for 1 week in phase. So 100,000 * 0.40 = 40,000.
      expect(Math.round(forecast[0].projectedRevenue)).toBe(40000);
      // Cost is 20,000
      expect(forecast[0].projectedCosts).toBe(20000);
      // Cash = 1,000,000 + 40,000 - 20,000 = 1,020,000
      expect(Math.round(forecast[0].projectedCash)).toBe(1020000);
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
          projects: [],
          contracts: [],
          financeHistory: []
        }
      },
      market: { opportunities: [], buyers: [] },
      industry: { rivals: [], headlines: [], families: [], agencies: [], agents: [], talentPool: [], newsHistory: [] },
      culture: { genrePopularity: {} },
      finance: { bankBalance: 0, yearToDateRevenue: 0, yearToDateExpenses: 0 },
      history: []
    };

    it("advances with empty pipeline", () => {
      const result = advanceFinance(mockState, 2);
      expect(result.newCash).toBe(1000000);
      expect(result.costs).toBe(0);
      expect(result.revenue).toBe(0);
      expect(result.financeHistory).toHaveLength(1);
      expect(result.financeHistory[0].week).toBe(2);
    });

    it("advances and properly calculates new cash and history", () => {
      const state = {
        ...mockState,
        studio: {
          ...mockState.studio,
          internal: {
            ...mockState.studio.internal,
            projects: [mockProjectProd, mockProjectReleased]
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