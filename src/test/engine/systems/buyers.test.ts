import { describe, it, expect } from "vitest";
import { calculateFitScore, negotiateContract } from "../../../engine/systems/buyers";
import { Project, Buyer, StreamerPlatform } from "../../../engine/types";
import { RandomGenerator } from "../../../engine/utils/rng";

const mockProject: Project = {
  id: "p1",
  title: "Sci-Fi Epic",
  type: "FILM",
  format: "film",
  genre: "Sci-Fi",
  budgetTier: "blockbuster",
  budget: 100000000,
  weeklyCost: 1000000,
  targetAudience: "General",
  flavor: "Epic space journey",
  state: "pitching",
  buzz: 50,
  weeksInPhase: 0,
  developmentWeeks: 10,
  productionWeeks: 20,
  revenue: 0,
  weeklyRevenue: 0,
  releaseWeek: null,
  activeCrisis: null,
  momentum: 50,
  progress: 0,
  accumulatedCost: 0,
  contentFlags: [],
  scriptHeat: 50,
  activeRoles: [],
  scriptEvents: []
} as Project;

const mockBuyer: StreamerPlatform = {
  id: "b1",
  name: "Test Streamer",
  archetype: "streamer",
  currentMandate: undefined,
  subscribers: 50000000,
  churnRate: 0.05,
  contentLibraryQuality: 60,
  marketingSpend: 1000000,
  foundedWeek: 0,
  marketShare: 0.1,
  reach: 80,
  subscriberHistory: []
};

describe("buyers system", () => {
  const rng = new RandomGenerator(42);

  describe("calculateFitScore", () => {
    it("calculates base fit score correctly", () => {
      const score = calculateFitScore(mockProject, mockBuyer, 10, [], rng);
      // Base (50) + Gap (15) + Buzz (10) + Rng(-10 to 10)
      expect(score).toBeGreaterThanOrEqual(65);
      expect(score).toBeLessThanOrEqual(85);
    });

    describe("Guild Auditor: Edge Cases", () => {
      it("calculates fit score correctly with empty project history", () => {
        const score = calculateFitScore(mockProject, mockBuyer, 10, [], new RandomGenerator(42));
        // Base (50) + Gap (15) + Buzz (10) = 75 + RNG => >65
        expect(score).toBeGreaterThanOrEqual(65);
      });
    });

    it("adds bonus for mandate match", () => {
      const buyerWithMandate = {
        ...mockBuyer,
        currentMandate: { type: "sci-fi" as const, activeUntilWeek: 50 }
      };
      const score = calculateFitScore(mockProject, buyerWithMandate, 10, [], rng);
      // Base (50) + Gap (15) + Buzz (10) + Mandate (30) + Rng
      expect(score).toBeGreaterThanOrEqual(95);
    });
  });

  describe("negotiateContract", () => {
    it("accepts a high fit score", () => {
      // Score for this is around 75 + rng
      expect(negotiateContract(mockProject, mockBuyer, 'standard', 10, [], rng)).toBe(true);
    });

    it("requires a higher score (65) for upfront contracts", () => {
      const buyer = { ...mockBuyer, archetype: 'network' as const, reach: 75 } as Buyer;
      // Score: Base 50 + Gap 15 + Buzz 10 - Network Blockbuster Penalty 20 = 55 + rng
      // Even with +10 RNG, it's 65. If RNG is low, it fails.
      const lowRng = new RandomGenerator(999); // Choose a seed that likely fails or just check range
      expect(negotiateContract(mockProject, buyer, 'upfront', 10, [], lowRng)).toBe(false);
    });
  });
});
