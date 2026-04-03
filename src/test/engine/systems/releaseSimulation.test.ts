import { describe, it, expect } from "vitest";
import { 
  calculateReviewScore, 
  simulateWeeklyBoxOffice, 
  calculateBoxOfficeRanks, 
  BoxOfficeEntry,
  calculateOpeningWeekend
} from "../../../engine/systems/releaseSimulation";
import { Project, Talent, ActiveCrisis } from "../../../engine/types";
import { RandomGenerator } from "../../../engine/utils/rng";

const mockProject: Project = {
  id: "proj-1",
  title: "Simulated Project",
  type: 'FILM',
  format: "film",
  genre: "Drama",
  budgetTier: "mid",
  budget: 50_000_000,
  weeklyCost: 100_000,
  targetAudience: "General",
  flavor: "Dramatic stuff",
  state: "released",
  buzz: 50,
  weeksInPhase: 1,
  developmentWeeks: 10,
  productionWeeks: 10,
  revenue: 0,
  weeklyRevenue: 0,
  releaseWeek: null,
  accumulatedCost: 0,
  momentum: 50,
  progress: 0,
  activeCrisis: null
} as Project;

const mockTalent: Talent = {
  id: "t1", 
  name: "Star", 
  role: "actor",
  roles: ["actor"], 
  tier: "A_LIST",
  prestige: 50, 
  fee: 1_000_000, 
  draw: 50,
  accessLevel: "outsider",
  momentum: 50,
  demographics: { age: 30, gender: 'MALE', ethnicity: 'White', country: 'USA' },
  psychology: { ego: 50, mood: 100, scandalRisk: 0, synergyAffinities: [], synergyConflicts: [] }
} as Talent;

describe("releaseSimulation system", () => {
  const rng = new RandomGenerator(42);

  describe("calculateReviewScore", () => {
    it("calculates base score clamped between 1 and 100", () => {
      const score = calculateReviewScore(mockProject, [], undefined, rng);
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("applies penalty for active, unresolved crises", () => {
      const crisis: ActiveCrisis = { crisisId: 'c1', triggeredWeek: 1, description: "Bad", options: [], resolved: false, severity: 'medium', haltedProduction: false };
      
      const baseScore = calculateReviewScore(mockProject, [], undefined, rng);
      const penaltyScore = calculateReviewScore(mockProject, [], crisis, rng);

      expect(penaltyScore).toBeLessThan(baseScore);
    });

    it("ignores absent crises", () => {
      const scoreNoCrisis = calculateReviewScore(mockProject, [], undefined, rng);
      const scoreNullCrisis = calculateReviewScore(mockProject, [], null, rng);

      expect(Math.abs(scoreNoCrisis - scoreNullCrisis)).toBeLessThanOrEqual(10); // RNG variance but close
    });
  });

  describe("calculateOpeningWeekend", () => {
    it("returns updated project and feedback", () => {
       const { project, feedback } = calculateOpeningWeekend(mockProject, [mockTalent], 50, rng);
       expect(project.revenue).toBeGreaterThan(0);
       expect(feedback).toBeDefined();
    });
  });

  describe("simulateWeeklyBoxOffice", () => {
    it("applies decay based on review score legs", () => {
      // Excellent legs (score > 80) -> 0.8
      const excellentRevenue = simulateWeeklyBoxOffice(mockProject, 2, 90, 1_000_000, 0);
      expect(excellentRevenue).toBe(800_000);

      // Average legs (score > 60) -> 0.7
      const averageRevenue = simulateWeeklyBoxOffice(mockProject, 2, 70, 1_000_000, 0);
      expect(averageRevenue).toBe(700_000);

      // Bad legs (score < 40) -> 0.4
      const badRevenue = simulateWeeklyBoxOffice(mockProject, 2, 30, 100_000, 0);
      expect(badRevenue).toBe(40_000);
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
  });
});
