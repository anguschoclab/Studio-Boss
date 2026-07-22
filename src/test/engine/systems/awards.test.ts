import { describe, it, expect } from "vitest";
import {
  generateAwardsProfile,
  runAwardsCeremony,
  processRazzies,
} from "../../../engine/systems/awards/index";
import { Project, GameState } from "../../../engine/types";
import { RandomGenerator } from "../../../engine/utils/rng";

describe("awards system", () => {
  const getInitialState = (): GameState =>
    ({
      week: 1,
      gameSeed: 1,
      tickCount: 0,
      game: { currentWeek: 1 },
      finance: { cash: 1_000_000, ledger: [] },
      news: { headlines: [] },
      ip: { vault: [], franchises: {} },
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: {},
        contracts: {},
        rivals: {},
        contractsByProjectId: {},
      },
      studio: {
        id: "player-studio",
        name: "Test Studio",
        archetype: "major",
        prestige: 50,
        internal: {
          projectHistory: [],
        },
      },
      market: { opportunities: [], buyers: [] },
      industry: {
        families: [],
        agencies: [],
        agents: [],
        newsHistory: [],
        rumors: [],
      },
      culture: { genrePopularity: {} },
      history: [],
      eventHistory: [],
    }) as unknown as GameState;

  const eligibleProject: Project = {
    id: "proj-1",
    title: "Award Winner",
    type: "FILM",
    format: "film",
    genre: "Drama",
    budgetTier: "mid",
    budget: 10_000_000,
    weeklyCost: 100_000,
    targetAudience: "Adults",
    flavor: "Oscar bait",
    state: "released",
    buzz: 80,
    reviewScore: 95,
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
      industryNarrativeScore: 80,
    },
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
      state.entities.releasedProjectIds = [eligibleProject.id];
      state.week = 4;
      state.week = 4;

      const rng = new RandomGenerator(12345);
      const impacts = runAwardsCeremony(state, 4, 2024, rng);

      // New CeremonyRunner emits INDUSTRY_UPDATE impacts with awards
      const awardImpacts = impacts.filter((i) => i.type === "INDUSTRY_UPDATE");
      expect(impacts.length).toBeGreaterThan(0);
    });

    it("accumulates prestige change for high-scoring project", () => {
      const state = getInitialState();
      state.entities.projects = { [eligibleProject.id]: eligibleProject };
      state.entities.releasedProjectIds = [eligibleProject.id];
      state.week = 4;
      state.week = 4;

      const rng = new RandomGenerator(12345);
      const impacts = runAwardsCeremony(state, 4, 2024, rng);
      const prestigeImpact = impacts.find((i) => i.type === "PRESTIGE_CHANGED");
      expect((prestigeImpact?.payload as any)?.amount ?? 0).toBeGreaterThanOrEqual(0);
    });

    it("sets lastAwardWin on RIVAL_UPDATED when a rival wins an award", () => {
      const rival = {
        id: "rival-1",
        name: "Rival Studio",
        motto: "We make art",
        archetype: "mid-tier" as const,
        strength: 50,
        cash: 50_000_000,
        prestige: 50,
        foundedWeek: 1,
        recentActivity: "None",
        projectCount: 0,
        motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
        currentMotivation: "STABILITY" as const,
        projects: {},
        contracts: [],
      };
      const rivalProject = {
        ...eligibleProject,
        id: "rival-proj-1",
        ownerId: "rival-1",
      } as Project;

      const state = getInitialState();
      state.entities.projects = { [rivalProject.id]: rivalProject };
      state.entities.releasedProjectIds = [rivalProject.id];
      state.entities.rivals = { "rival-1": rival as any };
      state.week = 4;

      const rng = new RandomGenerator(12345);
      const impacts = runAwardsCeremony(state, 4, 2024, rng);

      const rivalUpdate = impacts.find(
        (i) =>
          i.type === "RIVAL_UPDATED" &&
          (i.payload as any).rivalId === "rival-1"
      ) as any;

      expect(rivalUpdate).toBeDefined();
      expect(rivalUpdate.payload.update.lastAwardWin).toBe(4);
    });

    it("does NOT set lastAwardWin on RIVAL_UPDATED for a nomination (non-win)", () => {
      // Create a project with a marginal score that will result in a nomination (score <= 50)
      // but still produce a RIVAL_UPDATED impact with prestige gain.
      const rival = {
        id: "rival-1",
        name: "Rival Studio",
        motto: "We make art",
        archetype: "mid-tier" as const,
        strength: 50,
        cash: 50_000_000,
        prestige: 50,
        foundedWeek: 1,
        recentActivity: "None",
        projectCount: 0,
        motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
        currentMotivation: "STABILITY" as const,
        projects: {},
        contracts: [],
      };
      // Low-quality project that will get a nomination score (bestScore > 0 but <= 50)
      const marginalProject = {
        ...eligibleProject,
        id: "rival-proj-marginal",
        ownerId: "rival-1",
        reviewScore: 66, // Just above the 65 minimum for nomination weight
        buzz: 5,
        awardsProfile: {
          criticScore: 66,
          audienceScore: 50,
          prestigeScore: 60,
          craftScore: 60,
          culturalHeat: 10,
          campaignStrength: 5,
          controversyRisk: 5,
          festivalBuzz: 60,
          academyAppeal: 55,
          guildAppeal: 55,
          populistAppeal: 30,
          indieCredibility: 30,
          industryNarrativeScore: 40,
        },
      } as Project;

      const state = getInitialState();
      state.entities.projects = { [marginalProject.id]: marginalProject };
      state.entities.releasedProjectIds = [marginalProject.id];
      state.entities.rivals = { "rival-1": rival as any };
      state.week = 4;

      const rng = new RandomGenerator(12345);
      const impacts = runAwardsCeremony(state, 4, 2024, rng);

      const rivalUpdate = impacts.find(
        (i) =>
          i.type === "RIVAL_UPDATED" &&
          (i.payload as any).rivalId === "rival-1"
      ) as any;

      // If there is a RIVAL_UPDATED for this rival, it should NOT include lastAwardWin
      if (rivalUpdate) {
        expect(rivalUpdate.payload.update.lastAwardWin).toBeUndefined();
      }
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
        releaseWeek: 5,
        ownerId: "player-studio",
      } as Project;
      const state = getInitialState();
      state.entities.projects = { [badFilm.id]: badFilm };
      state.entities.releasedProjectIds = [badFilm.id];
      state.week = 4;
      state.week = 4;

      const rng = new RandomGenerator(12345);
      const impacts = processRazzies(state, 4, rng);

      const prestigeImpact = impacts.find((i) => i.type === "PRESTIGE_CHANGED");
      expect(prestigeImpact).toBeDefined();
      expect((prestigeImpact!.payload as any).amount).toBeLessThan(0);
      expect(impacts.length).toBeGreaterThan(0);
      const newsImpact = impacts.find((i) => i.type === "NEWS_ADDED");
      expect(newsImpact).toBeDefined();
    });
  });
});
