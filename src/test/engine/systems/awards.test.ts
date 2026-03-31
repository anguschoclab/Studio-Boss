/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateAwardsProfile, runAwardsCeremony, processRazzies } from "../../../engine/systems/awards";
import { Project, GameState } from "../../../engine/types";
import { StateImpact } from "../../../engine/types/state.types";

describe("awards system", () => {

  const getInitialState = (): GameState => ({
    week: 1,
    cash: 1000000,
    studio: {
      name: 'Test Studio',
      archetype: 'major',
      prestige: 50,
      internal: {
        projects: {}, 
        contracts: [],
        financeHistory: []
      }
    },
    market: { opportunities: [], buyers: [] },
    industry: {
      rivals: [],
      headlines: [],
      families: [],
      agencies: [],
      agents: [],
      talentPool: {},
      newsHistory: []
    },
    culture: { genrePopularity: {} },
    finance: { bankBalance: 1000000, yearToDateRevenue: 0, yearToDateExpenses: 0 },
    history: []
  } as unknown as GameState);

  describe("generateAwardsProfile: Edge Cases", () => {
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
      releaseWeek: 5, // Released recently
      awardsProfile: {
        criticScore: 95,
        audienceScore: 80,
        prestigeScore: 90,
        craftScore: 95,
        culturalHeat: 70,
        campaignStrength: 20,
        controversyRisk: 5,
        festivalBuzz: 90,
        academyAppeal: 95,
        guildAppeal: 90,
        populistAppeal: 60,
        indieCredibility: 40,
        industryNarrativeScore: 80
      }
    };

    it("should award 'won' status for high scores at Academy Awards (Week 10)", () => {
      const state = getInitialState();
      state.studio.internal.projects = { [eligibleProject.id]: eligibleProject };
      state.week = 10;

      const impact = runAwardsCeremony(state, 10, 2024);
      
      expect(impact.newHeadlines![0].text).toContain("Academy Awards");
      expect(impact.newAwards?.some(a => a.status === 'won')).toBe(true);
      expect(impact.uiNotifications?.some(n => n.includes('won'))).toBe(true);
    });

    it("should correctly accumulate prestige change", () => {
      const state = getInitialState();
      state.studio.internal.projects = { [eligibleProject.id]: eligibleProject };
      state.week = 10;

      const impact = runAwardsCeremony(state, 10, 2024);
      // It wins multiple awards as a high-tier project
      expect(impact.prestigeChange).toBeGreaterThanOrEqual(20);
    });

    it("should filter awards by project format (TV/Emmys Week 37)", () => {
      const tvProject: Project = { ...eligibleProject, format: "tv", id: "tv-1" };
      const state = getInitialState();
      state.studio.internal.projects = { [tvProject.id]: tvProject };
      state.week = 37;

      const impact = runAwardsCeremony(state, 37, 2024);

      expect(impact.uiNotifications?.some(n => n.includes('won'))).toBe(true);
      expect(impact.newsEvents?.some(e => (e.headline || '').includes('Wins'))).toBe(true);
    });
  });

  describe("processRazzies", () => {
      it("triggers Razzie penalty for high-budget, low-score films", () => {
          const badFilm: Project = {
              id: "bad-1",
              title: "Disaster Piece",
              format: "film",
              genre: "Action",
              budget: 100_000_000,
              budgetTier: "high",
              weeklyCost: 1000000,
              targetAudience: "General",
              flavor: "Explosions",
              status: "released",
              buzz: 10,
              weeksInPhase: 0,
              developmentWeeks: 10,
              productionWeeks: 10,
              revenue: 0,
              weeklyRevenue: 0,
              releaseWeek: 5,
              reviewScore: 10
          };
          const state = getInitialState();
          state.studio.internal.projects = { [badFilm.id]: badFilm };
          state.week = 4; // Razzies happen in week 4

          const impact = processRazzies(state, 4);

          expect(impact.prestigeChange).toBe(-10);
          expect(impact.uiNotifications?.some(n => n.includes('Worst Picture'))).toBe(true);
      });
  });
});
