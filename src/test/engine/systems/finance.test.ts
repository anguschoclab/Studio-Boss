import { describe, it, expect } from "vitest";
import { calculateWeeklyCosts, calculateWeeklyRevenue } from "../../../engine/systems/finance";
import { Project, Contract } from "../../../engine/types";

const mockProjectDev: Project = {
  id: "proj-1", title: "Test Dev", budgetTier: "low", budget: 500000, genre: "Comedy",
  status: "development", developmentWeeks: 2, productionWeeks: 2, weeksInPhase: 0,
  revenue: 0, weeklyRevenue: 0, weeklyCost: 10000, buzz: 50
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
        { id: "c1", projectId: "proj-3", talentId: "t1", status: "active", upfrontFee: 0, backendPercent: 10 }
      ];
      const revenue = calculateWeeklyRevenue([mockProjectReleased], contracts);
      expect(revenue).toBe(90000); // 100k - 10%
    });

    it("returns 0 if no released projects", () => {
      const revenue = calculateWeeklyRevenue([mockProjectDev, mockProjectProd], []);
      expect(revenue).toBe(0);
    });
  });
});
