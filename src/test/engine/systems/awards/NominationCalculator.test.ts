import {describe, it, expect} from "vitest";
import {calculateNominationWeight} from "@/engine/systems/awards/NominationCalculator";
import {Project, Talent} from "@/engine/types";

const makeProject = (overrides: Partial<Project> = {}): Project =>
  ({
    id: "p1",
    title: "Test Movie",
    type: "FILM",
    format: "film",
    genre: "Drama",
    budgetTier: "mid",
    budget: 10_000_000,
    weeklyCost: 100_000,
    targetAudience: "General",
    flavor: "Dramatic",
    state: "post_release",
    buzz: 50,
    weeksInPhase: 0,
    developmentWeeks: 10,
    productionWeeks: 10,
    revenue: 20_000_000,
    weeklyRevenue: 0,
    releaseWeek: null,
    accumulatedCost: 0,
    momentum: 50,
    progress: 0,
    activeCrisis: null,
    reviewScore: 80,
    ...overrides,
  }) as unknown as Project;

const makeTalent = (id: string, prestige: number): Talent =>
  ({
    id,
    name: `Talent ${id}`,
    role: "actor",
    roles: ["actor"],
    tier: "A_LIST",
    prestige,
    fee: 1_000_000,
    draw: 50,
    accessLevel: "outsider",
    momentum: 50,
    demographics: {age: 30, gender: "MALE", ethnicity: "White", country: "USA"},
    psychology: {ego: 50, mood: 100, scandalRisk: 0, synergyAffinities: [], synergyConflicts: []},
  }) as unknown as Talent;

describe("calculateNominationWeight", () => {
  it("returns 0 when metaScore < 65", () => {
    const project = makeProject({reviewScore: 60});
    const result = calculateNominationWeight(project, [makeTalent("t1", 90)]);
    expect(result).toBe(0);
  });

  it("returns 0 when metaScore is exactly 64", () => {
    const project = makeProject({reviewScore: 64});
    const result = calculateNominationWeight(project, [makeTalent("t1", 90)]);
    expect(result).toBe(0);
  });

  it("returns positive weight when metaScore >= 65", () => {
    const project = makeProject({reviewScore: 70, genre: "Action"});
    const result = calculateNominationWeight(project, []);
    // weight = (70 - 60) * 1.5 = 15, no genre modifier for Action
    expect(result).toBe(15);
  });

  it("adds prestige bonus when maxPrestige > 80", () => {
    const project = makeProject({reviewScore: 70, genre: "Action"});
    const result = calculateNominationWeight(project, [makeTalent("t1", 90)]);
    // weight = (70-60)*1.5 + (90-80)*2 = 15 + 20 = 35
    expect(result).toBe(35);
  });

  it("does not add prestige bonus when maxPrestige <= 80", () => {
    const project = makeProject({reviewScore: 70, genre: "Action"});
    const result = calculateNominationWeight(project, [makeTalent("t1", 80)]);
    // weight = (70-60)*1.5 = 15, no bonus since 80 is not > 80
    expect(result).toBe(15);
  });

  it("handles empty talent array (maxPrestige = 0)", () => {
    const project = makeProject({reviewScore: 70, genre: "Action"});
    const result = calculateNominationWeight(project, []);
    expect(result).toBe(15);
  });

  it("handles single talent", () => {
    const project = makeProject({reviewScore: 75, genre: "Action"});
    const result = calculateNominationWeight(project, [makeTalent("t1", 85)]);
    // weight = (75-60)*1.5 + (85-80)*2 = 22.5 + 10 = 32.5 => rounded = 33
    expect(result).toBe(33);
  });

  it("applies drama genre modifier (+10)", () => {
    const project = makeProject({reviewScore: 70, genre: "Drama"});
    const result = calculateNominationWeight(project, []);
    // weight = (70-60)*1.5 + 10 = 15 + 10 = 25
    expect(result).toBe(25);
  });

  it("applies horror genre modifier (-15)", () => {
    const project = makeProject({reviewScore: 70, genre: "Horror"});
    const result = calculateNominationWeight(project, []);
    // weight = (70-60)*1.5 - 15 = 15 - 15 = 0 => max(0, 0) = 0
    expect(result).toBe(0);
  });

  it("includes campaignBuzz in weight", () => {
    const project = makeProject({reviewScore: 70, genre: "Action"});
    const result = calculateNominationWeight(project, [], 20);
    // weight = (70-60)*1.5 + 20 = 15 + 20 = 35
    expect(result).toBe(35);
  });

  it("finds max prestige from multiple talents", () => {
    const project = makeProject({reviewScore: 70, genre: "Action"});
    const talents = [makeTalent("t1", 60), makeTalent("t2", 95), makeTalent("t3", 70)];
    const result = calculateNominationWeight(project, talents);
    // weight = (70-60)*1.5 + (95-80)*2 = 15 + 30 = 45
    expect(result).toBe(45);
  });

  it("returns non-negative result even with negative genre modifier", () => {
    const project = makeProject({reviewScore: 66, genre: "Horror"});
    const result = calculateNominationWeight(project, []);
    // weight = (66-60)*1.5 - 15 = 9 - 15 = -6 => max(0, -6) = 0
    expect(result).toBe(0);
  });
});
