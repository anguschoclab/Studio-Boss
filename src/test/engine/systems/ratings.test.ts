import { describe, it, expect } from "vitest";
import {
  evaluateRating,
  evaluateFilmRating,
  evaluateTvRating,
  evaluateRatingForProject,
  getRatingEconomics,
  calculateRegionalPenalties,
  evaluateRegionalRatings,
  editForRating,
  checkDirectorsCutEligibility
} from "../../../engine/systems/ratings";
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

const mockState = {
  studio: {
    internal: {
      contracts: []
    }
  }
} as unknown as GameState;

describe("ratings system", () => {

  // ---------------------------------------------------------------------------
  // evaluateFilmRating
  // ---------------------------------------------------------------------------
  describe("evaluateFilmRating", () => {
    it("returns G for no flags", () => {
      expect(evaluateFilmRating([])).toBe("G");
    });

    it("returns PG for supernatural only", () => {
      expect(evaluateFilmRating(["supernatural"])).toBe("PG");
    });

    it("returns PG for gambling only", () => {
      expect(evaluateFilmRating(["gambling"])).toBe("PG");
    });

    it("returns PG-13 for violence alone (bug fix)", () => {
      expect(evaluateFilmRating(["violence"])).toBe("PG-13");
    });

    it("returns PG-13 for profanity alone (bug fix)", () => {
      expect(evaluateFilmRating(["profanity"])).toBe("PG-13");
    });

    it("returns PG-13 for drug_use alone", () => {
      expect(evaluateFilmRating(["drug_use"])).toBe("PG-13");
    });

    it("returns PG-13 for lgbtq_themes alone", () => {
      expect(evaluateFilmRating(["lgbtq_themes"])).toBe("PG-13");
    });

    it("returns R for violence + profanity", () => {
      expect(evaluateFilmRating(["violence", "profanity"])).toBe("R");
    });

    it("returns R for political flag", () => {
      expect(evaluateFilmRating(["political"])).toBe("R");
    });

    it("returns R for violence + drug_use", () => {
      expect(evaluateFilmRating(["violence", "drug_use"])).toBe("R");
    });

    it("returns NC-17 for gore", () => {
      expect(evaluateFilmRating(["gore"])).toBe("NC-17");
    });

    it("returns NC-17 for nudity", () => {
      expect(evaluateFilmRating(["nudity"])).toBe("NC-17");
    });

    it("returns NC-17 for sexual_content", () => {
      expect(evaluateFilmRating(["sexual_content"])).toBe("NC-17");
    });

    it("returns R for combo of three (backward compat)", () => {
      expect(evaluateFilmRating(["violence", "political", "profanity"])).toBe("R");
    });
  });

  // ---------------------------------------------------------------------------
  // evaluateRating (backward-compat wrapper)
  // ---------------------------------------------------------------------------
  describe("evaluateRating (backward compat)", () => {
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

  // ---------------------------------------------------------------------------
  // evaluateTvRating
  // ---------------------------------------------------------------------------
  describe("evaluateTvRating", () => {
    it("returns TV-G for no flags", () => {
      expect(evaluateTvRating([])).toBe("TV-G");
    });

    it("returns TV-PG for supernatural", () => {
      expect(evaluateTvRating(["supernatural"])).toBe("TV-PG");
    });

    it("returns TV-14 for violence", () => {
      expect(evaluateTvRating(["violence"])).toBe("TV-14");
    });

    it("returns TV-MA for gore", () => {
      expect(evaluateTvRating(["gore"])).toBe("TV-MA");
    });

    it("returns TV-MA for nudity", () => {
      expect(evaluateTvRating(["nudity"])).toBe("TV-MA");
    });
  });

  // ---------------------------------------------------------------------------
  // evaluateRatingForProject
  // ---------------------------------------------------------------------------
  describe("evaluateRatingForProject", () => {
    it("uses film scale for FILM projects", () => {
      expect(evaluateRatingForProject(["violence"], "FILM")).toBe("PG-13");
    });

    it("uses TV scale for SERIES projects", () => {
      expect(evaluateRatingForProject(["violence"], "SERIES")).toBe("TV-14");
    });
  });

  // ---------------------------------------------------------------------------
  // getRatingEconomics
  // ---------------------------------------------------------------------------
  describe("getRatingEconomics", () => {
    it("PG-13 is the neutral baseline", () => {
      const econ = getRatingEconomics("PG-13");
      expect(econ.theaterAccessPct).toBe(1.0);
      expect(econ.audienceReachMultiplier).toBe(1.0);
      expect(econ.merchMultiplier).toBe(1.0);
      expect(econ.awardsPrestigeBonus).toBe(0);
    });

    it("G rating gives merch bonus and G audience penalty", () => {
      const econ = getRatingEconomics("G");
      expect(econ.merchMultiplier).toBeGreaterThan(1.0);
      expect(econ.audienceReachMultiplier).toBeLessThan(1.0);
    });

    it("NC-17 severely limits theater access", () => {
      const econ = getRatingEconomics("NC-17");
      expect(econ.theaterAccessPct).toBe(0.30);
      expect(econ.audienceReachMultiplier).toBeLessThan(0.7);
    });

    it("Unrated has a streaming premium", () => {
      const econ = getRatingEconomics("Unrated");
      expect(econ.streamingPremium).toBeGreaterThan(0);
      expect(econ.theaterAccessPct).toBe(0.15);
    });

    it("R earns an awards prestige bonus", () => {
      const econ = getRatingEconomics("R");
      expect(econ.awardsPrestigeBonus).toBeGreaterThan(0);
    });

    it("TV-MA has a streaming premium", () => {
      const econ = getRatingEconomics("TV-MA");
      expect(econ.streamingPremium).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // calculateRegionalPenalties
  // ---------------------------------------------------------------------------
  describe("calculateRegionalPenalties", () => {
    it("returns 1.0 for project with no content flags", () => {
      const project = { ...mockProject, contentFlags: [] as ContentFlag[] };
      expect(calculateRegionalPenalties(project)).toBe(1.0);
    });

    it("penalizes political flag (bans China 20%, restricts India)", () => {
      const project = { ...mockProject, contentFlags: ["political" as ContentFlag] };
      const result = calculateRegionalPenalties(project);
      // China banned (20%), India restricted (6% × 0.30 penalty = 1.8%)
      // middleeast banned (5%)
      // ~26% total loss → ~0.74
      expect(result).toBeLessThan(1.0);
      expect(result).toBeGreaterThan(0.5); // not catastrophic
    });

    it("penalizes gore flag (bans China, restricts others)", () => {
      const project = { ...mockProject, contentFlags: ["gore" as ContentFlag] };
      const result = calculateRegionalPenalties(project);
      expect(result).toBeLessThan(1.0);
    });

    it("lgbtq_themes flag bans China, latam, and middleeast", () => {
      const project = { ...mockProject, contentFlags: ["lgbtq_themes" as ContentFlag] };
      const result = calculateRegionalPenalties(project);
      // China (20%) + latam (7%) + middleeast (5%) = 32% lost → ~0.68
      expect(result).toBeCloseTo(0.68, 1);
    });

    it("combined flags compound the penalty", () => {
      const single = { ...mockProject, contentFlags: ["lgbtq_themes" as ContentFlag] };
      const combined = { ...mockProject, contentFlags: ["lgbtq_themes" as ContentFlag, "gore" as ContentFlag] };
      expect(calculateRegionalPenalties(combined)).toBeLessThan(calculateRegionalPenalties(single));
    });

    it("does not go below 0.1 floor", () => {
      const project = {
        ...mockProject,
        contentFlags: ["lgbtq_themes", "political", "nudity", "gore", "religious", "supernatural"] as ContentFlag[]
      };
      expect(calculateRegionalPenalties(project)).toBeGreaterThanOrEqual(0.1);
    });

    it("handles duplicate content flags gracefully (Guild Auditor)", () => {
      const single = { ...mockProject, contentFlags: ["lgbtq_themes" as ContentFlag] };
      const duplicate = { ...mockProject, contentFlags: ["lgbtq_themes" as ContentFlag, "lgbtq_themes" as ContentFlag] };
      expect(calculateRegionalPenalties(duplicate)).toBeCloseTo(calculateRegionalPenalties(single));
    });
  });

  // ---------------------------------------------------------------------------
  // evaluateRegionalRatings
  // ---------------------------------------------------------------------------
  describe("evaluateRegionalRatings", () => {
    it("returns 8 market entries", () => {
      const result = evaluateRegionalRatings([], "PG-13");
      expect(result).toHaveLength(8);
    });

    it("marks China as banned for lgbtq_themes", () => {
      const result = evaluateRegionalRatings(["lgbtq_themes"], "PG-13");
      const china = result.find(r => r.market === "china");
      expect(china?.isBanned).toBe(true);
    });

    it("does not ban US for any normal flags", () => {
      const result = evaluateRegionalRatings(["gore", "lgbtq_themes", "nudity", "political"], "NC-17");
      const us = result.find(r => r.market === "us");
      expect(us?.isBanned).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // editForRating
  // ---------------------------------------------------------------------------
  describe("editForRating", () => {
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
      // Buzz drops 12 for gore (major flag)
      expect(result.data?.buzz).toBe(38);
    });

    it("marks project as sanitized when removing a major flag", () => {
      const project = { ...mockProject, contentFlags: ["gore" as ContentFlag], rating: "NC-17" as const };
      const result = editForRating(project, mockState, "gore" as ContentFlag);
      expect(result.data?.activeCut).toBe("sanitized");
      expect(result.data?.flavor).toContain("(Sanitized)");
    });

    it("drops only 3 buzz for minor flag removal", () => {
      const project = { ...mockProject, contentFlags: ["supernatural" as ContentFlag], buzz: 50 };
      const result = editForRating(project, mockState, "supernatural" as ContentFlag);
      expect(result.data?.buzz).toBe(47); // -3 for minor flag
    });

    it("recalculates regional ratings after edit", () => {
      const project = { ...mockProject, contentFlags: ["lgbtq_themes" as ContentFlag] };
      const result = editForRating(project, mockState, "lgbtq_themes" as ContentFlag);
      expect(result.data?.regionalRatings).toBeDefined();
      const china = result.data?.regionalRatings?.find(r => r.market === "china");
      expect(china?.isBanned).toBe(false); // lgbtq_themes removed → China no longer bans it
    });

    it("handles project with extreme negative buzz safely (Guild Auditor)", () => {
      const project = { ...mockProject, contentFlags: ["gore" as ContentFlag], buzz: -50 };
      const result = editForRating(project, mockState, "gore" as ContentFlag);
      expect(result.data?.buzz).toBe(0); // Buzz is clamped to Math.max(0, ...)
    });
  });

  // ---------------------------------------------------------------------------
  // checkDirectorsCutEligibility
  // ---------------------------------------------------------------------------
  describe("checkDirectorsCutEligibility", () => {
    it("not eligible if project was never sanitized", () => {
      const project = { ...mockProject, state: "post_release" as const, releaseWeek: 10 };
      const result = checkDirectorsCutEligibility(project, 16);
      expect(result.eligible).toBe(false);
    });

    it("not eligible if project already has a director's cut", () => {
      const project = {
        ...mockProject,
        state: "post_release" as const,
        releaseWeek: 10,
        availableCuts: [
          { type: "sanitized" as const, rating: "PG-13" as const, contentFlags: [], buzzCost: 12, revenueMultiplier: 1 },
          { type: "directors_cut" as const, rating: "R" as const, contentFlags: [], buzzCost: 0, revenueMultiplier: 0.3 }
        ]
      };
      const result = checkDirectorsCutEligibility(project, 16);
      expect(result.eligible).toBe(false);
    });

    it("eligible after 4 weeks post-release with sanitized cut", () => {
      const project = {
        ...mockProject,
        state: "post_release" as const,
        releaseWeek: 10,
        directorsCutNotified: false,
        availableCuts: [
          { type: "sanitized" as const, rating: "PG-13" as const, contentFlags: [], buzzCost: 12, revenueMultiplier: 1 }
        ]
      };
      const result = checkDirectorsCutEligibility(project, 14);
      expect(result.eligible).toBe(true);
    });

    it("not eligible if fewer than 4 weeks since release", () => {
      const project = {
        ...mockProject,
        state: "post_release" as const,
        releaseWeek: 10,
        availableCuts: [
          { type: "sanitized" as const, rating: "PG-13" as const, contentFlags: [], buzzCost: 12, revenueMultiplier: 1 }
        ]
      };
      const result = checkDirectorsCutEligibility(project, 12);
      expect(result.eligible).toBe(false);
      expect(result.weeksUntilEarliestRelease).toBe(2);
    });
  });
});
