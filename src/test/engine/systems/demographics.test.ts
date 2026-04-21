import { describe, it, expect, beforeEach } from "vitest";
import { simulateMarketingCampaign, calculateAudienceIndex } from "../../../engine/systems/demographics";
import { GameState, Project, AudienceQuadrant, ContentFlag } from "../../../engine/types";

const mockProject: Project = {
  id: "p1",
  title: "Test Project",
  type: 'FILM',
  format: "film",
  genre: "Drama",
  budgetTier: "mid",
  budget: 10_000_000,
  weeklyCost: 100_000,
  targetAudience: "General",
  flavor: "Standard",
  state: "development",
  weeksInPhase: 0,
  developmentWeeks: 10,
  productionWeeks: 10,
  revenue: 0,
  weeklyRevenue: 0,
  releaseWeek: null,
  buzz: 10,
  accumulatedCost: 0,
  momentum: 50,
  progress: 0,
  activeCrisis: null,
  rating: 'PG-13',
  contentFlags: [] as ContentFlag[]
} as Project;

describe("Demographics System", () => {
  describe("calculateAudienceIndex", () => {
    it("evaluates male_under_25 quadrant correctly", () => {
      const actionProject = { ...mockProject, genre: "Action" } as Project;
      // target contains 'male' (+0.3 for Action), contains 'under_25' (+0 for Action). Base 1.0 + 0.3 = 1.3
      expect(calculateAudienceIndex(actionProject, "male_under_25")).toBeCloseTo(1.3);
    });

    it("evaluates four_quadrant correctly with budget", () => {
      const blockbuster = { ...mockProject, genre: "Action", budgetTier: "blockbuster" } as Project;
      // target is 'four_quadrant'. budgetTier 'blockbuster' (+0.5). Base 1.0 + 0.5 = 1.5
      expect(calculateAudienceIndex(blockbuster, "four_quadrant")).toBeCloseTo(1.5);
    });

    it("applies rating penalties correctly", () => {
      const rRatedUnder25 = { ...mockProject, rating: "R", genre: "Action" } as Project;
      // Index: 1.0 + 0.3 (action-male) - 0.5 (R-under25) = 0.8
      expect(calculateAudienceIndex(rRatedUnder25, "male_under_25")).toBeCloseTo(0.8);
    });
  });

  describe("simulateMarketingCampaign", () => {
    let mockState: GameState;

    beforeEach(() => {
      mockState = {
        week: 1,
        gameSeed: 1,
        tickCount: 0,
        projects: { active: [] },
        game: { currentWeek: 1 },
        finance: { cash: 1_000_000, ledger: [] },
        news: { headlines: [] },
        ip: { vault: [], franchises: {} },
        studio: {
          name: "Test Studio",
          archetype: 'major',
          prestige: 50,
          internal: {
            projects: {
              "p1": { ...mockProject }
            },
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
          newsHistory: []
        },
        culture: { genrePopularity: {} },
        history: [],
        eventHistory: []
      } as unknown as GameState;
    });

    it("returns unmodified state if project is not found", () => {
      const result = simulateMarketingCampaign(mockState, "invalid_id", 100_000, "male_under_25");
      expect(result).toBe(mockState);
    });

    it("returns unmodified state if studio cash is insufficient", () => {
      mockState.finance.cash = 50_000;
      const result = simulateMarketingCampaign(mockState, "p1", 100_000, "male_under_25");
      expect(result).toBe(mockState);
    });

    it("deducts cash and increases project buzz", () => {
      const result = simulateMarketingCampaign(mockState, "p1", 500_000, "male_under_25");
      expect(result.finance.cash).toBe(500_000);
      expect(result.studio.internal.projects["p1"].buzz).toBeGreaterThan(10);
      expect(result.studio.internal.projects["p1"].targetDemographic).toBe("male_under_25");
    });
  });
});
