import {describe, it, expect, beforeEach} from "vitest";
import {HeadlessController} from "@/engine/simulation/HeadlessController";
import {GameState, Talent, StateImpact} from "@/engine/types";
import {RandomGenerator} from "@/engine/utils/rng";

const makeTalent = (id: string, prestige: number = 50): Talent =>
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

const makeState = (talents: Record<string, Talent> = {}): GameState =>
  ({
    week: 1,
    gameSeed: 1,
    tickCount: 0,
    game: {currentWeek: 1},
    finance: {cash: 1_000_000, ledger: []},
    ip: {vault: [], franchises: {}},
    entities: {
      projects: {},
      releasedProjectIds: [],
      talents,
      contracts: {},
      rivals: {},
      contractsByProjectId: {},
      contractsByTalentId: {},
    },
    studio: {
      id: "player",
      name: "Test Studio",
      archetype: "major",
      prestige: 50,
      internal: {projectHistory: [], projects: {}, contracts: []},
    },
    market: {opportunities: [], buyers: []},
    industry: {families: [], agencies: [], agents: []},
    culture: {genrePopularity: {}},
    history: [],
    eventHistory: [],
  }) as unknown as GameState;

describe("HeadlessController.attributeTalent", () => {
  let rng: RandomGenerator;

  beforeEach(() => {
    rng = new RandomGenerator(42);
  });

  it("returns empty impacts when talent pool is empty", () => {
    const state = makeState({});
    const impacts = HeadlessController.attributeTalent(
      state,
      {budget: 10_000_000, marketingBudget: 0, format: "film", type: "FILM"},
      20_000_000,
      rng,
      true,
      75
    );
    expect(impacts).toHaveLength(0);
  });

  it("returns impacts when talent pool has entries and ROI is significant", () => {
    const talents = {
      t1: makeTalent("t1", 50),
      t2: makeTalent("t2", 60),
      t3: makeTalent("t3", 40),
      t4: makeTalent("t4", 55),
      t5: makeTalent("t5", 45),
    };
    const state = makeState(talents);
    const impacts = HeadlessController.attributeTalent(
      state,
      {budget: 10_000_000, marketingBudget: 0, format: "film", type: "FILM"},
      100_000_000,
      rng,
      true,
      75
    );
    expect(impacts.length).toBeGreaterThan(0);
  });

  it("returns empty impacts when delta is zero (neutral ROI film)", () => {
    const talents = {t1: makeTalent("t1", 50)};
    const state = makeState(talents);
    // ROI = 1.0 exactly => no basePrestige branch matches => delta = 0
    const impacts = HeadlessController.attributeTalent(
      state,
      {budget: 10_000_000, marketingBudget: 0, format: "film", type: "FILM"},
      10_000_000,
      rng,
      false,
      50
    );
    expect(impacts).toHaveLength(0);
  });

  it("handles TV projects using ratingScore instead of ROI", () => {
    const talents = {
      t1: makeTalent("t1", 50),
      t2: makeTalent("t2", 60),
      t3: makeTalent("t3", 40),
    };
    const state = makeState(talents);
    // TV with high rating => basePrestige = 10
    const impacts = HeadlessController.attributeTalent(
      state,
      {budget: 5_000_000, marketingBudget: 0, format: "tv", type: "SERIES"},
      0,
      rng,
      true,
      90
    );
    expect(impacts.length).toBeGreaterThan(0);
  });

  it("handles low ratingScore TV with negative prestige", () => {
    const talents = {
      t1: makeTalent("t1", 50),
      t2: makeTalent("t2", 60),
      t3: makeTalent("t3", 40),
    };
    const state = makeState(talents);
    // TV with very low rating => basePrestige = -3
    const impacts = HeadlessController.attributeTalent(
      state,
      {budget: 5_000_000, marketingBudget: 0, format: "tv", type: "SERIES"},
      0,
      rng,
      false,
      10
    );
    // Negative delta should still produce impacts (talent prestige decreases)
    expect(impacts.length).toBeGreaterThan(0);
  });
});
