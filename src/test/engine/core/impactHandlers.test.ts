import { describe, it, expect } from "vitest";
import { GameState, StateImpact, Contract, Project } from "@/engine/types";
import { applySingleImpact } from "@/engine/core/impactHandlers";

function makeMockState(): GameState {
  return {
    week: 1,
    gameSeed: 1,
    tickCount: 0,
    projects: { active: [] },
    game: { currentWeek: 1 },
    finance: { cash: 1_000_000, ledger: [] },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    entities: {
      projects: {},
      talents: {},
      contracts: {},
      contractsByProjectId: {},
      contractsByTalentId: {},
      rivals: {},
    },
    studio: {
      name: "Test Studio",
      id: "PLAYER",
      archetype: "major",
      prestige: 50,
      cash: 1_000_000,
      internal: {
        projects: {},
        contracts: [],
      },
    },
    market: { opportunities: [], buyers: [] },
    industry: {
      rivals: [],
      families: [],
      agencies: [],
      agents: [],
    },
    culture: { genrePopularity: {} },
    history: [],
  } as unknown as GameState;
}

describe("RIVAL_UPDATED deltas", () => {
  it("accumulates stat deltas across multiple impacts to the same rival", () => {
    const state = makeMockState();
    state.entities.rivals["r1"] = {
      id: "r1",
      name: "Rival",
      prestige: 40,
      strength: 50,
      cash: 10_000_000,
    } as GameState["entities"]["rivals"][string];

    let next = applySingleImpact(state, {
      type: "RIVAL_UPDATED",
      payload: { rivalId: "r1", update: {}, deltas: { prestige: -5 } },
    } as StateImpact);
    next = applySingleImpact(next, {
      type: "RIVAL_UPDATED",
      payload: { rivalId: "r1", update: {}, deltas: { prestige: -10, strength: -2 } },
    } as StateImpact);

    expect(next.entities.rivals["r1"].prestige).toBe(25);
    expect(next.entities.rivals["r1"].strength).toBe(48);
  });

  it("applies deltas after update merge and clamps to field bounds", () => {
    const state = makeMockState();
    state.entities.rivals["r1"] = {
      id: "r1",
      name: "Rival",
      prestige: 3,
      strength: 98,
    } as GameState["entities"]["rivals"][string];

    const next = applySingleImpact(state, {
      type: "RIVAL_UPDATED",
      payload: {
        rivalId: "r1",
        update: { prestige: 50 },
        deltas: { prestige: -60, strength: 10 },
      },
    } as StateImpact);

    expect(next.entities.rivals["r1"].prestige).toBe(0);
    expect(next.entities.rivals["r1"].strength).toBe(100);
  });
});

describe("bag-impact handler: newContracts", () => {
  it("adds contracts to entities.contracts and contractsByProjectId", () => {
    const state = makeMockState();
    const contract: Contract = {
      id: "c1",
      projectId: "p1",
      talentId: "t1",
      fee: 100000,
      role: "actor",
      backendPercent: 0,
    } as Contract;

    const impact = { newContracts: [contract] } as StateImpact;
    const result = applySingleImpact(state, impact);

    expect(result.entities.contracts["c1"]).toBeDefined();
    expect(result.entities.contracts["c1"].id).toBe("c1");
    expect(result.entities.contractsByProjectId["p1"]).toContain("c1");
  });
});

describe("bag-impact handler: newProjects", () => {
  it("adds projects to entities.projects", () => {
    const state = makeMockState();
    const project: Project = {
      id: "p1",
      title: "Test Project",
      state: "development",
      budget: 5000000,
    } as Project;

    const impact = { newProjects: [project] } as StateImpact;
    const result = applySingleImpact(state, impact);

    expect(result.entities.projects["p1"]).toBeDefined();
    expect(result.entities.projects["p1"].id).toBe("p1");
  });
});

describe("bag-impact handler: removeContracts", () => {
  it('removes contracts matching "projectId:talentId" format', () => {
    const state = makeMockState();
    const contract: Contract = {
      id: "c1",
      projectId: "p1",
      talentId: "t1",
      fee: 100000,
      role: "actor",
      backendPercent: 0,
    } as Contract;

    state.entities.contracts["c1"] = contract;
    state.entities.contractsByProjectId = { p1: ["c1"] };

    const impact = { removeContracts: ["p1:t1"] } as StateImpact;
    const result = applySingleImpact(state, impact);

    expect(result.entities.contracts["c1"]).toBeUndefined();
    expect(result.entities.contractsByProjectId["p1"]).toBeUndefined();
  });

  it("leaves state unchanged for non-matching entries", () => {
    const state = makeMockState();
    const contract: Contract = {
      id: "c1",
      projectId: "p1",
      talentId: "t1",
      fee: 100000,
      role: "actor",
      backendPercent: 0,
    } as Contract;

    state.entities.contracts["c1"] = contract;
    state.entities.contractsByProjectId = { p1: ["c1"] };

    const impact = { removeContracts: ["p1:t99"] } as StateImpact;
    const result = applySingleImpact(state, impact);

    expect(result.entities.contracts["c1"]).toBeDefined();
    expect(result.entities.contractsByProjectId["p1"]).toContain("c1");
  });

  it("leaves state unchanged for malformed entries (no colon)", () => {
    const state = makeMockState();
    const contract: Contract = {
      id: "c1",
      projectId: "p1",
      talentId: "t1",
      fee: 100000,
      role: "actor",
      backendPercent: 0,
    } as Contract;

    state.entities.contracts["c1"] = contract;
    state.entities.contractsByProjectId = { p1: ["c1"] };

    const impact = { removeContracts: ["malformed"] } as StateImpact;
    const result = applySingleImpact(state, impact);

    expect(result.entities.contracts["c1"]).toBeDefined();
    expect(result.entities.contractsByProjectId["p1"]).toContain("c1");
  });
});

// Characterization lock for the Bolt early-exit rewrite — pins
// handleFormatLicensed dedupe + append semantics. Green before AND after.
describe("FORMAT_LICENSED vault dedupe", () => {
  const asset = (id: string) =>
    ({ id, originalProjectId: "p0", title: `Asset ${id}`, baseValue: 100, decayRate: 0.1 }) as any;

  it("appends a novel asset to the vault", () => {
    const state = makeMockState();
    state.ip.vault = [asset("a1")];
    const result = applySingleImpact(state, {
      type: "FORMAT_LICENSED",
      payload: { asset: asset("a2") },
    } as StateImpact);
    expect(result.ip.vault.map((a: any) => a.id)).toEqual(["a1", "a2"]);
  });

  it("returns identical state when the asset id already exists", () => {
    const state = makeMockState();
    state.ip.vault = [asset("a1"), asset("a2")];
    const result = applySingleImpact(state, {
      type: "FORMAT_LICENSED",
      payload: { asset: asset("a2") },
    } as StateImpact);
    expect(result).toBe(state);
    expect(result.ip.vault).toHaveLength(2);
  });

  it("dedupes against any position in the vault (not just the tail)", () => {
    const state = makeMockState();
    state.ip.vault = [asset("a1"), asset("a2"), asset("a3")];
    const result = applySingleImpact(state, {
      type: "FORMAT_LICENSED",
      payload: { asset: asset("a1") },
    } as StateImpact);
    expect(result.ip.vault).toHaveLength(3);
  });
});
