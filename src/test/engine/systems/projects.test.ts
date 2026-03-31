import { describe, it, expect, vi } from "vitest";
import { advanceProject, handleReleasePhaseEntry } from "../../../engine/systems/projects";
import { Project, TalentProfile, Contract } from "../../../engine/types";
import * as utils from "../../../engine/utils";

const mockProject: Project = {
  id: "proj-1",
  title: "Test Project",
  budgetTier: "low",
  budget: 500000,
  genre: "Comedy",
  status: "development",
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
};

describe("advanceProject", () => {
  it("does nothing for archived projects", () => {
    const project = { ...mockProject, status: "archived" as const };
    const { project: p, update } = advanceProject(project, 1, 50, [], new Map(), 50);
    expect(p.status).toBe("archived");
    expect(update).toBeNull();
  });

  it("advances development project normally", () => {
    const { project: p, update } = advanceProject(mockProject, 1, 50, [], new Map());
    expect(p.weeksInPhase).toBe(1);
    expect(p.status).toBe("development");
    expect(update).toBeNull();
  });

  it("transitions from development to needs_greenlight", () => {
    const project = { ...mockProject, weeksInPhase: 1 };
    const { project: p, update } = advanceProject(project, 1, 50, [], new Map());
    expect(p.status).toBe("needs_greenlight");
    expect(p.weeksInPhase).toBe(0);
    expect(update).toContain("is ready for greenlight committee review");
  });

  it("transitions from production to marketing", () => {
    const project = { ...mockProject, status: "production" as const, weeksInPhase: 1 };
    const { project: p, update } = advanceProject(project, 1, 50, [], new Map());
    expect(p.status).toBe("marketing");
    expect(p.weeksInPhase).toBe(0);
    expect(update).toContain("has wrapped production");
  });

  it("accumulates revenue and decays weekly revenue for released projects", () => {
    const project = { ...mockProject, status: "released" as const, weeklyRevenue: 500000 };
    const { project: p, update } = advanceProject(project, 1, 50, [], new Map(), 50);
    expect(p.revenue).toBe(500000);
    expect(p.weeklyRevenue).toBeLessThan(500000);
    expect(update).toContain("grossed");
  });

  it("archives released project after its run", () => {
    const project = { ...mockProject, status: "released" as const, weeklyRevenue: 50000 };
    const { project: p, update } = advanceProject(project, 1, 50, [], new Map(), 50);
    expect(p.status).toBe("post_release");
    expect(update).toContain("completes its theatrical run");
  });

  it("transitions tv from development to pitching", () => {
    const project = { ...mockProject, weeksInPhase: 1, format: 'tv' as const };
    const { project: p, update } = advanceProject(project, 1, 50, [], new Map());
    expect(p.status).toBe("pitching");
    expect(p.weeksInPhase).toBe(0);
    expect(update).toContain("ready to be pitched");
  });

  it("drifts buzz with talent buzz bonus during dev", () => {
    const project = { ...mockProject, buzz: 50 };
    const mockTalent: TalentProfile = {
      id: "t1", name: "Star", roles: ["actor"], prestige: 100, fee: 1000000, draw: 100, temperament: "Pro", accessLevel: "legacy",
      age: 25, gender: "female"
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
    it("sets released status and assigns a review score", () => {
      const proj = { ...mockProject, status: "marketing" as const };
      const { update } = handleReleasePhaseEntry(proj, 1, 50, [], new Map());
      expect(proj.status).toBe("released");
      expect(proj.releaseWeek).toBe(1);
      expect(proj.reviewScore).toBeDefined();
      expect(update).toContain("opening");
    });
  });
});
