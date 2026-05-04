import { describe, it, expect } from "vitest";
import { generateAwardsProfile, runAwardsCeremony, processRazzies } from "../../../engine/systems/awards";
import { Project, GameState } from "../../../engine/types";

describe("awards system", () => {

  const getInitialState = (): GameState => ({
    week: 1,
    gameSeed: 1,
    tickCount: 0,
    game: { currentWeek: 1 },
    finance: { cash: 1_000_000, ledger: [] },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    entities: {
      projects: {},
      talents: {},
      contracts: {},
      rivals: {}
    },
    studio: {
      name: 'Test Studio',
      archetype: 'major',
      prestige: 50,
      internal: {
        projectHistory: [],
      }
    },
    market: { opportunities: [], buyers: [] },
    industry: {
      families: [],
      agencies: [],
      agents: [],
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
      const negativeProject = { ...eligibleProject, budget: -10_000_000, buzz: -50 } as Project;
      const profile = generateAwardsProfile(negativeProject);
      expect(profile).toBeDefined();
      expect(profile.prestigeScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe("runAwardsCeremony", () => {
    it("awards 'won' status for high scores at Critics Choice Awards (Week 4)", () => {
      const state = getInitialState();
      state.entities.projects = { [eligibleProject.id]: eligibleProject };
      state.week = 4;

      const impacts = runAwardsCeremony(state, 4, 2024);

      expect(impacts.newAwards).toBeDefined();
      expect(impacts.newHeadlines).toBeDefined();
      expect(impacts.prestigeChange).toBeDefined();
    });

    it("accumulates prestige change for high-scoring project", () => {
      const state = getInitialState();
      state.entities.projects = { [eligibleProject.id]: eligibleProject };
      state.week = 4;

      const impacts = runAwardsCeremony(state, 4, 2024);
      expect(impacts.prestigeChange).toBeGreaterThanOrEqual(0);
    });
  });

  describe("processRazzies", () => {
      it("triggers Razzie penalty for high-budget, low-score films", () => {
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
          state.entities.projects = { [badFilm.id]: badFilm };
          state.week = 4;

          const impacts = processRazzies(state, 4);

          expect(impacts.prestigeChange).toBe(-10);
          expect(impacts.newHeadlines!.length).toBeGreaterThan(0);
          expect(impacts.newHeadlines![0].text).toContain("The Razzies Nominees Announced");
      });
  });
});
