import { describe, it, expect } from "vitest";
import {
  evaluateGreenlight,
  roleCompletenessScore,
  scheduleCertainty,
} from "@/engine/systems/greenlight";
import { Project, Talent, Contract } from "@/engine/types";

function baseProject(overrides: Partial<Project> = {}): Project {
  return {
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
    state: "needs_greenlight",
    buzz: 50,
    weeksInPhase: 0,
    developmentWeeks: 8,
    productionWeeks: 12,
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: null,
    ...overrides,
  } as Project;
}

function talent(id: string, role: string, draw = 60): Talent {
  return {
    id,
    name: id,
    roles: [role],
    role: role as any,
    prestige: 60,
    fee: 1_000_000,
    draw,
    personality: "Pro",
    accessLevel: "outsider",
  } as any;
}

function contract(talentId: string, role: string): Contract {
  return { id: `c-${talentId}`, talentId, role: role as any, projectId: "p1" } as any;
}

describe("roleCompletenessScore", () => {
  it("returns 100 when director, actor, and writer are filled", () => {
    const contracts = [
      contract("t1", "director"),
      contract("t2", "actor"),
      contract("t3", "writer"),
    ];
    const talents = {
      t1: talent("t1", "director"),
      t2: talent("t2", "actor"),
      t3: talent("t3", "writer"),
    };
    expect(roleCompletenessScore("p1", contracts, talents)).toBe(100);
  });

  it("returns 67 when two of three roles are filled", () => {
    const contracts = [contract("t1", "director"), contract("t2", "actor")];
    const talents = { t1: talent("t1", "director"), t2: talent("t2", "actor") };
    expect(roleCompletenessScore("p1", contracts, talents)).toBe(67);
  });

  it("returns 0 when no roles are filled", () => {
    expect(roleCompletenessScore("p1", [], {})).toBe(0);
  });
});

describe("scheduleCertainty", () => {
  it("is high when budget per production week is large", () => {
    // 200M / (24 weeks * 1M) * 50 = 416 -> clamped to 100
    expect(scheduleCertainty(baseProject({ budget: 200_000_000, productionWeeks: 24 }))).toBe(100);
  });

  it("is low when budget per production week is small", () => {
    // 5M / (24 weeks * 1M) * 50 = 10.4 -> low risk
    expect(scheduleCertainty(baseProject({ budget: 5_000_000, productionWeeks: 24 }))).toBeLessThan(
      40
    );
  });
});

describe("evaluateGreenlight — role completeness + schedule certainty", () => {
  it("includes roleCompleteness and scheduleCertainty in the report", () => {
    const contracts = [contract("t1", "actor")];
    const talents = { t1: talent("t1", "actor") };
    const report = evaluateGreenlight(
      baseProject(),
      100_000_000,
      [talent("t1", "actor")],
      10,
      [],
      contracts,
      talents
    );
    expect(report.roleCompleteness).toBe(33); // only actor attached
    expect(report.scheduleCertainty).toBeGreaterThan(0);
  });

  it("penalizes an incomplete role package", () => {
    const fullContracts = [
      contract("t1", "actor"),
      contract("t2", "director"),
      contract("t3", "writer"),
    ];
    const fullTalents = {
      t1: talent("t1", "actor"),
      t2: talent("t2", "director"),
      t3: talent("t3", "writer"),
    };
    const full = evaluateGreenlight(
      baseProject(),
      100_000_000,
      [talent("t1", "actor"), talent("t2", "director"), talent("t3", "writer")],
      10,
      [],
      fullContracts,
      fullTalents
    );
    const partialContracts = [contract("t1", "actor")];
    const partialTalents = { t1: talent("t1", "actor") };
    const partial = evaluateGreenlight(
      baseProject(),
      100_000_000,
      [talent("t1", "actor")],
      10,
      [],
      partialContracts,
      partialTalents
    );
    expect(full.score).toBeGreaterThan(partial.score);
    expect(full.roleCompleteness).toBe(100);
    expect(partial.roleCompleteness).toBe(33);
  });

  it("penalizes a missing key role in an otherwise strong package", () => {
    const fullContracts = [
      contract("t1", "actor"),
      contract("t2", "director"),
      contract("t3", "writer"),
    ];
    const fullTalents = {
      t1: talent("t1", "actor", 90),
      t2: talent("t2", "director", 90),
      t3: talent("t3", "writer", 90),
    };
    const full = evaluateGreenlight(
      baseProject(),
      200_000_000,
      [talent("t1", "actor", 90), talent("t2", "director", 90), talent("t3", "writer", 90)],
      10,
      [],
      fullContracts,
      fullTalents
    );

    const partialContracts = [contract("t1", "actor")];
    const partialTalents = { t1: talent("t1", "actor", 90) };
    const partial = evaluateGreenlight(
      baseProject(),
      200_000_000,
      [talent("t1", "actor", 90)],
      10,
      [],
      partialContracts,
      partialTalents
    );
    expect(full.recommendation).toBe("Easy Greenlight");
    expect(full.roleCompleteness).toBe(100);
    expect(partial.roleCompleteness).toBe(33);
    // The incomplete package scores lower than the complete one.
    expect(full.score).toBeGreaterThan(partial.score);
  });

  it("engine report matches the UI derivation in GreenlightQueue", () => {
    // GreenlightQueue computes role completeness as filled/3 * 100 with director/actor/writer.
    const contracts = [contract("t1", "director"), contract("t2", "actor")];
    const talents = { t1: talent("t1", "director"), t2: talent("t2", "actor") };
    const report = evaluateGreenlight(
      baseProject(),
      100_000_000,
      [talent("t1", "director"), talent("t2", "actor")],
      10,
      [],
      contracts,
      talents
    );
    expect(report.roleCompleteness).toBe(67);
  });
});
