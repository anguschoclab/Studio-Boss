import { describe, it, expect, beforeEach, vi } from "vitest";
import { TalentSystem } from "../../../engine/systems/TalentSystem";
import { Project, Contract, Talent, Award, GameState } from "../../../engine/types";
import { RandomGenerator } from "../../../engine/utils/rng";
import { createMockTalent, createMockProject, createMockGameState, createMockContract } from '../../utils/mockFactories';

const mockProject = createMockProject({
  id: "p1",
  title: "Test Movie",
  state: "post_release",
  revenue: 20_000_000,
});

const mockTalent1 = createMockTalent({
  id: "t1", 
  name: "Star Actor", 
  role: "actor",
  roles: ["actor"], 
  tier: 1 as any, // A-LIST
});

const mockTalent2 = createMockTalent({
  id: "t2", 
  name: "Director", 
  role: "director",
  roles: ["director"], 
  tier: 1 as any, // A-LIST
});

const mockContracts: Contract[] = [
  createMockContract({ id: "c1", talentId: "t1" }),
  createMockContract({ id: "c2", talentId: "t2" }),
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

    it("handles talent with 0 skill but 100 ego safely (Guild Auditor)", () => {
      const edgeTalent = createMockTalent({
        id: "edge-t",
        prestige: 0,
        draw: 0,
        fee: 10000,
        skills: { acting: 0, directing: 0, writing: 0, stardom: 0 },
        psychology: { ego: 100, mood: 100, scandalRisk: 0, synergyAffinities: [], synergyConflicts: [] }
      });

      const edgeContracts: Contract[] = [createMockContract({ id: "c-edge", talentId: "edge-t", fee: 10000 })];
      const solidHit = { ...mockProject, revenue: 25_000_000 } as Project; // 2.5 ROI

      const results = TalentSystem.applyProjectResults(solidHit, edgeContracts, [edgeTalent]);

      const t = results.find(t => t.id === "edge-t")!;
      expect(t.draw).toBeGreaterThan(0); // Draw should increase
      expect(t.prestige).toBeGreaterThan(0); // Prestige should increase
      expect(t.psychology?.ego).toBe(100); // Ego is clamped to 100 max
    });
  });

  describe("advance", () => {
    const getMockState = (): GameState => {
      const state = createMockGameState({ week: 10 });
      state.market.opportunities = [
        { 
          id: "o1", 
          type: "script", 
          title: "Existing Opportunity", 
          genre: "Drama",
          budgetTier: "mid",
          targetAudience: "General",
          flavor: "Classic tale",
          costToAcquire: 100_000,
          weeksUntilExpiry: 2,
          format: 'film',
          origin: 'open_spec',
          expirationWeek: 10,
          bids: {},
          bidHistory: []
        }
      ];
      state.entities.talents = { 
          "t1": { ...mockTalent1 },
          "t2": { ...mockTalent2 }
      };
      return state;
    };

    it("decrements opportunity expiry", () => {
        let rng = new RandomGenerator(12345);
      const state = getMockState();
      
      const impact = TalentSystem.advance(state, rng);
      
      expect(impact.newOpportunities).toBeDefined();
      expect(impact.newOpportunities!).toHaveLength(1);
      expect(impact.newOpportunities![0].weeksUntilExpiry).toBe(1);
    });
  });

  describe("advance - Medical Leave and Fatigue", () => {
    it("handles recovery from medical leave", () => {
      const state = createMockGameState({ week: 10 });
      state.entities.talents = {
         "t1": createMockTalent({ id: "t1", onMedicalLeave: true, medicalLeaveEndsWeek: 10, name: "Sick Actor" })
      };
      const rng = new RandomGenerator(42);
      const impact = TalentSystem.advance(state, rng);
      expect(impact.talentUpdates![0].update.onMedicalLeave).toBe(false);
      expect(impact.talentUpdates![0].update.fatigue).toBe(20);
    });

    it("triggers medical leave if fatigue > 95", () => {
      const state = createMockGameState({ week: 10 });
      state.entities.talents = {
         "t2": createMockTalent({ id: "t2", fatigue: 96, onMedicalLeave: false, name: "Tired Actor" })
      };
      const rng = new RandomGenerator(42);
      const impact = TalentSystem.advance(state, rng);
      expect(impact.talentUpdates![0].update.onMedicalLeave).toBe(true);
      expect(impact.talentUpdates![0].update.medicalLeaveEndsWeek).toBe(22);
    });

    it("cleans up expired commitments", () => {
      const state = createMockGameState({ week: 10 });
      state.entities.talents = {
         "t3": createMockTalent({ id: "t3", commitments: [{ projectId: 'p1', endWeek: 9, startWeek: 1, projectTitle: 'Old Show', role: 'actor', format: 'series' }] })
      };
      const rng = new RandomGenerator(42);
      const impact = TalentSystem.advance(state, rng);
      expect(impact.talentUpdates![0].update.commitments).toEqual([]);
    });
  });

  describe("applyProjectResults - Awards and Multipliers", () => {
     it("calculates award bonuses and massive ROI modifiers", () => {
        const hitProj = { ...mockProject, budget: 10_000_000, revenue: 50_000_000, marketingBudget: 0 } as Project; // ROI = 5.0

        const award: Award = {
           id: 'a1', projectId: 'p1', name: 'Oscars', category: 'Best Director', body: 'Academy Awards', status: 'won', year: 2024
        };

        const tPool = [
          { ...mockTalent1 },
          { ...mockTalent2 }
        ];

        const results = TalentSystem.applyProjectResults(hitProj, mockContracts, tPool, [award]);
        const director = results.find(t => t.id === "t2")!;

        // Base ROI > 4.0: draw + 12, prestige + 6, fee * 1.6
        // Award: isPrestige=true, multiplier=1.0. prestigeBoost=60, drawBoost=30, feeMultiplier +8.0, egoBoost +100
        expect(director.draw).toBe(100);
        expect(director.prestige).toBe(100);
        expect(director.fee).toBeGreaterThan(1000000);
     });
  });
});
