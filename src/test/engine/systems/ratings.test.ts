import { describe, it, expect } from "vitest";
import { evaluateRating, calculateRegionalPenalties, editForRating } from "../../../engine/systems/ratings";
import { Project, GameState, ContentFlag } from "../../../engine/types";

const mockProject: Project = {
  id: "proj-1",
  title: "Test Project",
  type: 'FILM',
  budgetTier: "mid",
  budget: 10_000_000,
  genre: "Drama",
  state: "development",
  weeksInPhase: 0,
  developmentWeeks: 10,
  productionWeeks: 10,
  format: "film",
  targetAudience: "General",
  flavor: "Standard",
  releaseWeek: null,
  weeklyCost: 100_000,
  buzz: 50,
  revenue: 0,
  weeklyRevenue: 0,
  accumulatedCost: 0,
  momentum: 50,
  progress: 0,
  activeCrisis: null,
  contentFlags: [] as ContentFlag[]
} as Project;

describe("ratings system", () => {
  describe("calculateRegionalPenalties", () => {
    it("returns 1.0 for project with no content flags", () => {
      const project = { ...mockProject, contentFlags: [] as ContentFlag[] };
      expect(calculateRegionalPenalties(project)).toBe(1.0);
    });

    it("returns 0.7 for project with political flag", () => {
      const project = { ...mockProject, contentFlags: ["political" as ContentFlag] };
      expect(calculateRegionalPenalties(project)).toBe(0.7);
    });

    it("returns 0.85 for project with gore flag", () => {
      const project = { ...mockProject, contentFlags: ["gore" as ContentFlag] };
      expect(calculateRegionalPenalties(project)).toBe(0.85);
    });

    it("returns 0.55 for project with both political and gore flags", () => {
      const project = { ...mockProject, contentFlags: ["political" as ContentFlag, "gore" as ContentFlag] };
      expect(calculateRegionalPenalties(project)).toBeCloseTo(0.55);
    });
  });

  describe("evaluateRating", () => {
    it("returns G for undefined or empty flags", () => {
      expect(evaluateRating(undefined)).toBe("G");
      expect(evaluateRating([])).toBe("G");
    });

    it("returns NC-17 for gore", () => {
      expect(evaluateRating(["gore"])).toBe("NC-17");
    });

    it("returns R for combo of three", () => {
       expect(evaluateRating(["violence", "political", "profanity"])).toBe("R");
    });
  });

  describe("editForRating", () => {
    const mockState = {
        studio: {
            internal: {
                contracts: []
            }
        }
    } as unknown as GameState;

    it("returns success if flag not present", () => {
      const project = { ...mockProject, contentFlags: ["political" as ContentFlag] };
      const result = editForRating(project, mockState, "gore" as ContentFlag);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(project);
    });

    it("succeeds and updates project if no creative control", () => {
      const project = { ...mockProject, contentFlags: ["gore" as ContentFlag], rating: "NC-17" as const };
      const result = editForRating(project, mockState, "gore" as ContentFlag);
      expect(result.success).toBe(true);
      expect(result.data?.contentFlags).not.toContain("gore");
      expect(result.data?.buzz).toBe(45);
    });
  });
});
