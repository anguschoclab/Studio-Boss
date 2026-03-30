/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateAwardsProfile, runAwardsCeremony } from "../../../engine/systems/awards";
import { Project, GameState } from "../../../engine/types";
import * as utils from '../../../engine/utils';

describe("awards system", () => {

  describe("Guild Auditor: Edge Cases", () => {
    it("handles an empty project list safely during runAwardsCeremony", () => {
      const impact = runAwardsCeremony([], 52, 2026);
      expect(impact).toEqual({});
    });

    it("handles extreme negative budget / buzz values when generating awards profile", () => {
      const negativeProject: Project = {
          id: "proj-neg",
          title: "Test Project",
          format: "film",
          genre: "Drama",
          budgetTier: "mid",
          budget: -10000000,
          weeklyCost: 100000,
          targetAudience: "Adults",
          flavor: "Gritty drama",
          status: "released",
          buzz: -50,
          weeksInPhase: 0,
          developmentWeeks: 4,
          productionWeeks: 4,
          revenue: 0,
          weeklyRevenue: 0,
          releaseWeek: 10,
      };
      const profile = generateAwardsProfile(negativeProject);
      expect(profile).toBeDefined();
      expect(profile.prestigeScore).toBeGreaterThanOrEqual(0);
      expect(profile.indieCredibility).toBeGreaterThanOrEqual(0);
    });
  });

  describe("runAwardsCeremony", () => {
    const eligibleProject: Project = {
      id: "proj-1",
      title: "Award Winner",
      format: "film",
      genre: "Drama",
      budgetTier: "mid",
      budget: 10000000,
      weeklyCost: 100000,
      targetAudience: "Adults",
      flavor: "Oscar bait",
      status: "released",
      buzz: 80,
      weeksInPhase: 0,
      developmentWeeks: 4,
      productionWeeks: 4,
      revenue: 0,
      weeklyRevenue: 0,
      releaseWeek: 80,
      awardsProfile: {
        criticScore: 90,
        audienceScore: 80,
        prestigeScore: 85,
        craftScore: 95,
        culturalHeat: 70,
        campaignStrength: 20,
        controversyRisk: 5,
        festivalBuzz: 90,
        academyAppeal: 90,
        guildAppeal: 85,
        populistAppeal: 60,
        indieCredibility: 40,
        industryNarrativeScore: 80
      }
    };

    it("should award 'won' status for high scores (> 150)", () => {
      // Week 10 is Academy Awards
      const impact = runAwardsCeremony([eligibleProject], 10, 2024);
      expect(impact.prestigeChange).toBeGreaterThanOrEqual(10);
      expect(impact.newHeadlines?.some(h => h.text.includes('won'))).toBe(true);
    });

    it("should correctly accumulate prestige change", () => {
      // Week 10 is Academy Awards
      const impact = runAwardsCeremony([eligibleProject], 10, 2024);
      // It wins multiple awards (Best Picture, Best Director)
      expect(impact.prestigeChange).toBeGreaterThanOrEqual(20);
    });

    it("should filter awards by project format", () => {
      const tvProject: Project = { ...eligibleProject, format: "tv", id: "tv-1" };
      // Week 37 is Emmys
      const impact = runAwardsCeremony([tvProject], 37, 2024);

      expect(impact.newsEvents?.some(e => e.headline.includes('Wins'))).toBe(true);
      expect(impact.newHeadlines?.some(h => h.text.includes('🏆'))).toBe(true);
    });
  });
});
