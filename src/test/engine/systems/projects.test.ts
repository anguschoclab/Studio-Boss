import { describe, it, expect, vi } from "vitest";
import { advanceProject, handleReleasePhaseEntry } from "../../../engine/systems/projects";
import { Project, Talent, Contract } from "../../../engine/types";
import * as utils from "../../../engine/utils";
import { RandomGenerator } from "../../../engine/utils/rng";

const mockProject: Project = {
  id: "proj-1",
  title: "Test Project",
  type: "FILM",
  budgetTier: "low",
  budget: 500000,
  genre: "Comedy",
  state: "development",
  developmentWeeks: 2,
  productionWeeks: 2,
  weeksInPhase: 0,
  format: "film",
  targetAudience: "General",
  flavor: "Quirky",
  releaseWeek: null,
  weeklyCost: 10000,
  buzz: 50,
  revenue: 0,
  weeklyRevenue: 0,
  momentum: 50,
  progress: 0,
  accumulatedCost: 0,
  activeCrisis: null
} as Project;

describe("advanceProject", () => {
  it("does nothing for archived projects", () => {
    const project = { ...mockProject, state: "archived" as const };
    const { project: p, update } = advanceProject(project, 1, 50, [], new Map(), 50);
    expect(p.state).toBe("archived");
    expect(update).toBeNull();
  });

  it("advances development project normally", () => {
    const { project: p, update } = advanceProject(mockProject, 1, 50, [], new Map());
    expect(p.weeksInPhase).toBe(1);
    expect(p.state).toBe("development");
    expect(update).toBeNull();
  });

  it("transitions from development to needs_greenlight", () => {
    const project = { ...mockProject, weeksInPhase: 1 };
    const { project: p, update } = advanceProject(project, 1, 50, [], new Map());
    expect(p.state).toBe("needs_greenlight");
    expect(p.weeksInPhase).toBe(0);
    expect(update).toContain("is ready for greenlight");
  });

  it("transitions from production to marketing", () => {
    const project = { ...mockProject, state: "production" as const, weeksInPhase: 1 };
    const { project: p, update } = advanceProject(project, 1, 50, [], new Map());
    expect(p.state).toBe("marketing");
    expect(p.weeksInPhase).toBe(0);
    expect(update).toContain("has wrapped production");
  });

  it("accumulates revenue and decays weekly revenue for released projects", () => {
    const project = { ...mockProject, state: "released" as const, weeklyRevenue: 500000 };
    const { project: p, update } = advanceProject(project, 1, 50, [], new Map(), 50);
    expect(p.revenue).toBeGreaterThan(0);
    expect(p.weeklyRevenue).toBeLessThan(500000);
    expect(update).toContain("grossed");
  });

  it("returns StateImpact for funds change", () => {
    const rng = new RandomGenerator(1);
    const project = { ...mockProject, state: "released" as const, weeklyRevenue: 50 };
    // Signature: project, currentWeek, studioPrestige, projectContracts, talentPoolMap, rivalStrengthAvg, projectAwards, trendMultiplier, franchiseSynergy, franchiseFatigue, rng
    const { project: p, update } = advanceProject(project, 1, 50, [], new Map(), 50, [], 1.0, 1.0, 0, rng);
    expect(p.state).toBe("post_release");
    expect(update).toContain("completes its theatrical run");
  });

  it("transitions tv from development to pitching", () => {
    const project = { ...mockProject, weeksInPhase: 1, format: 'tv' as const, type: 'SERIES' as const } as any;
    const { project: p, update } = advanceProject(project, 1, 50, [], new Map());
    expect(p.state).toBe("pitching");
    expect(p.weeksInPhase).toBe(0);
    expect(update).toContain("ready to be pitched");
  });

  it("drifts buzz with talent buzz bonus during dev", () => {
    const project = { ...mockProject, buzz: 50 };
    const mockTalent: Talent = {
      id: "t1", name: "Star", roles: ["actor"], prestige: 100, fee: 1000000, draw: 100, personality: "Pro", accessLevel: "legacy",
    } as any;
    const pool = new Map([["t1", mockTalent]]);
    const contracts: Contract[] = [{ id: "c1", projectId: "proj-1", talentId: "t1", fee: 100000, backendPercent: 0 }];
    
    vi.spyOn(utils, 'randRange').mockReturnValue(0); // Fix randomness
    const { project: p } = advanceProject(project, 1, 50, contracts, pool, 50);
    
    // draw = 100 => bonus = 2. randRange = 0. base buzz = 50. Total change: +2. Expected: 52.
    expect(p.buzz).toBe(52);
    vi.restoreAllMocks();
  });

  describe("Handle Release Phase Entry", () => {
    it("transitions marketing project to released", () => {
      const proj = { ...mockProject, state: "marketing" as const };
      const { update } = handleReleasePhaseEntry(proj, 1, 50, [], new Map());
      expect(proj.state).toBe("released");
      expect(proj.releaseWeek).toBe(1);
      expect(proj.reviewScore).toBeDefined();
      expect(update).toBeTruthy();
    });
  });
});
