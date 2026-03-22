import { describe, it, expect, vi, beforeEach } from "vitest";
import { exploitIP } from "../../../engine/systems/franchises";
import { Project, GameState } from "../../../engine/types";

const baseProject: Project = {
  id: "p1",
  title: "Galaxy Wars",
  format: "film",
  genre: "Sci-Fi",
  budgetTier: "blockbuster",
  budget: 200000000,
  weeklyCost: 1000000,
  targetAudience: "General",
  flavor: "Space epic",
  status: "released",
  buzz: 100,
  weeksInPhase: 5,
  developmentWeeks: 20,
  productionWeeks: 20,
  revenue: 500000000, // 2.5x budget
  weeklyRevenue: 0,
  releaseWeek: null,
};

describe("franchise system", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("exploitIP", () => {
    it("returns null if source project is not released", () => {
      const devProject = { ...baseProject, status: "development" as const };
      const result = exploitIP(devProject);
      expect(result).toBeNull();
    });

    it("returns null if project failed financially and is not fatigued", () => {
      const flopProject = { ...baseProject, revenue: 100000000 }; // 0.5x budget
      const result = exploitIP(flopProject);
      expect(result).toBeNull();
    });

    it("returns reboot option if franchise is severely fatigued and financial failure", () => {
      const flopProject = { ...baseProject, revenue: 100000000 };

      // Create 10 related projects to force massive fatigue
      const relatedProjects = Array(10).fill(0).map((_, i) => ({
        ...baseProject,
        id: `p${i+2}`,
        parentProjectId: "p1"
      }));

      const state = { projects: [flopProject, ...relatedProjects] } as GameState;

      vi.spyOn(Math, 'random').mockReturnValue(0.1); // Force reboot chance
      const result = exploitIP(flopProject, state);

      expect(result).toBeDefined();
      expect(result?.title).toContain("Reboot");
      // Saturation penalty = 11 * 0.1 (Sci-Fi default assuming no specific mapping) * 10 = 11
      // Initial Buzz = 5 - (11/2) = -0.5 (Expect to be negative for early reboot)
      expect(result?.initialBuzzBonus).toBeLessThan(5);
    });

    it("returns null if franchise is severely fatigued, failed, but random check fails", () => {
      const flopProject = { ...baseProject, revenue: 100000000 };
      const relatedProjects = Array(10).fill(0).map((_, i) => ({
        ...baseProject,
        id: `p${i+2}`,
        parentProjectId: "p1"
      }));
      const state = { projects: [flopProject, ...relatedProjects] } as GameState;

      vi.spyOn(Math, 'random').mockReturnValue(0.9); // Fail reboot chance
      const result = exploitIP(flopProject, state);
      expect(result).toBeNull();
    });

    it("generates crossover event if another huge hit exists in same genre", () => {
      const otherHit = {
        ...baseProject,
        id: "p99",
        title: "Star Trek",
        revenue: 600000000 // > 2x budget
      };

      const state = { projects: [baseProject, otherHit] } as GameState;

      // Need random > 0.8 for crossover target detection, then random < 0.2 for crossover selection
      let callCount = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => {
        callCount++;
        if (callCount === 1) return 0.9; // For crossover target detection
        return 0.1; // For selecting crossover action
      });

      const result = exploitIP(baseProject, state);
      expect(result?.title).toContain("vs Star Trek");
      expect(result?.initialBuzzBonus).toBeGreaterThan(20); // Massive hype
    });

    it("generates a direct sequel", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.4); // < 0.5 triggers sequel
      const result = exploitIP(baseProject);

      expect(result?.title).toBe("Galaxy Wars 1"); // 0 related + 1 = 1 (or 2 depending on if it counts itself if state isn't passed)
      expect(result?.isSpinoff).toBe(true);
    });

    it("generates a prequel", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.7); // < 0.8 triggers prequel
      const result = exploitIP(baseProject);

      expect(result?.title).toContain("Origins");
    });

    it("generates a spinoff", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.9); // >= 0.8 triggers spinoff
      const result = exploitIP(baseProject);

      expect(result?.title).toContain("The Next Generation");
    });

    it("clamps buzz bonus to -10 when completely saturated", () => {
      // 50 related projects to force huge penalty
      const relatedProjects = Array(50).fill(0).map((_, i) => ({
        ...baseProject,
        id: `p${i+2}`,
        parentProjectId: "p1"
      }));
      const state = { projects: [baseProject, ...relatedProjects] } as GameState;

      vi.spyOn(Math, 'random').mockReturnValue(0.4); // trigger sequel
      const result = exploitIP(baseProject, state);

      // Penalty will be massive, so bonus drops heavily
      expect(result?.initialBuzzBonus).toBe(-10); // Minimum threshold
    });
  });
});
