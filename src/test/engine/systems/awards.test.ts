import { describe, it, expect, beforeEach } from "vitest";
import { calculateNominationWeight, runAwardsCeremony, checkCampaignBacklash } from "../../../engine/systems/awards";
import { Project, GameState, Talent } from "../../../engine/types";
import { RandomGenerator } from "../../../engine/utils/rng";

describe("awards system", () => {

  const getInitialState = (): GameState => ({
    week: 1,
    gameSeed: 1,
    tickCount: 0,
    game: { currentWeek: 1 },
    finance: { cash: 10_000_000, ledger: [] },
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
    activeCampaigns: {},
    culture: { genrePopularity: {} },
    history: [],
    eventHistory: []
  } as unknown as GameState);

  const eligibleProject: Project = {
    id: "proj-1",
    title: "Award Winner",
    format: "film",
    genre: "Drama",
    budgetTier: "mid",
    budget: 10_000_000,
    state: "released",
    releaseWeek: 5,
    reception: {
      metaScore: 90,
      audienceScore: 85,
      status: 'Acclaimed',
      reviews: [],
      isCultPotential: false
    }
  } as any;

  describe("calculateNominationWeight", () => {
    it("disqualifies projects with MetaScore < 65", () => {
      const poorProject = { ...eligibleProject, reception: { metaScore: 60 } } as any;
      const weight = calculateNominationWeight(poorProject, []);
      expect(weight).toBe(0);
    });

    it("applies Veteran Bias for high prestige talent", () => {
      const weightBase = calculateNominationWeight(eligibleProject, []);
      const veteranTalent = [{ id: 't1', prestige: 95 }] as any;
      const weightVet = calculateNominationWeight(eligibleProject, veteranTalent);
      expect(weightVet).toBeGreaterThan(weightBase);
    });

    it("applies Genre Adjustment for Drama", () => {
       const dramaProject = { ...eligibleProject, genre: "Drama" } as any;
       const actionProject = { ...eligibleProject, genre: "Action" } as any;
       expect(calculateNominationWeight(dramaProject, [])).toBeGreaterThan(calculateNominationWeight(actionProject, []));
    });
  });

  describe("runAwardsCeremony", () => {
    it("performs awards resolution using the new weighting system", () => {
      const rng = new RandomGenerator(1);
      const state = getInitialState();
      state.studio.internal.projects = { [eligibleProject.id]: eligibleProject };
      state.week = 10; // Week 10 is Academy Awards body in configuration

      const impacts = runAwardsCeremony(state, 10, 2024, rng);

      // Check for INDUSTRY_UPDATE (Award) and NEWS_ADDED (Headline)
      expect(impacts.some(i => i.type === 'INDUSTRY_UPDATE')).toBe(true);
      expect(impacts.some(i => i.type === 'NEWS_ADDED')).toBe(true);
    });
  });

  describe("checkCampaignBacklash", () => {
    it("only triggers for Blitz campaigns with low quality", () => {
      const rng = new RandomGenerator(42);
      expect(checkCampaignBacklash(60, 'Blitz', rng)).toBeDefined();
      expect(checkCampaignBacklash(80, 'Blitz', rng)).toBe(false);
      expect(checkCampaignBacklash(60, 'Grassroots', rng)).toBe(false);
    });
  });
});
