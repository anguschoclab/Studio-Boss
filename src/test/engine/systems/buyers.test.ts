import { describe, it, expect, vi, beforeEach } from "vitest";
import { calculateFitScore, negotiateContract } from "../../../engine/systems/buyers";
import { Project, Buyer } from "../../../engine/types";
import * as utils from "../../../engine/utils";

const mockProject: Project = {
  id: "p1",
  title: "Sci-Fi Epic",
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
} as Project;

const mockBuyer: Buyer = {
  id: "b1",
  name: "Test Streamer",
  archetype: "streamer",
  currentMandate: undefined,
  subscribers: 50000000,
  churnRate: 0.05,
  contentLibraryQuality: 60,
  marketingSpend: 1000000,
};

describe("buyers system", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("calculateFitScore", () => {
    it("calculates base fit score correctly", () => {
      vi.spyOn(utils, 'randRange').mockReturnValue(0);
      const score = calculateFitScore(mockProject, mockBuyer, 10, []);
      // Base (50) + Gap (15) + Buzz (10) = 75
      expect(score).toBe(75);
    });

    it("adds bonus for mandate match", () => {
      vi.spyOn(utils, 'randRange').mockReturnValue(0);
      const buyerWithMandate = {
        ...mockBuyer,
        currentMandate: { type: "sci-fi" as const, activeUntilWeek: 50 }
      };
      const score = calculateFitScore(mockProject, buyerWithMandate, 10, []);
      // Base (50) + Gap (15) + Buzz (10) + Mandate (30) = 105 (capped at 100)
      expect(score).toBe(100);
    });
  });

  describe("negotiateContract", () => {
    it("accepts a high fit score", () => {
      vi.spyOn(utils, 'randRange').mockReturnValue(0);
      // Score for this is 75 (Base 50 + Gap 15 + Buzz 10)
      expect(negotiateContract(mockProject, mockBuyer, 'standard')).toBe(true);
    });

    it("requires a higher score (65) for upfront contracts", () => {
      vi.spyOn(utils, 'randRange').mockReturnValue(0);
      const buyer = { ...mockBuyer, archetype: 'network' as const };
      // Score: Base 50 + Gap 15 + Buzz 10 - Network Blockbuster Penalty 20 = 55
      expect(negotiateContract(mockProject, buyer, 'upfront')).toBe(false);
    });
  });
});
