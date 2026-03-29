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
  id: "t1", name: "Star Actor", roles: ["actor"], prestige: 50, fee: 1000000, draw: 50, temperament: "Pro", accessLevel: "outsider"
};
const mockTalent2: TalentProfile = {
  id: "t2", name: "Director", roles: ["director"], prestige: 50, fee: 1000000, draw: 50, temperament: "Pro", accessLevel: "outsider"
};
const mockTalent3: TalentProfile = {
  id: "t3", name: "Writer", roles: ["writer"], prestige: 50, fee: 1000000, draw: 50, temperament: "Pro", accessLevel: "outsider"
};

const mockContracts: Contract[] = [
  { id: "c1", projectId: "p1", talentId: "t1", fee: 100, backendPercent: 0 },
  { id: "c2", projectId: "p1", talentId: "t2", fee: 100, backendPercent: 0 },
  { id: "c3", projectId: "p1", talentId: "t3", fee: 100, backendPercent: 0 },
];

describe("TalentSystem", () => {
  let talentPool: TalentProfile[];

  beforeEach(() => {
    talentPool = [
      { ...mockTalent1 },
      { ...mockTalent2 },
      { ...mockTalent3 },
    ];
  });

  describe("applyProjectResults", () => {
    it("returns empty array if no contracts provided", () => {
      const results = TalentSystem.applyProjectResults(mockProject, [], talentPool);
      expect(results).toHaveLength(0);
    });

    it("applies massive hit modifiers (ROI > 4.0)", () => {
      const hugeHit = { ...mockProject, revenue: 400000001 }; // > 4.0 ROI vs 10M budget
      const results = TalentSystem.applyProjectResults(hugeHit, mockContracts, talentPool);

      const t1 = results.find(t => t.id === "t1")!;
      expect(t1.draw).toBe(62); // 50 + 12
      expect(t1.prestige).toBe(56); // 50 + 6
      expect(t1.fee).toBe(1600000); // 1M * 1.6
    });

    it("applies solid success modifiers (ROI > 2.0)", () => {
      const solidHit = { ...mockProject, revenue: 25000000 }; // 2.5 ROI
      const results = TalentSystem.applyProjectResults(solidHit, mockContracts, talentPool);

      const t1 = results.find(t => t.id === "t1")!;
      expect(t1.draw).toBe(56); // 50 + 6
      expect(t1.prestige).toBe(53); // 50 + 3
      expect(t1.fee).toBe(1300000); // 1M * 1.3
    });

    it("applies neutral/modest success modifiers (ROI > 1.0)", () => {
      const modestHit = { ...mockProject, revenue: 15000000 }; // 1.5 ROI
      const results = TalentSystem.applyProjectResults(modestHit, mockContracts, talentPool);

      const t1 = results.find(t => t.id === "t1")!;
      expect(t1.draw).toBe(52); // 50 + 2
      expect(t1.prestige).toBe(51); // 50 + 1
      expect(t1.fee).toBe(1100000); // 1M * 1.1
    });

    it("applies bomb modifiers (ROI < 0.4)", () => {
      const bomb = { ...mockProject, revenue: 1000000 }; // 0.1 ROI
      const results = TalentSystem.applyProjectResults(bomb, mockContracts, talentPool);

      const t1 = results.find(t => t.id === "t1")!;
      expect(t1.draw).toBe(38); // 50 - 12
      expect(t1.prestige).toBe(44); // 50 - 6
      expect(t1.fee).toBe(750000); // 1M * 0.75
    });

    it("handles awards correctly for specific roles", () => {
      const neutral = { ...mockProject, revenue: 10000000 }; // 1.0 ROI (default case)
      const awards: Award[] = [
        { id: "a1", projectId: "p1", name: "Oscar", category: "Best Actor", body: "Academy Awards", status: "won", year: 2024 },
      ];

      const results = TalentSystem.applyProjectResults(neutral, mockContracts, talentPool, awards);

      const actor = results.find(t => t.id === "t1")!;
      expect(actor.prestige).toBe(100);
      expect(actor.draw).toBe(77);
      expect(actor.fee).toBe(5500000);
    });

    it("applies general award modifiers (Best Picture) to all roles with dilution", () => {
      const neutral = { ...mockProject, revenue: 10000000 };
      const awards: Award[] = [
        { id: "a1", projectId: "p1", name: "Oscar", category: "Best Picture", body: "Academy Awards", status: "won", year: 2024 }
      ];

      const results = TalentSystem.applyProjectResults(neutral, mockContracts, talentPool, awards);

      for (const t of results) {
        expect(t.prestige).toBe(67.5);
        expect(t.draw).toBe(57.5);
        expect(t.fee).toBe(2250000);
      }
    });

    it("clamps stats accurately", () => {
      const eliteTalent: TalentProfile[] = [
        { ...mockTalent1, draw: 95, prestige: 98, fee: 70000000 }
      ];
      const hugeHit = { ...mockProject, revenue: 50000000 }; // 5.0 ROI

      const results = TalentSystem.applyProjectResults(hugeHit, [mockContracts[0]], eliteTalent);
      const t = results[0];

      expect(t.draw).toBe(100);
      expect(t.prestige).toBe(100);
      expect(t.fee).toBe(75000000); // Max fee
    });

    it("handles extreme ego talent (0 skill/draw, 100 prestige) accurately after a huge hit", () => {
      const egoTalent: TalentProfile[] = [
        { ...mockTalent1, draw: 0, prestige: 100, fee: 1000000, temperament: 'Diva' }
      ];
      const hugeHit = { ...mockProject, revenue: 50000000 }; // 5.0 ROI

      const results = TalentSystem.applyProjectResults(hugeHit, [mockContracts[0]], egoTalent);
      const t = results[0];

      expect(t.draw).toBe(12); // 0 + 12
      expect(t.prestige).toBe(100); // 100 + 6, clamped to 100
      expect(t.fee).toBe(1600000); // 1M * 1.6
    });

    it("handles extreme ego talent (0 skill/draw, 100 prestige) accurately after a massive bomb", () => {
      const egoTalent: TalentProfile[] = [
        { ...mockTalent1, draw: 0, prestige: 100, fee: 1000000, temperament: 'Diva' }
      ];
      const bomb = { ...mockProject, revenue: 1000000 }; // 0.1 ROI

      const results = TalentSystem.applyProjectResults(bomb, [mockContracts[0]], egoTalent);
      const t = results[0];

      expect(t.draw).toBe(0); // 0 - 12, clamped to 0
      expect(t.prestige).toBe(94); // 100 - 6 = 94
      expect(t.fee).toBe(750000); // 1M * 0.75
    });
  });


  describe("Guild Auditor: Edge Cases", () => {
    it("handles extreme ego talent (0 skill/draw, 100 prestige) accurately after a huge hit within Guild Auditor Edge Cases", () => {
      const egoTalent: TalentProfile[] = [
        { ...mockTalent1, draw: 0, prestige: 100, fee: 1000000, temperament: 'Diva' }
      ];
      const hugeHit = { ...mockProject, revenue: 50000000 };

      const results = TalentSystem.applyProjectResults(hugeHit, [mockContracts[0]], egoTalent);
      const t = results[0];

      expect(t.draw).toBe(12);
      expect(t.prestige).toBe(100);
      expect(t.fee).toBe(1600000);
    });

    it("handles an empty pipeline safely during advance", () => {
      const emptyState: GameState = {
        week: 1,
        cash: 1000000,
        studio: {
          internal: {
            projects: [],
            contracts: [],
            firstLookDeals: [],
          }
        },
        market: {
          opportunities: [],
          buyers: [],
        },
        industry: {
          rivals: [],
          talentPool: [],
        }
      } as unknown as GameState;

      expect(() => TalentSystem.advance(emptyState)).not.toThrow();

      const result = TalentSystem.advance(emptyState);
      expect(result.updatedOpportunities).toBeDefined();
    });
  });

  describe("advance", () => {
    const mockState: GameState = {
      week: 1,
      cash: 1000000,
      studio: {
        internal: {
          projects: [],
          contracts: [],
          firstLookDeals: [],
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
        talentPool: [mockTalent1, mockTalent2],
      }
    } as unknown as GameState;

    it("decrements opportunity expiry", () => {
      // Mock random to prevent new opportunities
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.9);
      
      const result = TalentSystem.advance(mockState);
      
      expect(result.updatedOpportunities).toHaveLength(1);
      expect(result.updatedOpportunities[0].weeksUntilExpiry).toBe(1);
      
      vi.restoreAllMocks();
    });

    it("removes expired opportunities", () => {
      const expiringState = { ...mockState };
      expiringState.market.opportunities = [
        { id: "o1", title: "Expiring", description: "", weeksUntilExpiry: 1, roles: [], budget: 1000000 }
      ];
      
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.9);
      
      const result = TalentSystem.advance(expiringState);
      expect(result.updatedOpportunities).toHaveLength(0);
      
      vi.restoreAllMocks();
    });

    it("generates new opportunities based on random chance", () => {
      // Use mockReturnValueOnce to provide different values for each check
      const randMock = vi.spyOn(utils, 'secureRandom');
      // 1. Initial checks in TalentSystem.advance (0.1, 0.1, 0.1)
      // 2. Internal checks in generateOpportunity (isFilm, budgetTier, etc.)
      // It's easier to just mock generateProjectTitle or use a sequence
      randMock
        .mockReturnValueOnce(0.1) // 1st check (0.25) -> true
        .mockReturnValueOnce(0.5) // gender/isFilm etc inside genOpp
        .mockReturnValueOnce(0.2) // 2nd check (0.2) -> true
        .mockReturnValueOnce(0.6) // inside genOpp
        .mockReturnValue(0.9);    // rest false
      
      const result = TalentSystem.advance(mockState);
      // Since generateProjectTitle also uses Math.random, 
      // mocking to a single constant makes titles identical.
      // We expect at least one new one for sure.
      expect(result.updatedOpportunities.length).toBeGreaterThan(0);
      expect(result.events.length).toBeGreaterThan(0);
      
      randMock.mockRestore();
    });
  });
});
