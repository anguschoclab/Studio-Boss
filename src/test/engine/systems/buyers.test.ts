import { describe, it, expect } from "vitest";
import { calculateFitScore, negotiateContract } from "../../../engine/systems/buyers";
import { Buyer, StreamerPlatform, Project } from "../../../engine/types";
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
      // Base (50) + Gap (15) + Buzz (10) + Streamer IP boost (25) + Rng(-10 to 10)
      expect(score).toBeGreaterThanOrEqual(65);
      expect(score).toBeLessThanOrEqual(100);
    });

    describe("Guild Auditor: Edge Cases", () => {
      it("calculates fit score correctly with empty project history", () => {
        const scoreVal = calculateFitScore(mockProject, mockBuyer, 10, [], new RandomGenerator(42));
        expect(scoreVal).toBeGreaterThanOrEqual(65);
      });
    });

    it("adds bonus for mandate match", () => {
      const buyerWithMandate = {
        ...mockBuyer,
        currentMandate: { type: "sci-fi" as const, activeUntilWeek: 50 }
      };
      const score = calculateFitScore(mockProject, buyerWithMandate, 10, [], rng);
      expect(score).toBeGreaterThanOrEqual(95);
    });
  });

  describe("negotiateContract", () => {
    it("accepts a high fit score", () => {
      expect(negotiateContract(mockProject, mockBuyer, 'standard', 10, [], rng)).toBe(true);
    });

    it("requires a higher score (65) for upfront contracts", () => {
      const buyer = { ...mockBuyer, archetype: 'network' as const, reach: 75 } as Buyer;
      const lowRng = new RandomGenerator(999);
      expect(negotiateContract(mockProject, buyer, 'upfront', 10, [], lowRng)).toBe(false);
    });
  });
});
