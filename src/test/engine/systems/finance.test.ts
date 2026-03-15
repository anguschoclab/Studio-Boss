import { describe, it, expect } from "vitest";
import { calculateWeeklyCosts, calculateWeeklyRevenue } from "../../../engine/systems/finance";
import { Project, Contract } from "../../../engine/types";

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
  });
});
