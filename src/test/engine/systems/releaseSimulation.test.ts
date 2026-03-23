import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateReviewScore, simulateWeeklyBoxOffice, calculateBoxOfficeRanks, BoxOfficeEntry } from "../../../engine/systems/releaseSimulation";
import { Project, TalentProfile, ActiveCrisis } from "../../../engine/types";

const mockProject: Project = {
  id: "proj-1",
  title: "Simulated Project",
  format: "film",
  genre: "Drama",
  budgetTier: "mid",
  budget: 50000000,
  weeklyCost: 100000,
  targetAudience: "General",
  flavor: "Dramatic stuff",
  status: "released",
  buzz: 50,
  weeksInPhase: 1,
  developmentWeeks: 10,
  productionWeeks: 10,
  revenue: 0,
  weeklyRevenue: 0,
  releaseWeek: null,
};

const mockTalent: TalentProfile = {
  id: "t1", name: "Star", roles: ["actor"], prestige: 50, fee: 1000000, draw: 50, temperament: "Professional", accessLevel: "outsider"
};

describe("releaseSimulation system", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("generateReviewScore", () => {
    it("calculates base score clamped between 1 and 100", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // avg base 55
      const score = generateReviewScore(mockProject, [], undefined);
      // Base: 40 + (30 * 0.5) = 55. Talent: 0. Buzz bonus: 0. Variance: 0 (-5 to 5 * 0.5 = 0).
      expect(score).toBeGreaterThanOrEqual(40);
      expect(score).toBeLessThanOrEqual(75); // max variance
    });

    it("applies penalty for active, unresolved crises", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const crisis: ActiveCrisis = { description: "Bad", options: [], resolved: false };
      const baseScore = generateReviewScore(mockProject, [], undefined);
      const penaltyScore = generateReviewScore(mockProject, [], crisis);

      expect(penaltyScore).toBeLessThan(baseScore);
    });

    it("ignores resolved crises", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const crisis: ActiveCrisis = { description: "Bad", options: [], resolved: true };
      const baseScore = generateReviewScore(mockProject, [], undefined);
      const resolvedScore = generateReviewScore(mockProject, [], crisis);

      expect(resolvedScore).toBe(baseScore);
    });

    it("handles 0 prestige talent pool (edge case)", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const zeroPrestige: TalentProfile = { ...mockTalent, prestige: 0 };
      const score = generateReviewScore(mockProject, [zeroPrestige], undefined);
      // Talent bonus = 0 / 1 * 0.3 = 0.
      expect(score).toBeGreaterThanOrEqual(40);
    });

    it("handles maximum prestige talent pool (edge case)", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99); // Max base (70), Max variance (+5)
      const maxPrestige: TalentProfile = { ...mockTalent, prestige: 100 };
      const hypeProject = { ...mockProject, buzz: 100 }; // >80 gets bonus

      const score = generateReviewScore(hypeProject, [maxPrestige], undefined);

      // Base: ~70. Talent: 100 / 1 * 0.3 = 30. Crisis: 0. Buzz: +15. Variance: +5
      // Total: 70 + 30 + 15 + 5 = 120 -> Clamped 100.
      expect(score).toBe(100);
    });

    it("applies penalty for terrible buzz (<30)", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1); // Min base (43), Min variance (-4)
      const deadProject = { ...mockProject, buzz: 0 };

      const score = generateReviewScore(deadProject, [], undefined);

      // Base: ~43. Talent: 0. Buzz penalty: ~-6. Variance: ~-4.
      // Total: 43 - 6 - 4 = 33.
      expect(score).toBeLessThan(40);
    });

    it("applies bonus for excellent buzz (>80)", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // avg base 55, variance 0
      const hypeProject = { ...mockProject, buzz: 85 };

      const score = generateReviewScore(hypeProject, [], undefined);

      expect(score).toBe(65);
    });

    it("calculates talent bonus correctly for multiple attached talents", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // avg base 55, variance 0
      const t1 = { ...mockTalent, prestige: 60 };
      const t2 = { ...mockTalent, prestige: 80 };

      const score = generateReviewScore(mockProject, [t1, t2], undefined);

      expect(score).toBe(76);
    });
  });

  describe("simulateWeeklyBoxOffice", () => {
    it("applies standard drop off multipliers based on review score legs", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // Mid drop-off

      // Excellent legs (score >= 85) -> range 0.6 to 0.8
      // Note: mockProject has a budget of 50M, so it does not get the "indie/horror" bonus (budget <= 20M)
      const excellentMultiplier = simulateWeeklyBoxOffice(mockProject, 2, 90, 1000000, 0);
      expect(excellentMultiplier).toBe(700000); // 0.7 * 1M

      // Average legs (score >= 60) -> range 0.4 to 0.6
      const averageMultiplier = simulateWeeklyBoxOffice(mockProject, 2, 60, 1000000, 0);
      expect(averageMultiplier).toBe(500000); // 0.5 * 1M

      // Bad legs (score < 40) -> range 0.1 to 0.25
      const badMultiplier = simulateWeeklyBoxOffice(mockProject, 2, 30, 1000000, 0);
      expect(badMultiplier).toBe(175000); // 0.175 * 1M
    });

    it("applies massive penalty for huge budget drop off week 1", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // Excellent legs = 0.7 drop off

      const massiveProject = { ...mockProject, budget: 200000000 };
      const drop = simulateWeeklyBoxOffice(massiveProject, 1, 90, 1000000, 0);

      // 0.7 * 0.70 = 0.49. 0.49 * 1M = 490,000
      expect(drop).toBeCloseTo(490000);
    });


    it("applies sharp second-weekend drop for tentpoles week 1", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // Excellent legs = 0.7 drop off

      const tentpoleProject = { ...mockProject, budget: 100000000 };
      const drop = simulateWeeklyBoxOffice(tentpoleProject, 1, 90, 1000000, 0);

      // 0.7 * 0.85 = 0.595. 0.595 * 1M = 595,000
      expect(drop).toBeCloseTo(595000);
    });


    it("applies strong word-of-mouth bonus for low budget anomalies", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // Excellent legs = 0.7 drop off

      const anomalyProject = { ...mockProject, budget: 20000000 };
      const drop = simulateWeeklyBoxOffice(anomalyProject, 2, 90, 1000000, 0);

      // 0.7 * 1.2 = 0.84. 0.84 * 1M = 840,000
      expect(drop).toBeCloseTo(840000);
    });

    it("handles extreme rival competition (100 strength)", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // average legs = 0.5

      // Penalty: (100/100) * 0.15 = 0.15. Multiplier = 0.5 - 0.15 = 0.35.
      const drop = simulateWeeklyBoxOffice(mockProject, 2, 60, 1000000, 100);
      expect(drop).toBe(350000);
    });

    it("never drops below 0.05 absolute multiplier floor due to extreme competition", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1); // Bad legs = ~0.115 drop off

      // Penalty: (100/100) * 0.15 = 0.15. Multiplier = 0.115 - 0.15 = -0.035 -> Clamped 0.05.
      const drop = simulateWeeklyBoxOffice(mockProject, 2, 30, 1000000, 100);
      expect(drop).toBe(50000); // 0.05 * 1M
    });
  });

  describe("calculateBoxOfficeRanks", () => {
    it("returns correctly sorted ranks map", () => {
      const entries: BoxOfficeEntry[] = [
        { projectId: "p1", studioName: "A", weeklyRevenue: 500 },
        { projectId: "p2", studioName: "B", weeklyRevenue: 1000 },
        { projectId: "p3", studioName: "C", weeklyRevenue: 100 },
      ];

      const ranks = calculateBoxOfficeRanks(entries);
      expect(ranks.get("p2")).toBe(1);
      expect(ranks.get("p1")).toBe(2);
      expect(ranks.get("p3")).toBe(3);
    });

    it("handles empty array", () => {
      const ranks = calculateBoxOfficeRanks([]);
      expect(ranks.size).toBe(0);
    });

    it("handles identical revenues (preserves sort stability or ties appropriately)", () => {
      const entries: BoxOfficeEntry[] = [
        { projectId: "p1", studioName: "A", weeklyRevenue: 1000 },
        { projectId: "p2", studioName: "B", weeklyRevenue: 1000 },
      ];

      const ranks = calculateBoxOfficeRanks(entries);
      expect(ranks.get("p1")).toBe(1); // Standard JS sort preserves order or sorts deterministically
      expect(ranks.get("p2")).toBe(2);
    });
  });

  describe("Extreme Edge Cases (Guild Auditor)", () => {
    it("handles extreme review scores (> 100 or < 0)", () => {
      // Mock random to be high
      vi.spyOn(Math, 'random').mockReturnValue(0.9);
      // Simulate weekly box office with reviewScore = 150 (impossible naturally, but engine shouldn't crash)
      const multiplierHigh = simulateWeeklyBoxOffice(mockProject, 2, 150, 1000000, 0);
      // Leg multiplier applies >= 85 logic
      expect(multiplierHigh).toBeGreaterThan(0);

      // Simulate weekly box office with reviewScore = -50
      const multiplierLow = simulateWeeklyBoxOffice(mockProject, 2, -50, 1000000, 0);
      // Leg multiplier applies < 40 logic
      expect(multiplierLow).toBeGreaterThan(0);
    });

    it("handles calculating rank with a single entry or empty", () => {
      const ranksSingle = calculateBoxOfficeRanks([{ projectId: '1', studioName: 'S1', weeklyRevenue: 100 }]);
      expect(ranksSingle.get('1')).toBe(1);

      const ranksEmpty = calculateBoxOfficeRanks([]);
      expect(ranksEmpty.size).toBe(0);
    });
  });
});
