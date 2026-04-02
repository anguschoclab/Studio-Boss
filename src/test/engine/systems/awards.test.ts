import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateAwardsProfile, runAwardsCeremony, processRazzies } from "../../../engine/systems/awards";
import { Project, GameState, Talent, ContentFlag } from "../../../engine/types";
import { RandomGenerator } from "../../../engine/utils/rng";

describe("awards system", () => {

  const getInitialState = (): GameState => ({
    week: 1,
    gameSeed: 1,
    tickCount: 0,
    projects: { active: [] },
    game: { currentWeek: 1 },
    finance: { cash: 1_000_000, ledger: [] },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    studio: {
      name: 'Test Studio',
      archetype: 'major',
      prestige: 50,
      internal: {
        projects: {}, 
        contracts: []
      }
    },
    market: { opportunities: [], buyers: [] },
    industry: {
      rivals: [],
      families: [],
      agencies: [],
      agents: [],
      talentPool: {},
      newsHistory: [],
      rumors: []
    },
    culture: { genrePopularity: {} },
    history: [],
    eventHistory: []
  } as unknown as GameState);

  const eligibleProject: Project = {
    id: "proj-1",
    title: "Award Winner",
    type: 'FILM',
    format: "film",
    genre: "Drama",
    budgetTier: "mid",
    budget: 10_000_000,
    weeklyCost: 100_000,
    targetAudience: "Adults",
    flavor: "Oscar bait",
    state: "released",
    buzz: 80,
    weeksInPhase: 0,
    developmentWeeks: 4,
    productionWeeks: 4,
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: 5,
    accumulatedCost: 0,
    momentum: 50,
    progress: 0,
    activeCrisis: null,
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
  } as Project;

  describe("generateAwardsProfile", () => {
    it("handles extreme negative values", () => {
      const rng = new RandomGenerator(1);
      const negativeProject = { ...eligibleProject, budget: -10_000_000, buzz: -50 } as Project;
      const profile = generateAwardsProfile(negativeProject, rng);
      expect(profile).toBeDefined();
      expect(profile.prestigeScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe("runAwardsCeremony", () => {
    it("awards 'won' status for high scores at Academy Awards (Week 10)", () => {
      const rng = new RandomGenerator(1);
      const state = getInitialState();
      state.studio.internal.projects = { [eligibleProject.id]: eligibleProject };
      state.week = 10;

      const impact = runAwardsCeremony(state, 10, 2024, rng);
      
      expect(impact.newHeadlines![0].text).toContain("Academy Awards");
      expect(impact.newAwards?.some(a => a.status === 'won')).toBe(true);
      expect(impact.uiNotifications?.some(n => n.includes('won'))).toBe(true);
    });

    it("accumulates prestige change", () => {
      const rng = new RandomGenerator(1);
      const state = getInitialState();
      state.studio.internal.projects = { [eligibleProject.id]: eligibleProject };
      state.week = 10;

      const impact = runAwardsCeremony(state, 10, 2024, rng);
      expect(impact.prestigeChange).toBeGreaterThanOrEqual(10);
    });
  });

  describe("processRazzies", () => {
      it("triggers Razzie penalty for high-budget, low-score films", () => {
          const rng = new RandomGenerator(1);
          const badFilm = {
              ...eligibleProject,
              id: "bad-1",
              title: "Disaster Piece",
              budget: 100_000_000,
              budgetTier: "high",
              reviewScore: 10,
              buzz: 10,
              releaseWeek: 5
          } as Project;
          const state = getInitialState();
          state.studio.internal.projects = { [badFilm.id]: badFilm };
          state.week = 4;

          const impact = processRazzies(state, 4, rng);

          expect(impact.prestigeChange).toBe(-10);
          expect(impact.uiNotifications?.some(n => n.includes('Worst Picture'))).toBe(true);
      });
  });
});
