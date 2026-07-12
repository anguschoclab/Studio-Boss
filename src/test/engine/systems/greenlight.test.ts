import { describe, it, expect } from "vitest";
import { evaluateGreenlight } from "@/engine/systems/greenlight";
import { Project, Talent } from "@/engine/types";

const mockProject: Project = {
  id: "p1",
  title: "Test Project",
  type: "FILM",
  format: "film",
  genre: "Drama",
  budgetTier: "mid",
  budget: 25_000_000,
  weeklyCost: 2_000_000,
  targetAudience: "Broad",
  flavor: "Standard drama",
  state: "development",
  buzz: 50,
  weeksInPhase: 0,
  developmentWeeks: 8,
  productionWeeks: 12,
  revenue: 0,
  weeklyRevenue: 0,
  releaseWeek: null,
} as Project;

const mockTalent: Talent = {
  id: "t1",
  name: "Actor 1",
  roles: ["actor"],
  prestige: 60,
  fee: 1_000_000,
  draw: 60,
  personality: "Pro",
  accessLevel: "outsider",
} as any;

const mockTalentAlist: Talent = {
  id: "t2",
  name: "A-Lister",
  roles: ["actor"],
  prestige: 90,
  fee: 10_000_000,
  draw: 90,
  personality: "Pro",
  accessLevel: "outsider",
} as any;

describe("evaluateGreenlight", () => {
  describe("Base Scoring Mechanics", () => {
    it("calculates a baseline score without major modifiers", () => {
      // 25M budget, 100M cash (cash > budget * 2, not > * 5 => 0 bonus/penalty)
      // 1 solid talent (draw 60) => +15
      // buzz 50 => 0 bonus/penalty
      // No similar projects within last 52 weeks => +15 gap bonus
      // Base 50 + 15 + 15 = 80
      // Role completeness: no contracts passed => 0/3 filled => -15
      // Schedule certainty: 25M / (12 wks * 1M) * 50 = 100 => +5
      // Total: 80 - 15 + 5 = 70
      const report = evaluateGreenlight(mockProject, 100_000_000, [mockTalent], 10, []);
      expect(report.score).toBe(70);
      expect(report.recommendation).toBe("Viable with Conditions");
    });

    it("applies market saturation penalty for recent similar projects", () => {
      const recentProject: Project = {
        ...mockProject,
        id: "p2",
        state: "released",
        releaseWeek: 5,
      };
      const allProjects = [recentProject];

      const report = evaluateGreenlight(mockProject, 100_000_000, [mockTalent], 10, allProjects);
      // recent = 1 => penalty 5
      // No gap bonus
      // Base 50 + 15 (talent) - 5 - 15 (role) + 5 (schedule) = 50
      expect(report.score).toBe(50);
      expect(report.negatives.some((n) => n.includes("Market saturation"))).toBe(true);
    });

    it("applies heavy penalty for oversaturated genres (>= 5 similar)", () => {
      const similarProjects = Array.from({ length: 5 }).map((_, i) => ({
        ...mockProject,
        id: `p${i + 2}`,
        state: "released" as const,
        releaseWeek: 5,
      }));

      const report = evaluateGreenlight(
        mockProject,
        100_000_000,
        [mockTalent],
        10,
        similarProjects as Project[]
      );
      // 5 projects => penalty 25 + 20 (oversaturated) = 45
      // Base 50 + 15 (talent) - 45 - 15 (role) + 5 (schedule) = 10
      expect(report.score).toBe(10);
      expect(report.recommendation).toBe("Do Not Greenlight Yet");
    });

    it("penalizes severe cashflow strain (cash < budget)", () => {
      const report = evaluateGreenlight(mockProject, 10_000_000, [mockTalent], 10, []);
      // Base 50 + 15 (gap) + 15 (talent) - 40 (cash) - 15 (role) + 5 (schedule) = 30
      expect(report.score).toBe(30);
    });

    it("rewards comfortable cash reserves (cash > budget * 5)", () => {
      const report = evaluateGreenlight(mockProject, 150_000_000, [mockTalent], 10, []);
      // Base 50 + 15 (gap) + 15 (talent) + 10 (cash) - 15 (role) + 5 (schedule) = 80
      expect(report.score).toBe(80);
    });

    it("penalizes unpackaged projects (no talent)", () => {
      const report = evaluateGreenlight(mockProject, 100_000_000, [], 10, []);
      // Base 50 + 15 (gap) - 20 (no talent) - 15 (role) + 5 (schedule) = 35
      expect(report.score).toBe(35);
    });

    it("rewards A-list packages (avg draw > 75)", () => {
      const report = evaluateGreenlight(mockProject, 100_000_000, [mockTalentAlist], 10, []);
      // Base 50 + 15 (gap) + 30 (A-list) - 15 (role) + 5 (schedule) = 85
      expect(report.score).toBe(85);
    });
  });

  describe("Recommendations Matrix", () => {
    it("returns Easy Greenlight for score >= 80", () => {
      const report = evaluateGreenlight(mockProject, 150_000_000, [mockTalentAlist], 10, []);
      expect(report.score).toBeGreaterThanOrEqual(80);
      expect(report.recommendation).toBe("Easy Greenlight");
    });

    it("returns Speculative Bet for an unstaffed mid-tier package in the 40-59 band", () => {
      // Base 50 + 15 (gap) + 15 (talent) - 15 (exposure, 40M < 50M) - 15 (role) + 5 (schedule) = 55
      const report = evaluateGreenlight(mockProject, 40_000_000, [mockTalent], 10, []);
      expect(report.score).toBeGreaterThanOrEqual(40);
      expect(report.score).toBeLessThan(60);
      expect(report.recommendation).toBe("Speculative Bet");
    });
  });
});
