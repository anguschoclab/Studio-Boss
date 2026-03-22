import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateBuyers, calculateFitScore, negotiateContract } from "../../../engine/systems/buyers";
import { Buyer, Project, MandateType } from "../../../engine/types";

const mockBuyer: Buyer = {
  id: "b1",
  name: "StreamCo",
  archetype: "streamer",
};

const mockProject: Project = {
  id: "p1",
  title: "Test Film",
  format: "film",
  genre: "Sci-Fi",
  budgetTier: "mid",
  budget: 20000000,
  weeklyCost: 500000,
  targetAudience: "General",
  flavor: "Space stuff",
  status: "development",
  buzz: 50,
  weeksInPhase: 0,
  developmentWeeks: 10,
  productionWeeks: 10,
  revenue: 0,
  weeklyRevenue: 0,
  releaseWeek: null,
};

describe("buyers system", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("updateBuyers", () => {
    it("shifts mandate if buyer has no current mandate", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99); // ensure headline triggers based on randRange
      const { updatedBuyers } = updateBuyers([mockBuyer], 1);

      expect(updatedBuyers[0].currentMandate).toBeDefined();
      expect(updatedBuyers[0].currentMandate!.activeUntilWeek).toBeGreaterThan(1);
    });

    it("shifts mandate if current mandate is expired", () => {
      const expiredBuyer: Buyer = {
        ...mockBuyer,
        currentMandate: { type: "comedy", activeUntilWeek: 0 }
      };

      const { updatedBuyers } = updateBuyers([expiredBuyer], 1);

      expect(updatedBuyers[0].currentMandate!.type).not.toBe("comedy"); // Because logic filters out current
      expect(updatedBuyers[0].currentMandate!.activeUntilWeek).toBeGreaterThan(1);
    });

    it("shifts mandate early due to random 5% chance", () => {
      const activeBuyer: Buyer = {
        ...mockBuyer,
        currentMandate: { type: "drama", activeUntilWeek: 100 }
      };

      vi.spyOn(Math, 'random').mockReturnValue(0.04); // < 0.05 triggers early shift
      const { updatedBuyers } = updateBuyers([activeBuyer], 1);

      expect(updatedBuyers[0].currentMandate!.type).not.toBe("drama");
      expect(updatedBuyers[0].currentMandate!.activeUntilWeek).toBeGreaterThan(1);
    });

    it("maintains mandate if active and random chance fails", () => {
      const activeBuyer: Buyer = {
        ...mockBuyer,
        currentMandate: { type: "drama", activeUntilWeek: 100 }
      };

      vi.spyOn(Math, 'random').mockReturnValue(0.06); // >= 0.05
      const { updatedBuyers } = updateBuyers([activeBuyer], 1);

      expect(updatedBuyers[0].currentMandate!.type).toBe("drama");
      expect(updatedBuyers[0].currentMandate!.activeUntilWeek).toBe(100);
    });
  });

  describe("calculateFitScore", () => {
    it("returns exactly 50 if buyer has no mandate (early return check)", () => {
      // Logic inside calculateFitScore early returns `score` (50) if `!buyer.currentMandate`
      const score = calculateFitScore(mockProject, mockBuyer);
      expect(score).toBe(50);
    });

    it("applies extreme buzz multipliers correctly with negative buzz", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // randRange = 0
      const activeBuyer = { ...mockBuyer, currentMandate: { type: "sci-fi" as MandateType, activeUntilWeek: 100 } };

      const deadBuzzProject = { ...mockProject, buzz: -100 }; // Extreme negative buzz
      const score = calculateFitScore(deadBuzzProject, activeBuyer);

      // Base: 50. Match: +30. buzz = -100 -> factor = (-100/100)*20 = -20
      // 80 - 20 = 60
      expect(score).toBe(60);
    });

    it("clamps score between 0 and 100", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99); // randRange +10

      const perfectBuyer: Buyer = { ...mockBuyer, currentMandate: { type: "sci-fi", activeUntilWeek: 100 } };
      const hypeProject = { ...mockProject, buzz: 200, genre: "Sci-Fi" }; // Extreme high buzz

      const score = calculateFitScore(hypeProject, perfectBuyer);

      // Base: 50. Sci-Fi Match: +30. Buzz: (200/100)*20 = +40. Rand: +10. Total: 130 -> Clamped 100.
      expect(score).toBe(100);
    });

    it("handles budget freeze mandate with extreme blockbuster budget", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // randRange 0

      const freezeBuyer: Buyer = { ...mockBuyer, currentMandate: { type: "budget_freeze", activeUntilWeek: 100 } };
      const hugeProject = { ...mockProject, budgetTier: "blockbuster" as const, buzz: 50 };

      const score = calculateFitScore(hugeProject, freezeBuyer);

      // Base: 50. Freeze + Blockbuster: -50. Buzz: +10. Rand: 0. Total: 10
      expect(score).toBe(10);
    });

    it("handles broad appeal mandate with niche indie project", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // randRange 0

      const broadBuyer: Buyer = { ...mockBuyer, currentMandate: { type: "broad_appeal", activeUntilWeek: 100 } };
      const lowProject = { ...mockProject, budgetTier: "low" as const, targetAudience: "Niche Critics", buzz: 50 };

      const score = calculateFitScore(lowProject, broadBuyer);

      // Base: 50. No budget match. No audience match. Buzz: +10. Total: 60
      expect(score).toBe(60);
    });

    it("applies archetype specific penalties (network vs blockbuster)", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const networkBuyer: Buyer = { ...mockBuyer, archetype: "network" };
      // Assign dummy mandate to trigger mandate logic blocks even if type doesn't match
      networkBuyer.currentMandate = { type: "comedy", activeUntilWeek: 100 };

      const blockbusterProject = { ...mockProject, budgetTier: "blockbuster" as const, buzz: 50 };

      const score = calculateFitScore(blockbusterProject, networkBuyer);

      // Base: 50. Network+Blockbuster: -20. Buzz: +10. Total: 40
      expect(score).toBe(40);
    });
  });

  describe("negotiateContract", () => {
    it("requires a higher score (65) for upfront contracts", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // randRange = 0
      const buyer: Buyer = { ...mockBuyer, currentMandate: { type: "sci-fi", activeUntilWeek: 100 } };
      // Score will be 50 + 30 (sci-fi) + 10 (buzz) = 90

      expect(negotiateContract(mockProject, buyer, 'upfront')).toBe(true);

      // Lower buzz to miss threshold
      const lowBuzzProject = { ...mockProject, buzz: -100 }; // buzz -20 -> score 50 + 30 - 20 = 60
      expect(negotiateContract(lowBuzzProject, buyer, 'upfront')).toBe(false);
    });

    it("requires a lower score (40) for standard/deficit contracts", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // randRange = 0
      const buyer: Buyer = { ...mockBuyer, currentMandate: { type: "sci-fi", activeUntilWeek: 100 } };

      const lowBuzzProject = { ...mockProject, buzz: -100 }; // score 60

      expect(negotiateContract(lowBuzzProject, buyer, 'standard')).toBe(true);
      expect(negotiateContract(lowBuzzProject, buyer, 'deficit')).toBe(true);
    });
  });
});
