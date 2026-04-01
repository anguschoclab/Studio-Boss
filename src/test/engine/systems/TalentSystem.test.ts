import { describe, it, expect, beforeEach, vi } from "vitest";
import { TalentSystem } from "../../../engine/systems/TalentSystem";
import { Project, Contract, Talent, Award, GameState, ContentFlag } from "../../../engine/types";
import * as utils from '../../../engine/utils';

const mockProject: Project = {
  id: "p1",
  title: "Test Movie",
  type: 'FILM',
  format: "film",
  genre: "Drama",
  budgetTier: "mid",
  budget: 10_000_000,
  weeklyCost: 100_000,
  targetAudience: "General",
  flavor: "Dramatic",
  state: "post_release",
  buzz: 50,
  weeksInPhase: 0,
  developmentWeeks: 10,
  productionWeeks: 10,
  revenue: 20_000_000, // ROI 2.0
  weeklyRevenue: 0,
  releaseWeek: null,
  accumulatedCost: 0,
  momentum: 50,
  progress: 0,
  activeCrisis: null,
  contentFlags: [] as ContentFlag[]
} as Project;

const mockTalent1: Talent = {
  id: "t1", 
  name: "Star Actor", 
  role: "actor",
  roles: ["actor"], 
  tier: 'A_LIST',
  prestige: 50, 
  fee: 1_000_000, 
  draw: 50, 
  accessLevel: "outsider",
  momentum: 50,
  demographics: { age: 30, gender: 'MALE', ethnicity: 'White', country: 'USA' },
  psychology: { ego: 50, mood: 100, scandalRisk: 0, synergyAffinities: [], synergyConflicts: [] }
} as Talent;

const mockTalent2: Talent = {
  id: "t2", 
  name: "Director", 
  role: "director",
  roles: ["director"], 
  tier: 'A_LIST',
  prestige: 50, 
  fee: 1_000_000, 
  draw: 50, 
  accessLevel: "outsider",
  momentum: 50,
  demographics: { age: 40, gender: 'FEMALE', ethnicity: 'White', country: 'USA' },
  psychology: { ego: 50, mood: 100, scandalRisk: 0, synergyAffinities: [], synergyConflicts: [] }
} as Talent;

const mockContracts: Contract[] = [
  { id: "c1", projectId: "p1", talentId: "t1", fee: 100_000, backendPercent: 0 },
  { id: "c2", projectId: "p1", talentId: "t2", fee: 100_000, backendPercent: 0 },
];

describe("TalentSystem", () => {
  let talentPool: Talent[];

  beforeEach(() => {
    talentPool = [
      { ...mockTalent1 },
      { ...mockTalent2 },
    ];
  });

  describe("applyProjectResults", () => {
    it("returns empty array if no contracts provided", () => {
      const results = TalentSystem.applyProjectResults(mockProject, [], talentPool);
      expect(results).toHaveLength(0);
    });

    it("applies solid success modifiers (ROI > 2.0)", () => {
      const solidHit = { ...mockProject, revenue: 25_000_000 } as Project; // 2.5 ROI
      const results = TalentSystem.applyProjectResults(solidHit, mockContracts, talentPool);

      const t1 = results.find(t => t.id === "t1")!;
      expect(t1.draw).toBe(56); // 50 + 6
      expect(t1.prestige).toBe(53); // 50 + 3
    });
  });

  describe("advance", () => {
    const getMockState = (): GameState => ({
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
          projects: {},
          contracts: []
        }
      },
      market: {
        opportunities: [
          { 
            id: "o1", 
            type: "FILM", 
            title: "Existing Opportunity", 
            genre: "Drama",
            budgetTier: "mid",
            targetAudience: "General",
            flavor: "Classic tale",
            costToAcquire: 100_000,
            weeksUntilExpiry: 2 
          }
        ],
        activeMarketEvents: [],
        buyers: []
      },
      industry: {
        rivals: [],
        families: [],
        agencies: [],
        agents: [],
        talentPool: { 
            "t1": { ...mockTalent1 },
            "t2": { ...mockTalent2 }
        },
        newsHistory: [],
        rumors: []
      },
      culture: { genrePopularity: {} },
      history: [],
      eventHistory: []
    } as Partial<GameState> as GameState);

    it("decrements opportunity expiry", () => {
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.9);
      const state = getMockState();
      
      const impact = TalentSystem.advance(state);
      
      expect(impact.newOpportunities).toBeDefined();
      expect(impact.newOpportunities!).toHaveLength(1);
      expect(impact.newOpportunities![0].weeksUntilExpiry).toBe(1);
    });
  });


  describe("applyProjectResults - Extreme Edge Cases (Guild Auditor)", () => {
    it("handles extreme negative ROI gracefully", () => {
      const flop = { ...mockProject, budget: 100_000_000, revenue: 1_000 } as Project;
      const results = TalentSystem.applyProjectResults(flop, mockContracts, talentPool);

      const t1 = results.find(t => t.id === "t1")!;
      expect(t1.draw).toBeLessThan(50);
      expect(t1.prestige).toBeLessThan(50);
      expect(t1.fee).toBeLessThan(1_000_000);
    });

    it("handles zero budget and zero revenue safely", () => {
      const weirdProject = { ...mockProject, budget: 0, revenue: 0, marketingBudget: 0 } as Project;
      const results = TalentSystem.applyProjectResults(weirdProject, mockContracts, talentPool);

      const t1 = results.find(t => t.id === "t1")!;
      expect(t1.draw).toBeLessThan(50); // 0 ROI results in a drop
      expect(t1.prestige).toBeLessThan(50);
    });

    it("clamps stats safely for a talent with 0 skill and 100 ego", () => {
      const toxicTalent = { ...mockTalent1, id: "t_toxic", prestige: 0, draw: 0, fee: 10_000, psychology: { ego: 100, mood: 100, scandalRisk: 0, synergyAffinities: [], synergyConflicts: [] } };
      const localPool = [toxicTalent];
      const localContracts = [{ id: "c_toxic", projectId: "p1", talentId: "t_toxic", fee: 10_000, backendPercent: 0 }] as Contract[];

      const hitProject = { ...mockProject, budget: 1_000_000, revenue: 100_000_000 } as Project;
      const results = TalentSystem.applyProjectResults(hitProject, localContracts, localPool);

      const res = results[0];
      expect(res.prestige).toBeGreaterThan(0);
      expect(res.draw).toBeGreaterThan(0);
      expect(res.ego).toBe(100); // Clamped to 100
      expect(res.fee).toBeGreaterThan(10_000);
    });
  });

  describe("advance - Extreme Edge Cases (Guild Auditor)", () => {
    it("handles an empty pipeline and talent pool safely", () => {
      const emptyState = {
        week: 1,
        studio: {
          internal: {
            projects: {},
            contracts: []
          }
        },
        market: {
          opportunities: []
        },
        industry: {
          talentPool: {}
        }
      } as Partial<GameState> as GameState;

      const impact = TalentSystem.advance(emptyState);
      expect(impact.newOpportunities).toBeDefined();
    });
  });
});
