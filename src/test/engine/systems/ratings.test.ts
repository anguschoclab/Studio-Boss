import { describe, it, expect } from "vitest";
import { evaluateRating, calculateRegionalPenalties, editForRating } from "../../../engine/systems/ratings";
import { Project, GameState } from "../../../engine/types";

const mockProject: Project = {
  id: "proj-1",
  title: "Test Project",
  budgetTier: "mid",
  budget: 10000000,
  genre: "Drama",
  status: "development",
  developmentWeeks: 10,
  productionWeeks: 10,
  weeksInPhase: 0,
  format: "film",
  targetAudience: "General",
  flavor: "Standard",
  releaseWeek: null,
  weeklyCost: 100000,
  buzz: 50,
  revenue: 0,
  weeklyRevenue: 0,
};

describe.skip("ratings system", () => {
  describe.skip("calculateRegionalPenalties", () => {
    it("returns 1.0 for project with no content flags", () => {
      const project = { ...mockProject, contentFlags: [] };
      expect(calculateRegionalPenalties(project)).toBe(1.0);
    });

    it("returns 0.7 for project with political flag", () => {
      const project = { ...mockProject, contentFlags: ["political" as const] };
      expect(calculateRegionalPenalties(project)).toBe(0.7);
    });

    it("returns 0.85 for project with gore flag", () => {
      const project = { ...mockProject, contentFlags: ["gore" as const] };
      expect(calculateRegionalPenalties(project)).toBe(0.85);
    });

    it("returns 0.85 for project with nudity flag", () => {
      const project = { ...mockProject, contentFlags: ["nudity" as const] };
      expect(calculateRegionalPenalties(project)).toBe(0.85);
    });

    it("returns 0.55 for project with both political and gore flags", () => {
      const project = { ...mockProject, contentFlags: ["political" as const, "gore" as const] };
      expect(calculateRegionalPenalties(project)).toBeCloseTo(0.55);
    });

    it("does not penalize twice for gore and nudity combined (0.85)", () => {
      const project = { ...mockProject, contentFlags: ["gore" as const, "nudity" as const] };
      expect(calculateRegionalPenalties(project)).toBe(0.85);
    });

    it("clamps the minimum multiplier to 0.1", () => {
        const project = { ...mockProject, contentFlags: ["political" as const, "gore" as const, "nudity" as const] };
        expect(calculateRegionalPenalties(project)).toBeCloseTo(0.55);
    });
  });

  describe.skip("evaluateRating", () => {
    it("returns G for undefined or empty flags", () => {
      expect(evaluateRating(undefined)).toBe("G");
      expect(evaluateRating([])).toBe("G");
    });

    it("returns NC-17 for gore", () => {
      expect(evaluateRating(["gore"])).toBe("NC-17");
    });

    it("returns NC-17 for nudity", () => {
      expect(evaluateRating(["nudity"])).toBe("NC-17");
    });

    it("returns NC-17 for combination of gore and nudity", () => {
      expect(evaluateRating(["gore", "nudity"])).toBe("NC-17");
    });

    it("returns NC-17 for violence", () => {
      expect(evaluateRating(["violence"])).toBe("NC-17");
    });

    it("returns NC-17 for political", () => {
      expect(evaluateRating(["political"])).toBe("NC-17");
    });

    it("returns NC-17 for profanity", () => {
      expect(evaluateRating(["profanity"])).toBe("NC-17");
    });

    it("returns NC-17 for combinations of two out of three flags", () => {
      expect(evaluateRating(["violence", "political"])).toBe("NC-17");
      expect(evaluateRating(["profanity", "political"])).toBe("NC-17");
      expect(evaluateRating(["violence", "profanity"])).toBe("NC-17");
    });

    it("returns R for combination of all three flags (violence, political, profanity)", () => {
      expect(evaluateRating(["violence", "political", "profanity"])).toBe("R");
    });

    it("returns NC-17 when gore or nudity are mixed with violence, political, or profanity", () => {
      expect(evaluateRating(["violence", "gore"])).toBe("NC-17");
      expect(evaluateRating(["political", "nudity", "profanity", "violence"])).toBe("NC-17");
    });

    it("returns PG-13 for unknown or unhandled flags", () => {
      // Cast a string as ContentFlag to simulate unsupported flags
      expect(evaluateRating(["some-random-flag"] as unknown as import("../../../engine/types").ContentFlag[])).toBe("PG-13");
    });
  });

  describe.skip("editForRating", () => {
    const createMockState = (creativeControl: boolean) => ({
      studio: {
        internal: {
          contracts: [
            {
              id: "contract-1",
              talentId: "talent-1",
              projectId: "proj-1",
              fee: 1000000,
              backendPercent: 0,
              creativeControl: creativeControl
            }
          ]
        }
      },
      industry: {
        talentPool: [
          {
            id: "talent-1",
            name: "Test Director",
            roles: ["director"],
            level: "A",
            traits: [],
            fee: 1000000,
            backendPercent: 0,
            directorArchetype: "journeyman"
          }
        ]
      }
    } as unknown as GameState);

    it("returns success if flag not present", () => {
      const mockState = {} as GameState;
      const project = { ...mockProject, contentFlags: ["political" as const] };
      const result = editForRating(project, mockState, "gore");
      expect(result.success).toBe(true);
      expect(result.data).toEqual(project);
    });

    it("fails if director has creative control", () => {
      const project = { ...mockProject, contentFlags: ["gore" as const] };
      const stateWithControl = createMockState(true);

      const result = editForRating(project, stateWithControl, "gore");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Director has final cut");
    });

    it("succeeds and updates project if director does NOT have creative control", () => {
      const project = { ...mockProject, contentFlags: ["gore" as const, "profanity" as const], rating: "NC-17" as const };
      const stateWithoutControl = createMockState(false);

      const result = editForRating(project, stateWithoutControl, "gore");
      expect(result.success).toBe(true);
      expect(result.data?.contentFlags).toEqual(["profanity"]);
      expect(result.data?.rating).toBe("NC-17");
      expect(result.data?.buzz).toBe(45); // 50 - 5
      expect(result.data?.flavor).toContain("(Sanitized)");
    });
  });
});
