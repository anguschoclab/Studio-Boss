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

    it("generates a deconstructive meta-sequel if franchise is heavily fatigued and fails", () => {
      const flopProject = { ...baseProject, revenue: 100000000 };

      const relatedProjects = Array(10).fill(0).map((_, i) => ({
        ...baseProject,
        id: `p${i+2}`,
        parentProjectId: "p1"
      }));

      const state = { projects: [flopProject, ...relatedProjects] } as GameState;

      vi.spyOn(Math, 'random').mockReturnValue(0.3); // Between 0.2 and 0.4 triggers Resurrection meta-sequel
      const result = exploitIP(flopProject, state);

      expect(result).toBeDefined();
      expect(result?.title).toContain("Resurrection");
      expect(result?.genre).toBe("Comedy");
      expect(result?.flavor).toContain("self-aware, fourth-wall-breaking");
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

    it("generates crossover event if another huge hit exists in a compatible crossover genre", () => {
      const otherHit = {
        ...baseProject,
        id: "p99",
        title: "Action Hero",
        genre: "Action", // Action is compatible with Sci-Fi based on CROSSOVER_AFFINITY
        revenue: 600000000 // > 2x budget
      };

      const state = { projects: [baseProject, otherHit] } as GameState;

      let callCount = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => {
        callCount++;
        if (callCount === 1) return 0.9; // For crossover target detection
        return 0.1; // For selecting crossover action
      });

      const result = exploitIP(baseProject, state);
      expect(result?.title).toContain("vs Action Hero");
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

    it("applies steep fatigue curve for Superhero genre heavily saturated", () => {
      const flopProject = { ...baseProject, revenue: 100000000, genre: "Superhero" };

      // Need > 5 recent releases in the same genre
      const recentReleases = Array(6).fill(0).map((_, i) => ({
        ...flopProject,
        id: `p_market_${i}`,
        parentProjectId: undefined,
        releaseWeek: 90
      }));

      // Need enough related projects to actually trigger the 'isFatigued' check (saturationPenalty > 35)
      // Base fatigue for superhero is 0.45 * 1.5 (steep curve multiplier) = 0.675
      // With 6 recent releases, penalty is roughly:
      // (exponential * 0.675 * 10) + (6 * (0.675/2) * 5) = (exp * 6.75) + 10.125
      // Need exp * 6.75 > 25, meaning exponential > 3.7.
      // 3^1.2 = 3.73. Let's make 3 related projects to be safe.
      const relatedProjects = Array(3).fill(0).map((_, i) => ({
        ...flopProject,
        id: `p_rel_${i}`,
        parentProjectId: flopProject.id,
      }));

      const state = { week: 100, projects: [flopProject, ...relatedProjects, ...recentReleases] } as GameState;

      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      const result = exploitIP(flopProject, state);

      // Saturation penalty should be amplified due to Superhero Fatigue * 1.5 risk multiplier
      expect(result).toBeDefined();
      expect(result!.title).toContain("Reboot");
      // Resulting initialBuzzBonus will be even lower due to massive penalty
      expect(result!.initialBuzzBonus).toBeLessThan(0);
    });

    it("generates an IP Rights Retention Rush Job if legacy franchise underperforms", () => {
      const legacyProject = {
        ...baseProject,
        revenue: 100000000, // < 1.5x budget (financial failure)
        releaseWeek: 10
      };

      const relatedProject = {
        ...legacyProject,
        id: "p_rel_1",
        parentProjectId: legacyProject.id,
      };

      // State is at week 200, making legacyProject > 150 weeks old (Legacy)
      // Saturation penalty will be low as we don't have enough projects
      const state = { week: 200, projects: [legacyProject, relatedProject] } as GameState;

      vi.spyOn(Math, 'random').mockReturnValue(0.4); // < 0.5 triggers IP rush job when at risk and not fully fatigued
      const result = exploitIP(legacyProject, state);

      expect(result).toBeDefined();
      expect(result?.title).toContain("The Untold Chapter");
      expect(result?.budgetTier).toBe("low");
      expect(result?.initialBuzzBonus).toBe(-5);
      expect(result?.flavor).toContain("ensure the studio retains the");
    });
  });
});
