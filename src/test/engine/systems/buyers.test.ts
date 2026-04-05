import { describe, it, expect } from "vitest";
import { calculateFitScore, negotiateContract } from "../../../engine/systems/buyers";
import { Buyer, StreamerPlatform } from "../../../engine/types";
import { RandomGenerator } from "../../../engine/utils/rng";
import { createMockProject, createMockBuyer } from "../../utils/mockFactories";

const mockProject = createMockProject({
  id: "p1",
  title: "Sci-Fi Epic",
  genre: "Sci-Fi",
  budgetTier: "blockbuster",
  buzz: 50,
});

const mockBuyer = createMockBuyer({
  id: "b1",
  name: "Test Streamer",
  archetype: "streamer",
}) as StreamerPlatform;

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
