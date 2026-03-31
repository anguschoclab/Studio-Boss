import { describe, it, expect, vi, beforeEach } from "vitest";
import { exploitIP } from "../../../engine/systems/franchises";
import { Project, GameState } from "../../../engine/types";
import * as utils from '../../../engine/utils';

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


  describe("Guild Auditor: Edge Cases", () => {
    it("handles an empty project list safely when evaluating crossover events", () => {
      const state = { week: 100, studio: { internal: { projects: [] } } } as unknown as GameState;
      // exploitIP relies on checking state.studio.internal.projects for crossovers and fatigue
      // Let's ensure it doesn't crash when passing a valid base project but empty history
      exploitIP(baseProject, state);
      // It might return something or null, but the key is it shouldn't crash
      expect(true).toBe(true);
    });

    it("handles negative buzz and budget correctly in fatigue calculation", () => {
      const negativeProject = { ...baseProject, buzz: -100, budget: -10000000 };
      const state = { week: 100, studio: { internal: { projects: [negativeProject] } } } as unknown as GameState;
      expect(() => exploitIP(negativeProject, state)).not.toThrow();
    });
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
      const flopProject = { ...baseProject, revenue: 70000000, genre: "Horror" as const };

      const relatedProjectsFatigued = Array(12).fill(0).map((_, i) => ({
        ...baseProject,
        id: `p${i+2}`,
        parentProjectId: "p1",
        genre: "Horror" as const,
        releaseWeek: 90,
        status: "released" as const
      }));
      const marketProjects = Array(15).fill(0).map((_, i) => ({
        ...baseProject,
        id: `m${i+2}`,
        parentProjectId: undefined,
        genre: "Horror" as const,
        releaseWeek: 90,
        status: "released" as const,
        revenue: 0 // Do not trigger crossover target loop
      }));

      const stateFatigued = { week: 100, studio: { internal: { projects: [flopProject, ...relatedProjectsFatigued, ...marketProjects] } } } as unknown as GameState;

      vi.spyOn(crypto, 'getRandomValues').mockImplementation((arr: any) => {
        arr[0] = Math.floor(0.25 * (0xffffffff + 1));
        return arr;
      });

      const result = exploitIP(flopProject, stateFatigued);

      expect(result).toBeDefined();
      expect(result?.title).toContain("Reboot");
      expect(result?.initialBuzzBonus).toBeLessThan(5);
    });

    it("returns null if franchise is severely fatigued, failed, but random check fails", () => {
      const flopProject = { ...baseProject, revenue: 70000000, genre: "Horror" as const };
      const relatedProjectsFatigued = Array(12).fill(0).map((_, i) => ({
        ...baseProject,
        id: `p${i+2}`,
        parentProjectId: "p1",
        genre: "Horror" as const,
        releaseWeek: 90,
        status: "released" as const
      }));
      const marketProjects = Array(15).fill(0).map((_, i) => ({
        ...baseProject,
        id: `m${i+2}`,
        parentProjectId: undefined,
        genre: "Horror" as const,
        releaseWeek: 90,
        status: "released" as const,
        revenue: 0
      }));

      const stateFatigued = { week: 100, studio: { internal: { projects: [flopProject, ...relatedProjectsFatigued, ...marketProjects] } } } as unknown as GameState;

      vi.spyOn(crypto, 'getRandomValues').mockImplementation((arr: any) => { arr[0] = Math.floor(0.98 * (0xffffffff + 1)); return arr; });
      const result = exploitIP(flopProject, stateFatigued);
      expect(result).toBeNull();
    });

    it("generates a deconstructive meta-sequel if franchise is heavily fatigued and fails", () => {
      const flopProject = { ...baseProject, revenue: 70000000, genre: "Horror" as const };

      const relatedProjectsFatigued = Array(12).fill(0).map((_, i) => ({
        ...baseProject,
        id: `p${i+2}`,
        parentProjectId: "p1",
        genre: "Horror" as const,
        releaseWeek: 90,
        status: "released" as const
      }));
      const marketProjects = Array(15).fill(0).map((_, i) => ({
        ...baseProject,
        id: `m${i+2}`,
        parentProjectId: undefined,
        genre: "Horror" as const,
        releaseWeek: 90,
        status: "released" as const,
        revenue: 0
      }));

      const stateFatigued = { week: 100, studio: { internal: { projects: [flopProject, ...relatedProjectsFatigued, ...marketProjects] } } } as unknown as GameState;

      vi.spyOn(crypto, 'getRandomValues').mockImplementation((arr: any) => {
        arr[0] = Math.floor(0.45 * (0xffffffff + 1));
        return arr;
      });
      const result = exploitIP(flopProject, stateFatigued);

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

      const state = { week: 100, studio: { internal: { projects: [baseProject, otherHit] } } } as unknown as GameState;

      // Need random > 0.8 for crossover target detection, then random < 0.2 for crossover selection
      let callCount = 0;
      vi.spyOn(crypto, 'getRandomValues').mockImplementation((arr: any) => {
        callCount++;
        if (callCount === 1) { arr[0] = Math.floor(0.9 * (0xffffffff + 1)); }
        else { arr[0] = Math.floor(0.1 * (0xffffffff + 1)); }
        return arr;
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

      const state = { week: 100, studio: { internal: { projects: [baseProject, otherHit] } } } as unknown as GameState;

      let callCount = 0;
      vi.spyOn(crypto, 'getRandomValues').mockImplementation((arr: any) => {
        callCount++;
        if (callCount === 1) { arr[0] = Math.floor(0.9 * (0xffffffff + 1)); }
        else { arr[0] = Math.floor(0.1 * (0xffffffff + 1)); }
        return arr;
      });

      const result = exploitIP(baseProject, state);
      expect(result?.title).toContain("vs Action Hero");
    });

    it("generates an Expanded Universe TV spinoff if fatigued", () => {
      const flopProject = { ...baseProject, revenue: 70000000, genre: "Horror" as const };
      const relatedProjectsFatigued = Array(12).fill(0).map((_, i) => ({
        ...baseProject,
        id: `p${i+2}`,
        parentProjectId: "p1",
        genre: "Horror" as const,
        releaseWeek: 90,
        status: "released" as const
      }));
      const marketProjects = Array(15).fill(0).map((_, i) => ({
        ...baseProject,
        id: `m${i+2}`,
        parentProjectId: undefined,
        genre: "Horror" as const,
        releaseWeek: 90,
        status: "released" as const,
        revenue: 0
      }));

      const stateFatigued = { week: 100, studio: { internal: { projects: [flopProject, ...relatedProjectsFatigued, ...marketProjects] } } } as unknown as GameState;

      vi.spyOn(crypto, 'getRandomValues').mockImplementation((arr: any) => {
        arr[0] = Math.floor(0.65 * (0xffffffff + 1));
        return arr;
      });

      const result = exploitIP(flopProject, stateFatigued);

      expect(result).toBeDefined();
      expect(result?.title).toContain("Expanded Universe");
      expect(result?.format).toBe("tv");
      expect(result?.releaseModel).toBe("binge");
    });

    it("generates a requel for legacy IPs", () => {
      const legacyProject = { ...baseProject, releaseWeek: 10, revenue: 600000000 };
      const state = { week: 200, studio: { internal: { projects: [legacyProject] } } } as unknown as GameState;

      vi.spyOn(crypto, 'getRandomValues').mockImplementation((arr: any) => {
        arr[0] = Math.floor(0.2 * (0xffffffff + 1));
        return arr;
      });
      const result = exploitIP(legacyProject, state);

      expect(result?.title).toContain("A New Generation");
      expect(result?.flavor).toContain("requel");
    });

    it("generates a Part 1 finale for massive franchises", () => {
      const massiveHit = { ...baseProject, revenue: 700000000, releaseWeek: 190 }; // revenue > 3x budget
      const relatedProjects = Array(4).fill(0).map((_, i) => ({
        ...massiveHit,
        id: `p${i+2}`,
        parentProjectId: "p1",
        releaseWeek: 190 + i
      }));
      const state = { week: 200, studio: { internal: { projects: [massiveHit, ...relatedProjects] } } } as unknown as GameState;

      // Not legacy (diff < 150)
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.52); // < 0.55 triggers Part 1 Finale
      const result = exploitIP(massiveHit, state);

      expect(result?.title).toContain("The Final Chapter - Part 1");
      expect(result?.budgetTier).toBe("blockbuster");
    });

    it("generates a direct sequel", () => {
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.58); // < 0.6 but >= 0.55 triggers sequel
      const result = exploitIP(baseProject);

      expect(result?.title).toBe("Galaxy Wars 1"); // 0 related + 1 = 1 (or 2 depending on if it counts itself if state isn't passed)
      expect(result?.isSpinoff).toBe(true);
    });

    it("generates a prequel", () => {
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.7); // < 0.8 triggers prequel
      const result = exploitIP(baseProject);

      expect(result?.title).toContain("Origins");
    });

    it("generates a spinoff", () => {
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.9); // >= 0.8 triggers spinoff
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
      const state = { studio: { internal: { projects: [baseProject, ...relatedProjects] } } } as unknown as GameState;

      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.5); // trigger sequel
      const result = exploitIP(baseProject, state);

      // Penalty will be massive, so bonus drops heavily
      expect(result?.initialBuzzBonus).toBe(-10); // Minimum threshold
    });

    it("applies steep fatigue curve for Superhero genre heavily saturated and returns null due to Dead IP status", () => {
      const flopProject = { ...baseProject, revenue: 100000000, genre: "Superhero" };
      const recentReleases = Array(18).fill(0).map((_, i) => ({ // > 15 to hit Dead IP * 3.0 curve
        ...flopProject,
        id: `p_market_${i}`,
        parentProjectId: undefined,
        releaseWeek: 90
      }));
      const relatedProjects = Array(5).fill(0).map((_, i) => ({
        ...flopProject,
        id: `p_rel_${i}`,
        parentProjectId: flopProject.id,
      }));
      const state = { week: 100, studio: { internal: { projects: [flopProject, ...relatedProjects, ...recentReleases] } } } as unknown as GameState;

      vi.spyOn(Math, 'random').mockReturnValue(0.5); // 0.5 < 0.8 means Dead IP will return null
      const result = exploitIP(flopProject, state);

      expect(result).toBeNull();
    });

    it("generates a Crisis crossover event if conditions are met", () => {
      const otherHit = {
        ...baseProject,
        id: "p99",
        title: "Action Hero",
        genre: "Action" as const, // Compatible genre
        revenue: 600000000 // > 2x budget
      };

      const manyProjects = Array(20).fill(0).map((_, i) => ({
        ...baseProject,
        id: `univ_${i}`,
        parentProjectId: "p1"
      }));

      const state = { week: 100, studio: { internal: { projects: [baseProject, otherHit, ...manyProjects] } } } as unknown as GameState;

      let callCount = 0;
      vi.spyOn(crypto, 'getRandomValues').mockImplementation((arr: any) => {
        callCount++;
        if (callCount === 1) { arr[0] = Math.floor(0.9 * (0xffffffff + 1)); }
        else { arr[0] = Math.floor(0.05 * (0xffffffff + 1)); }
        return arr;
      });

      const result = exploitIP(baseProject, state);
      expect(result?.title).toContain("Crisis on Infinite Worlds");
      expect(result?.budgetTier).toBe("blockbuster");
    });

    it("generates a Revitalized Legacy IP if conditions are met", () => {
      const legacyProject = {
        ...baseProject,
        revenue: 600000000, // Very successful
        releaseWeek: 10,
        genre: "Horror" as const
      };

      const recentReleases = Array(20).fill(0).map((_, i) => ({
        ...legacyProject,
        id: `p_market_${i}`,
        parentProjectId: undefined,
        releaseWeek: 190,
        revenue: 0 // Do not trigger crossover loops
      }));
      const relatedProjects = Array(35).fill(0).map((_, i) => ({
        ...legacyProject,
        id: `p_rel_${i}`,
        parentProjectId: legacyProject.id,
      }));

      const state = { week: 200, studio: { internal: { projects: [legacyProject, ...recentReleases, ...relatedProjects] } } } as unknown as GameState;

      let callCount = 0;
      vi.spyOn(crypto, 'getRandomValues').mockImplementation((arr: any) => {
        callCount++;
        if (callCount === 1) { arr[0] = Math.floor(0.9 * (0xffffffff + 1)); } // Avoid crossover logic
        else { arr[0] = Math.floor(0.18 * (0xffffffff + 1)); } // rand < 0.2 to hit Revitalized Legacy
        return arr;
      });

      const result = exploitIP(legacyProject, state);

      expect(result?.title).toContain("Awakening");
      expect(result?.flavor).toContain("soft reboot");
      expect(result?.budgetTier).toBe("blockbuster");
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
      const state = { week: 200, studio: { internal: { projects: [legacyProject, relatedProject] } } } as unknown as GameState;

      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.4); // < 0.5 triggers IP rush job when at risk and not fully fatigued
      const result = exploitIP(legacyProject, state);

      expect(result).toBeDefined();
      expect(result?.title).toContain("The Untold Chapter");
      expect(result?.budgetTier).toBe("low");
      expect(result?.initialBuzzBonus).toBe(-5);
      expect(result?.flavor).toContain("ensure the studio retains the");
    });
  });
});
