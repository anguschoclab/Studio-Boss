import { describe, it, expect } from "vitest";
import { ExpenseProcessor } from "../../../../engine/systems/finance/ExpenseProcessor";
import { Project } from "../../../../engine/types";

describe("ExpenseProcessor", () => {
  describe("calculateStudioBurn", () => {
    it("should calculate $500k for studio level 1 with 0 active projects", () => {
      const burn = ExpenseProcessor.calculateStudioBurn(1, 0);
      expect(burn).toBe(500000); // 500k * (1.25^0) + (0 * 75k)
    });

    it("should calculate $1.08M for studio level 3 with 4 active projects", () => {
      const burn = ExpenseProcessor.calculateStudioBurn(3, 4);
      // (500,000 * 1.5625) + (4 * 75,000) = 781,250 + 300,000 = 1,081,250
      expect(burn).toBe(1081250);
    });

    it("should exceed base rent for higher levels", () => {
      const level3Burn = ExpenseProcessor.calculateStudioBurn(3, 0);
      expect(level3Burn).toBeGreaterThan(500000);
    });
  });

  describe("calculateMarketingBurn", () => {
    it("should return 0 for no active marketing campaigns", () => {
      const mockProjects = [{ state: "production" } as Project];
      const burn = ExpenseProcessor.calculateMarketingBurn(mockProjects);
      expect(burn).toBe(0);
    });

    it("should correctly deduct from cash per tick for active marketing", () => {
      const mockProjects = [{ state: "marketing", marketingBudget: 300000 } as Project];
      const burn = ExpenseProcessor.calculateMarketingBurn(mockProjects);
      expect(burn).toBe(50000); // 300k / 6
    });
  });

  // Characterization lock for the Bolt single-pass rewrite — pins the fused
  // totals exactly, including per-line rounding semantics. Green before AND after.
  describe("calculateConsolidatedExpenses", () => {
    const proj = (state: string, weeklyCost = 0, marketingBudget = 0) =>
      ({ state, weeklyCost, marketingBudget }) as Project;
    const pact = (weeklyFee?: number) => ({ weeklyFee }) as any;
    const market = { debtRate: 0.1 } as any;
    const state = { studio: { level: 1 } } as any;

    it("counts only non-terminal projects toward overhead", () => {
      const projects = [
        proj("production"),
        proj("development"),
        proj("released"),
        proj("archived"),
        proj("completed"),
      ];
      const r = ExpenseProcessor.calculateConsolidatedExpenses(
        projects, state, market, "major", 1_000_000, 10, []
      );
      // $500k base + 2 active * $75k penalty
      expect(r.overhead).toBe(650_000);
    });

    it("sums production weeklyCost and rounds the total", () => {
      const projects = [proj("production", 100_000), proj("production", 50_500), proj("marketing")];
      const r = ExpenseProcessor.calculateConsolidatedExpenses(
        projects, state, market, "major", 0, 10, []
      );
      expect(r.production).toBe(150_500);
    });

    it("computes marketing burn as budget/6 per marketing-state project, rounded", () => {
      const projects = [proj("marketing", 0, 300_000), proj("marketing", 0, 61_000)];
      const r = ExpenseProcessor.calculateConsolidatedExpenses(
        projects, state, market, "major", 0, 10, []
      );
      expect(r.marketing).toBe(Math.round(50_000 + 61_000 / 6));
    });

    it("sums pact weeklyFee with missing fees as 0", () => {
      const r = ExpenseProcessor.calculateConsolidatedExpenses(
        [], state, market, "major", 0, 10, [pact(10_000), pact(5_000), pact(undefined)]
      );
      expect(r.pacts).toBe(15_000);
    });

    it("charges weekly debt interest only on negative cash", () => {
      const pos = ExpenseProcessor.calculateConsolidatedExpenses(
        [], state, market, "major", 1_000, 10, []
      );
      const neg = ExpenseProcessor.calculateConsolidatedExpenses(
        [], state, market, "major", -520_000, 10, []
      );
      expect(pos.interest).toBe(0);
      expect(neg.interest).toBe(Math.abs(Math.round(-520_000 * (0.1 / 52))));
    });
  });
});
