import { describe, it, expect, beforeEach } from "vitest";
import { ReviewSystem } from "../../../engine/systems/ReviewSystem";
import { Project, Talent } from "../../../engine/types";
import { RandomGenerator } from "../../../engine/utils/rng";

describe("ReviewSystem", () => {
  let rng: RandomGenerator;
  let mockProject: Project;
  let mockTalent: Talent[];

  beforeEach(() => {
    rng = new RandomGenerator(42);
    mockProject = {
      id: "test-proj",
      title: "Test Movie",
      budget: 10_000_000,
      budgetTier: "mid",
      genre: "Drama",
      momentum: 70,
      buzz: 50,
      revenue: 0,
      state: "production"
    } as any;

    mockTalent = [
      {
        id: "dir-1",
        name: "Great Director",
        roles: ["director"],
        prestige: 90
      }
    ] as any;
  });

  describe("calculateMetaScore", () => {
    it("incorporates director prestige", () => {
      const scoreHigh = ReviewSystem.calculateMetaScore(mockProject, mockTalent, rng);
      
      const mediocreTalent = [{ ...mockTalent[0], prestige: 50 }] as any;
      const scoreMed = ReviewSystem.calculateMetaScore(mockProject, mediocreTalent, rng);
      
      expect(scoreHigh).toBeGreaterThan(scoreMed);
    });

    it("applies Indie bias for low budget projects", () => {
      const indieProject = { ...mockProject, budgetTier: "indie" } as any;
      const midProject = { ...mockProject, budgetTier: "mid" } as any;
      
      const scoreIndie = ReviewSystem.calculateMetaScore(indieProject, mockTalent, rng);
      const scoreMid = ReviewSystem.calculateMetaScore(midProject, mockTalent, rng);
      
      // Since RNG is seeded and the only difference is the +5 bias
      expect(scoreIndie).toBeGreaterThan(scoreMid);
    });
  });

  describe("calculateAudienceScore", () => {
    it("scales with marketing buzz", () => {
      const meta = 70;
      const highBuzz = { ...mockProject, buzz: 90 } as any;
      const lowBuzz = { ...mockProject, buzz: 10 } as any;
      
      const scoreHigh = ReviewSystem.calculateAudienceScore(highBuzz, meta, rng);
      const scoreLow = ReviewSystem.calculateAudienceScore(lowBuzz, meta, rng);
      
      expect(scoreHigh).toBeGreaterThan(scoreLow);
    });
  });

  describe("checkCultPotential", () => {
    it("identifies a cult classic correctly", () => {
      const bomb = {
        ...mockProject,
        budget: 100_000_000,
        revenue: 10_000_000, // Large failure
        genre: "Sci-Fi"
      } as any;
      
      const meta = 40;
      const audience = 85; // High disparity
      
      const isCult = ReviewSystem.checkCultPotential(bomb, meta, audience);
      expect(isCult).toBe(true);
    });

    it("rejects non-genre matches", () => {
       const bomb = {
        ...mockProject,
        budget: 100_000_000,
        revenue: 10_000_000,
        genre: "Comedy" // Not Sci-Fi or Horror
      } as any;
      
      const isCult = ReviewSystem.checkCultPotential(bomb, 40, 85);
      expect(isCult).toBe(false);
    });
  });
});
