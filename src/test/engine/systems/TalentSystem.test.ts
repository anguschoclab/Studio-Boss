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
    } as unknown as GameState);

    it("decrements opportunity expiry", () => {
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.9);
      const state = getMockState();
      
      const impact = TalentSystem.advance(state);
      
      expect(impact.newOpportunities).toBeDefined();
      expect(impact.newOpportunities!).toHaveLength(1);
      expect(impact.newOpportunities![0].weeksUntilExpiry).toBe(1);
    });
  });
});
