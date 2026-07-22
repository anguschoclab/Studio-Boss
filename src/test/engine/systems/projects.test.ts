import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
  activeCrisis: null,
  scriptHeat: 50,
  activeRoles: [],
  scriptEvents: [],
} as import("../../../engine/types").Project;

describe("advanceProject", () => {
  beforeEach(() => {
    vi.spyOn(utils, "randRange").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it("transitions from production to post_production", () => {
    const project = { ...mockProject, state: "production" as const, weeksInPhase: 1 };
    const { project: p, update } = advanceProject(project, 1, 50, [], new Map());
    expect(p.state).toBe("post_production");
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
    const { project: p, update } = advanceProject(
      project,
      1,
      50,
      [],
      new Map(),
      50,
      [],
      1.0,
      1.0,
      0,
      rng
    );
    expect(p.state).toBe("post_release");
    expect(update).toContain("completes its theatrical run");
  });

  it("transitions tv from development to pitching", () => {
    const project = {
      ...mockProject,
      weeksInPhase: 1,
      format: "tv" as const,
      type: "SERIES" as const,
    } as any;
    const { project: p, update } = advanceProject(project, 1, 50, [], new Map());
    expect(p.state).toBe("pitching");
    expect(p.weeksInPhase).toBe(0);
    expect(update).toContain("ready to be pitched");
  });

  it("drifts buzz with talent buzz bonus during dev", () => {
    const project = { ...mockProject, buzz: 50 };
    const mockTalent: Talent = {
      id: "t1",
      name: "Star",
      roles: ["actor"],
      prestige: 100,
      fee: 1000000,
      draw: 100,
      personality: "Pro",
      accessLevel: "legacy",
    } as any;
    const pool = new Map([["t1", mockTalent]]);
    const contracts: Contract[] = [
      { id: "c1", projectId: "proj-1", talentId: "t1", fee: 100000, backendPercent: 0 },
    ];

    const { project: p } = advanceProject(project, 1, 50, contracts, pool, 50);

    // draw = 100 => bonus = 2. randRange = 0. base buzz = 50. Total change: +2. Expected: 52.
    expect(p.buzz).toBe(52);
  });

  it("drifts buzz with no talent (roll only)", () => {
    const project = { ...mockProject, buzz: 50 };
    const { project: p } = advanceProject(project, 1, 50, [], new Map(), 50);
    // No talent => bonus = 0. randRange = 0 (mocked). buzz = 50 + 0 + 0 = 50.
    expect(p.buzz).toBe(50);
  });

  it("clamps buzz to 0 on large negative drift", () => {
    const project = { ...mockProject, buzz: 1 };
    vi.spyOn(utils, "randRange").mockReturnValue(-10);
    const { project: p } = advanceProject(project, 1, 50, [], new Map(), 50);
    // buzz = 1 + (-10) + 0 = -9, clamped to 0.
    expect(p.buzz).toBe(0);
  });

  it("clamps buzz to 100 on large positive drift", () => {
    const project = { ...mockProject, buzz: 99 };
    const mockTalent: Talent = {
      id: "t1",
      name: "Star",
      roles: ["actor"],
      prestige: 100,
      fee: 1000000,
      draw: 100,
      personality: "Pro",
      accessLevel: "legacy",
    } as any;
    const pool = new Map([["t1", mockTalent]]);
    const contracts: Contract[] = [
      { id: "c1", projectId: "proj-1", talentId: "t1", fee: 100000, backendPercent: 0 },
    ];
    vi.spyOn(utils, "randRange").mockReturnValue(6);
    const { project: p } = advanceProject(project, 1, 50, contracts, pool, 50);
    // buzz = 99 + 6 + 2 (draw 100 / 50) = 107, clamped to 100.
    expect(p.buzz).toBe(100);
  });

  it("stacks buzz bonus from multiple talent", () => {
    const project = { ...mockProject, buzz: 50 };
    const mockTalent1: Talent = {
      id: "t1",
      name: "Star1",
      roles: ["actor"],
      prestige: 50,
      fee: 500000,
      draw: 50,
      personality: "Pro",
      accessLevel: "legacy",
    } as any;
    const mockTalent2: Talent = {
      id: "t2",
      name: "Star2",
      roles: ["actor"],
      prestige: 50,
      fee: 500000,
      draw: 50,
      personality: "Pro",
      accessLevel: "legacy",
    } as any;
    const pool = new Map([
      ["t1", mockTalent1],
      ["t2", mockTalent2],
    ]);
    const contracts: Contract[] = [
      { id: "c1", projectId: "proj-1", talentId: "t1", fee: 100000, backendPercent: 0 },
      { id: "c2", projectId: "proj-1", talentId: "t2", fee: 100000, backendPercent: 0 },
    ];
    // randRange = 0 (from beforeEach). bonus = 50/50 + 50/50 = 2. buzz = 50 + 0 + 2 = 52.
    const { project: p } = advanceProject(project, 1, 50, contracts, pool, 50);
    expect(p.buzz).toBe(52);
  });

  it("uses rng.rangeInt when rng is provided", () => {
    const project = { ...mockProject, buzz: 50 };
    const rng = new RandomGenerator(42);
    const { project: p } = advanceProject(
      project,
      1,
      50,
      [],
      new Map(),
      50,
      [],
      1.0,
      1.0,
      0,
      rng
    );
    // rng.rangeInt(-4, 6) produces a non-zero integer, so buzz should change.
    expect(p.buzz).not.toBe(50);
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

describe("randRange mock hygiene", () => {
  it("mock is restored after advanceProject describe block (no leakage)", () => {
    // Verify that randRange is not mocked here — afterEach restored it.
    const result = utils.randRange(0, 1);
    expect(result).not.toBe(0);
  });
});
