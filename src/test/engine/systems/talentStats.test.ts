import { describe, it, expect, beforeEach } from "vitest";
import { updateTalentStats } from "../../../engine/systems/talentStats";
import { Project, Contract, TalentProfile, Award } from "../../../engine/types";

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

describe("talentStats system", () => {
  let talentPoolMap: Map<string, TalentProfile>;

  beforeEach(() => {
    talentPoolMap = new Map([
      ["t1", { ...mockTalent1 }],
      ["t2", { ...mockTalent2 }],
      ["t3", { ...mockTalent3 }],
    ]);
  });

  describe("updateTalentStats", () => {
    it("returns early if no contracts provided", () => {
      updateTalentStats(mockProject, [], talentPoolMap);
      expect(talentPoolMap.get("t1")?.draw).toBe(50);
    });

    it("applies massive hit modifiers (ROI > 3.0)", () => {
      const hugeHit = { ...mockProject, revenue: 40000000 }; // 4.0 ROI
      updateTalentStats(hugeHit, mockContracts, talentPoolMap);

      const t1 = talentPoolMap.get("t1")!;
      expect(t1.draw).toBe(60); // +10
      expect(t1.prestige).toBe(55); // +5
      expect(t1.fee).toBe(1500000); // 1M * 1.5
    });

    it("applies solid success modifiers (1.5 < ROI <= 3.0)", () => {
      const solidHit = { ...mockProject, revenue: 20000000 }; // 2.0 ROI
      updateTalentStats(solidHit, mockContracts, talentPoolMap);

      const t1 = talentPoolMap.get("t1")!;
      expect(t1.draw).toBe(55); // +5
      expect(t1.prestige).toBe(52); // +2
      expect(t1.fee).toBe(1200000); // 1M * 1.2
    });

    it("applies disappointment modifiers (0.5 <= ROI < 1.0)", () => {
      const disappointment = { ...mockProject, revenue: 8000000 }; // 0.8 ROI
      updateTalentStats(disappointment, mockContracts, talentPoolMap);

      const t1 = talentPoolMap.get("t1")!;
      expect(t1.draw).toBe(45); // -5
      expect(t1.prestige).toBe(48); // -2
      expect(t1.fee).toBe(900000); // 1M * 0.9
    });

    it("applies bomb modifiers (ROI < 0.5)", () => {
      const bomb = { ...mockProject, revenue: 1000000 }; // 0.1 ROI
      updateTalentStats(bomb, mockContracts, talentPoolMap);

      const t1 = talentPoolMap.get("t1")!;
      expect(t1.draw).toBe(40); // -10
      expect(t1.prestige).toBe(45); // -5
      expect(t1.fee).toBe(800000); // 1M * 0.8
    });

    it("applies neutral modifiers (1.0 <= ROI <= 1.5)", () => {
      const neutral = { ...mockProject, revenue: 12000000 }; // 1.2 ROI
      updateTalentStats(neutral, mockContracts, talentPoolMap);

      const t1 = talentPoolMap.get("t1")!;
      expect(t1.draw).toBe(50); // +0
      expect(t1.prestige).toBe(50); // +0
      expect(t1.fee).toBe(1000000); // 1M * 1.0
    });

    it("applies correct award modifiers based on talent role qualifications", () => {
      const neutral = { ...mockProject, revenue: 10000000 }; // 1.0 ROI (neutral)
      const awards: Award[] = [
        { id: "a1", projectId: "p1", name: "Oscar", category: "Best Actor", body: "Academy Awards", status: "won", year: 2024 },
        { id: "a2", projectId: "p1", name: "Oscar", category: "Best Director", body: "Academy Awards", status: "won", year: 2024 },
        { id: "a3", projectId: "p1", name: "Oscar", category: "Best Screenplay", body: "Academy Awards", status: "won", year: 2024 }
      ];

      updateTalentStats(neutral, mockContracts, talentPoolMap, awards);

      const actor = talentPoolMap.get("t1")!; // Only qualifies for Best Actor
      expect(actor.prestige).toBe(65); // 50 + 15 (Academy Win)
      expect(actor.draw).toBe(60); // 50 + 10
      expect(actor.fee).toBe(2000000); // 1M * (1.0 + 1.0) -> +1.0 for Academy Win specific category

      const director = talentPoolMap.get("t2")!; // Only qualifies for Best Director
      expect(director.prestige).toBe(65);

      const writer = talentPoolMap.get("t3")!; // Only qualifies for Best Screenplay
      expect(writer.prestige).toBe(65);
    });

    it("applies general award modifiers to all roles with a dilution multiplier (0.5)", () => {
      const neutral = { ...mockProject, revenue: 10000000 }; // 1.0 ROI
      const awards: Award[] = [
        { id: "a1", projectId: "p1", name: "Oscar", category: "Best Picture", body: "Academy Awards", status: "won", year: 2024 }
      ];

      updateTalentStats(neutral, mockContracts, talentPoolMap, awards);

      // Best Picture gives everyone: 15 * 0.5 = +7.5 prestige (rounds depending on display, logic keeps float or uses exact +7.5)
      // Draw: 10 * 0.5 = +5
      // Fee: +1.0 * 0.5 = +0.5 -> 1.5 multiplier

      for (let i = 1; i <= 3; i++) {
        const talent = talentPoolMap.get(`t${i}`)!;
        expect(talent.prestige).toBe(57.5); // 50 + 7.5
        expect(talent.draw).toBe(55); // 50 + 5
        expect(talent.fee).toBe(1500000); // 1M * 1.5
      }
    });

    it("clamps stats accurately: max 100, min 0, fee limits 10k to 50M", () => {
      // Setup talent very near limits
      talentPoolMap.set("t1", { ...mockTalent1, draw: 95, prestige: 98, fee: 40000000 }); // Near max
      talentPoolMap.set("t2", { ...mockTalent2, draw: 5, prestige: 2, fee: 12000 }); // Near min

      const hugeHit = { ...mockProject, revenue: 40000000 }; // 4.0 ROI (+10 draw, +5 prestige, 1.5 fee)
      const bomb = { ...mockProject, revenue: 1000000 }; // 0.1 ROI (-10 draw, -5 prestige, 0.8 fee)

      // t1 experiences huge hit
      updateTalentStats(hugeHit, [mockContracts[0]], talentPoolMap);
      const t1 = talentPoolMap.get("t1")!;
      expect(t1.draw).toBe(100); // Clamped from 105
      expect(t1.prestige).toBe(100); // Clamped from 103
      expect(t1.fee).toBe(50000000); // Clamped from 60M

      // t2 experiences bomb
      updateTalentStats(bomb, [mockContracts[1]], talentPoolMap);
      const t2 = talentPoolMap.get("t2")!;
      expect(t2.draw).toBe(0); // Clamped from -5
      expect(t2.prestige).toBe(0); // Clamped from -3
      expect(t2.fee).toBe(10000); // Clamped from 9,600
    });

    it("stacks multiple awards accurately", () => {
      const neutral = { ...mockProject, revenue: 10000000 };
      const awards: Award[] = [
        { id: "a1", projectId: "p1", name: "Oscar", category: "Best Actor", body: "Academy Awards", status: "won", year: 2024 }, // +15 prestige, +10 draw, +1.0 fee multiplier
        { id: "a2", projectId: "p1", name: "Spirit", category: "Best Actor", body: "Independent Spirit Awards", status: "nominated", year: 2024 } // +2 prestige, +1 draw, +0.05 fee multiplier
      ];

      updateTalentStats(neutral, mockContracts, talentPoolMap, awards);

      const actor = talentPoolMap.get("t1")!;
      expect(actor.prestige).toBe(67); // 50 + 15 + 2
      expect(actor.draw).toBe(61); // 50 + 10 + 1
      // Fee multiplier logic stacks: talentAwardsFeeMultiplier = 1.0 + 1.0 (Oscar Win) + 0.05 (Spirit Nom) = 2.05
      // 1M * 2.05 = 2050000
      expect(actor.fee).toBeCloseTo(2050000);
    });
    it("handles extreme ego (fee) with 0 prestige / skill", () => {
      // 0 prestige talent, but astronomical fee (simulating a completely untalented but overpaid star)
      talentPoolMap.set("t1", { ...mockTalent1, draw: 0, prestige: 0, fee: 50000000 });

      // Solid success (1.5 < ROI <= 3.0), fee mult 1.2
      const solidHit = { ...mockProject, revenue: 20000000 };
      updateTalentStats(solidHit, [mockContracts[0]], talentPoolMap);

      const t1 = talentPoolMap.get("t1")!;
      expect(t1.draw).toBe(5); // 0 + 5
      expect(t1.prestige).toBe(2); // 0 + 2
      // Fee would be 60M, but clamped to 50M
      expect(t1.fee).toBe(50000000);
    });

    it("handles negative values in project revenue (ROI calculation)", () => {
      // Very unusual: project made negative revenue
      const negativeRevenueProject = { ...mockProject, revenue: -5000000 }; // ROI = -0.5
      updateTalentStats(negativeRevenueProject, [mockContracts[0]], talentPoolMap);

      const t1 = talentPoolMap.get("t1")!;
      // It falls under ROI < 0.5 (bomb) -> drawChange = -10, prestigeChange = -5, feeMultiplier = 0.8
      expect(t1.draw).toBe(40);
      expect(t1.prestige).toBe(45);
      expect(t1.fee).toBe(800000);
    });
  });
});
