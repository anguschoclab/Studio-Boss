import { describe, it, expect, vi, beforeEach } from "vitest";
import * as utils from "../../../engine/utils";
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
  state: "released",
  buzz: 100,
  weeksInPhase: 5,
  developmentWeeks: 20,
  productionWeeks: 20,
  revenue: 500000000, // 2.5x budget
  weeklyRevenue: 0,
  releaseWeek: null,
} as Project;

describe("franchise system", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });


  describe("Guild Auditor: Edge Cases", () => {
    it("handles an empty project list safely when evaluating crossover events", () => {
      const state = { week: 100, studio: { internal: { projects: {} } } } as unknown as GameState;
      exploitIP(baseProject, state);
      expect(true).toBe(true);
    });

    it("handles negative buzz and budget correctly in fatigue calculation", () => {
      const negativeProject = { ...baseProject, buzz: -100, budget: -10000000 };
      const state = { week: 100, studio: { internal: { projects: { [negativeProject.id]: negativeProject } } } } as unknown as GameState;
      expect(() => exploitIP(negativeProject, state)).not.toThrow();
    });
  });

  describe("exploitIP", () => {
    it("returns null if source project is not released", () => {
      const devProject = { ...baseProject, state: "development" as const };
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
      const smallerRelated = Array(6).fill(0).map((_, i) => ({
        ...baseProject,
        id: `p${i+2}`,
        parentProjectId: "p1"
      }));
      const state2 = { week: 100, studio: { internal: { projects: {
        [flopProject.id]: flopProject,
        ...Object.fromEntries(smallerRelated.map(p => [p.id, p]))
      } } } } as unknown as GameState;

      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.45); 
      const result = exploitIP(flopProject, state2);

      expect(result).toBeDefined();
      expect(result!.title).toContain("Reboot");
    });

    it("returns null if franchise is severely fatigued, failed, but random check fails", () => {
      const flopProject = { ...baseProject, revenue: 100000000 };
      const relatedProjects = Array(10).fill(0).map((_, i) => ({
        ...baseProject,
        id: `p${i+2}`,
        parentProjectId: "p1"
      }));
      const state = { studio: { internal: { projects: {
        [flopProject.id]: flopProject,
        ...Object.fromEntries(relatedProjects.map(p => [p.id, p]))
      } } } } as unknown as GameState;

      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.98); 
      const result = exploitIP(flopProject, state);
      expect(result).toBeNull();
    });

    it("generates a deconstructive meta-sequel if franchise is heavily fatigued and fails", () => {
      const flopProject = { ...baseProject, revenue: 100000000 };
      const smallerRelated = Array(6).fill(0).map((_, i) => ({
        ...baseProject,
        id: `p${i+2}`,
        parentProjectId: "p1"
      }));

      const state = { week: 100, studio: { internal: { projects: {
        [flopProject.id]: flopProject,
        ...Object.fromEntries(smallerRelated.map(p => [p.id, p]))
      } } } } as unknown as GameState;

      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.55); 
      const result = exploitIP(flopProject, state);

      expect(result).toBeDefined();
      expect(result!.title).toContain("Resurrection");
    });

    it("generates crossover event if another huge hit exists in same genre", () => {
      const otherHit = {
        ...baseProject,
        id: "p99",
        title: "Star Trek",
        revenue: 600000000 
      };

      const state = { studio: { internal: { projects: { [baseProject.id]: baseProject, [otherHit.id]: otherHit } } } } as unknown as GameState;

      let callCount = 0;
      vi.spyOn(utils, 'secureRandom').mockImplementation(() => {
        callCount++;
        if (callCount === 1) return 0.9; 
        return 0.1; 
      });

      const result = exploitIP(baseProject, state);
      expect(result?.title).toContain("vs Star Trek");
    });

    it("generates an Expanded Universe TV spinoff if fatigued", () => {
      const flopProject = { ...baseProject, revenue: 100000000 };
      const smallerRelated = Array(6).fill(0).map((_, i) => ({
        ...baseProject,
        id: `p${i+2}`,
        parentProjectId: "p1"
      }));
      const state = { studio: { internal: { projects: {
        [flopProject.id]: flopProject,
        ...Object.fromEntries(smallerRelated.map(p => [p.id, p]))
      } } }, week: 200 } as unknown as GameState;

      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.65);
      const result = exploitIP(flopProject, state);

      expect(result).toBeDefined();
      expect(result!.format).toBe("tv");
    });

    it("generates a requel for legacy IPs", () => {
      const legacyProject = { ...baseProject, releaseWeek: 10, revenue: 600000000 };
      const state = { week: 200, studio: { internal: { projects: { [legacyProject.id]: legacyProject } } } } as unknown as GameState;

      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.2); 
      const result = exploitIP(legacyProject, state);

      expect(result?.title).toContain("A New Generation");
    });

    it("generates a Part 1 finale for massive franchises", () => {
      const massiveHit = { ...baseProject, revenue: 700000000, releaseWeek: 190 }; 
      const relatedProjects = Array(4).fill(0).map((_, i) => ({
        ...massiveHit,
        id: `p${i+2}`,
        parentProjectId: "p1",
        releaseWeek: 190 + i
      }));
      const state = { week: 200, studio: { internal: { projects: {
        [massiveHit.id]: massiveHit,
        ...Object.fromEntries(relatedProjects.map(p => [p.id, p]))
      } } } } as unknown as GameState;

      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.52); 
      const result = exploitIP(massiveHit, state);

      expect(result?.title).toContain("The Final Chapter - Part 1");
    });

    it("generates a direct sequel", () => {
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.58); 
      const result = exploitIP(baseProject);

      expect(result?.title).toBe("Galaxy Wars 1");
    });

    it("generates a prequel", () => {
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.7); 
      const result = exploitIP(baseProject);

      expect(result?.title).toContain("Origins");
    });

    it("generates a spinoff", () => {
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.9); 
      const result = exploitIP(baseProject);

      expect(result?.title).toContain("The Next Generation");
    });

    it("clamps buzz bonus to -10 when completely saturated", () => {
      const relatedProjects = Array(50).fill(0).map((_, i) => ({
        ...baseProject,
        id: `p${i+2}`,
        parentProjectId: "p1"
      }));
      const state = { studio: { internal: { projects: {
        [baseProject.id]: baseProject,
        ...Object.fromEntries(relatedProjects.map(p => [p.id, p]))
      } } } } as unknown as GameState;

      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.5); 
      const result = exploitIP(baseProject, state);

      expect(result?.initialBuzzBonus).toBe(-10);
    });

    it("applies steep fatigue curve for Superhero genre heavily saturated and returns null due to Dead IP status", () => {
      const flopProject = { ...baseProject, revenue: 100000000, genre: "Superhero" };
      const recentReleases = Array(18).fill(0).map((_, i) => ({ 
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
      const state = { week: 100, studio: { internal: { projects: {
        [flopProject.id]: flopProject,
        ...Object.fromEntries(relatedProjects.map(p => [p.id, p])),
        ...Object.fromEntries(recentReleases.map(p => [p.id, p]))
      } } } } as unknown as GameState;

      vi.spyOn(utils, "secureRandom").mockReturnValue(0.5); 
      const result = exploitIP(flopProject, state);

      expect(result).toBeNull();
    });

    it("generates a Crisis crossover event if conditions are met", () => {
      const otherHit = {
        ...baseProject,
        id: "p99",
        title: "Action Hero",
        genre: "Action", 
        revenue: 600000000 
      };

      const manyProjects = Array(20).fill(0).map((_, i) => ({
        ...baseProject,
        id: `univ_${i}`,
        parentProjectId: "p1"
      }));

      const state = { week: 100, studio: { internal: { projects: {
        [baseProject.id]: baseProject,
        [otherHit.id]: otherHit,
        ...Object.fromEntries(manyProjects.map(p => [p.id, p]))
      } } } } as unknown as GameState;

      let callCount = 0;
      vi.spyOn(utils, 'secureRandom').mockImplementation(() => {
        callCount++;
        if (callCount === 1) return 0.9; 
        return 0.08; 
      });

      const result = exploitIP(baseProject, state);
      expect(result?.title).toContain("Crisis on Infinite Worlds");
    });
  });
});
