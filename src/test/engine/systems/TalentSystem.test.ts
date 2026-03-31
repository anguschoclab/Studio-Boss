import { describe, it, expect, beforeEach, vi } from "vitest";
import { TalentSystem } from "../../../engine/systems/TalentSystem";
import { Project, Contract, TalentProfile, Award, GameState } from "../../../engine/types";
import * as utils from '../../../engine/utils';

const mockProject: Project = {
  id: "p1",
  title: "Test Movie",
  format: "film",
  genre: "Drama",
  budgetTier: "mid",
  budget: 10000000,
  weeklyCost: 100000,
  targetAudience: "General",
  flavor: "Dramatic",
  status: "post_release",
  buzz: 50,
  weeksInPhase: 0,
  developmentWeeks: 10,
  productionWeeks: 10,
  revenue: 20000000, // ROI 2.0 (Solid hit)
  weeklyRevenue: 0,
  releaseWeek: null,
};

const mockTalent1: TalentProfile = {
  id: "t1", name: "Star Actor", roles: ["actor"], prestige: 50, fee: 1000000, draw: 50, temperament: "Pro", accessLevel: "outsider",
  age: 30, gender: "male"
};
const mockTalent2: TalentProfile = {
  id: "t2", name: "Director", roles: ["director"], prestige: 50, fee: 1000000, draw: 50, temperament: "Pro", accessLevel: "outsider",
  age: 40, gender: "female"
};

const mockContracts: Contract[] = [
  { id: "c1", projectId: "p1", talentId: "t1", fee: 100000, backendPercent: 0 },
  { id: "c2", projectId: "p1", talentId: "t2", fee: 100000, backendPercent: 0 },
];

describe("TalentSystem", () => {
  let talentPool: TalentProfile[];

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
      const solidHit = { ...mockProject, revenue: 25000000 }; // 2.5 ROI
      const results = TalentSystem.applyProjectResults(solidHit, mockContracts, talentPool);

      const t1 = results.find(t => t.id === "t1")!;
      expect(t1.draw).toBe(56); // 50 + 6
      expect(t1.prestige).toBe(53); // 50 + 3
    });

    it("handles awards correctly for specific roles", () => {
      const neutral = { ...mockProject, revenue: 10000000 }; 
      const awards: Award[] = [
        { id: "a1", projectId: "p1", name: "Oscar", category: "Best Actor", body: "Academy Awards", status: "won", year: 2024 },
      ];

      const results = TalentSystem.applyProjectResults(neutral, mockContracts, talentPool, awards);

      const actor = results.find(t => t.id === "t1")!;
      expect(actor.prestige).toBe(100);
      expect(actor.draw).toBe(77);
    });
  });

  describe("advance", () => {
    const getMockState = (): GameState => ({
      week: 1,
      cash: 1000000,
      studio: {
        name: "Test Studio",
        archetype: "major",
        prestige: 50,
        internal: {
          projects: {},
          contracts: [],
          financeHistory: []
        }
      },
      market: {
        opportunities: [
          { 
            id: "o1", 
            type: "script",
            title: "Existing Opportunity", 
            format: "film",
            genre: "Drama",
            budgetTier: "mid",
            targetAudience: "Broad",
            flavor: "Classic tale",
            origin: "open_spec",
            costToAcquire: 100000,
            weeksUntilExpiry: 2 
          }
        ],
        buyers: [],
      },
      industry: {
        rivals: [],
        headlines: [],
        talentPool: { 
            "t1": mockTalent1,
            "t2": mockTalent2
        },
        newsHistory: []
      },
      culture: { genrePopularity: {} },
      finance: { bankBalance: 1000000, yearToDateRevenue: 0, yearToDateExpenses: 0 },
      history: []
    } as unknown as GameState);

    it("decrements opportunity expiry", () => {
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.9);
      const state = getMockState();
      
      const result = TalentSystem.advance(state);
      
      expect(result.newOpportunities).toBeDefined();
      expect(result.newOpportunities!).toHaveLength(1);
      expect(result.newOpportunities![0].weeksUntilExpiry).toBe(1);
      
      vi.restoreAllMocks();
    });

    it("removes expired opportunities", () => {
      const state = getMockState();
      state.market.opportunities = [
        { ...state.market.opportunities[0], id: "o-expired", weeksUntilExpiry: 1 }
      ];
      
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.9);
      
      const result = TalentSystem.advance(state);
      expect(result.newOpportunities).toHaveLength(0);
      
      vi.restoreAllMocks();
    });
  });
});
