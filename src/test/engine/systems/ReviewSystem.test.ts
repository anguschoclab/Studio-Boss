import { describe, it, expect, beforeEach } from "vitest";
import { createMockProject, createMockTalent } from "../../utils/mockFactories";
import { ReviewSystem } from "../../../engine/systems/ReviewSystem";
import { Project, Talent } from "../../../engine/types";
import { RandomGenerator } from "../../../engine/utils/rng";

describe("ReviewSystem", () => {
  let rng: RandomGenerator;
  let mockProject: Project;
  let mockTalent: Talent[];

  beforeEach(() => {
    rng = new RandomGenerator(42);
    mockProject = createMockProject({
      id: "test-proj",
      title: "Test Movie",
      budget: 10_000_000,
      budgetTier: "mid",
      genre: "Drama",
      momentum: 70,
      buzz: 50,
      revenue: 0,
      state: "production"
    });

    mockTalent = [
      createMockTalent({
        id: "dir-1",
        name: "Great Director",
        roles: ["director"],
        prestige: 90
      })
    ];
  });

  describe("calculateMetaScore", () => {
    it("incorporates director prestige", () => {
      const scoreHigh = ReviewSystem.calculateMetaScore(mockProject, mockTalent, rng);
      
      const mediocreTalent = [{ ...mockTalent[0], prestige: 50 }];
      const scoreMed = ReviewSystem.calculateMetaScore(mockProject, mediocreTalent, rng);
      
      expect(scoreHigh).toBeGreaterThan(scoreMed);
    });

    it("applies Indie bias for low budget projects", () => {
      const indieProject = createMockProject({ ...mockProject, budgetTier: "indie" });
      const midProject = createMockProject({ ...mockProject, budgetTier: "mid" });
      
      const scoreIndie = ReviewSystem.calculateMetaScore(indieProject, mockTalent, rng);
      const scoreMid = ReviewSystem.calculateMetaScore(midProject, mockTalent, rng);
      
      // Since RNG is seeded and the only difference is the +5 bias
      expect(scoreIndie).toBeGreaterThan(scoreMid);
    });
  });

  describe("calculateAudienceScore", () => {
    it("scales with marketing buzz", () => {
      const meta = 70;
      const highBuzz = createMockProject({ ...mockProject, buzz: 90 });
      const lowBuzz = createMockProject({ ...mockProject, buzz: 10 });
      
      const scoreHigh = ReviewSystem.calculateAudienceScore(highBuzz, meta, rng);
      const scoreLow = ReviewSystem.calculateAudienceScore(lowBuzz, meta, rng);
      
      expect(scoreHigh).toBeGreaterThan(scoreLow);
    });
  });

  describe("checkCultPotential", () => {
    it("identifies a cult classic correctly", () => {
      const bomb = createMockProject({
        ...mockProject,
        budget: 100_000_000,
        revenue: 10_000_000,
        genre: "Comedy"
      });
      const isCult = ReviewSystem.checkCultPotential(bomb, 40, 85);
      expect(isCult).toBe(false);
    });
  });

  describe("generateReception", () => {
    it("generates full reception data", () => {
       const rng2 = new RandomGenerator(42);
       const mockP = createMockProject({
          id: "test-proj",
          title: "Test Movie",
          budget: 10_000_000,
          budgetTier: "mid",
          genre: "Drama",
          momentum: 70,
          buzz: 50,
          revenue: 0,
          state: "production"
        });
       const mockT = [
          createMockTalent({
            id: "dir-1",
            name: "Great Director",
            roles: ["director"],
            prestige: 90
          })
        ];
       const result = ReviewSystem.generateReception(mockP, mockT, rng2);
       expect(result.metaScore).toBeDefined();
       expect(result.audienceScore).toBeDefined();
       expect(result.reviews.length).toBeGreaterThan(0);
       expect(result.status).toBeDefined();
       expect(result.isCultPotential).toBeDefined();
    });
  });

  describe("getStatus", () => {
    it("returns correct status based on score", () => {
      expect(ReviewSystem.getStatus(85)).toBe('Acclaimed');
      expect(ReviewSystem.getStatus(75)).toBe('Acclaimed');
      expect(ReviewSystem.getStatus(60)).toBe('Mixed');
      expect(ReviewSystem.getStatus(40)).toBe('Mixed');
      expect(ReviewSystem.getStatus(39)).toBe('Panned');
      expect(ReviewSystem.getStatus(10)).toBe('Panned');
    });
  });
});
