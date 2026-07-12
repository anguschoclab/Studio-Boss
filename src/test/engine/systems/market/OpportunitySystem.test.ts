import { describe, it, expect } from "vitest";
import { GameState, StateImpact, Project, Contract } from "@/engine/types";
import { applySingleImpact } from "@/engine/core/impactHandlers";

function makeMockState(): GameState {
  return {
    week: 1,
    gameSeed: 1,
    tickCount: 0,
    projects: { active: [] },
    game: { currentWeek: 1 },
    finance: { cash: 10_000_000, ledger: [] },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    entities: {
      projects: {},
      talents: {},
      contracts: {},
      contractsByProjectId: {},
      rivals: {},
    },
    studio: {
      name: "Test Studio",
      id: "PLAYER",
      archetype: "major",
      prestige: 50,
      cash: 10_000_000,
      internal: { projects: {}, contracts: [] },
    },
    market: { opportunities: [], buyers: [] },
    industry: { rivals: [], families: [], agencies: [], agents: [], newsHistory: [] },
    culture: { genrePopularity: {} },
    history: [],
  } as unknown as GameState;
}

function makeProject(id: string): Project {
  return {
    id,
    title: `Project ${id}`,
    state: "development",
    budget: 5000000,
  } as Project;
}

function makeContract(id: string, projectId: string, talentId: string): Contract {
  return {
    id,
    projectId,
    talentId,
    fee: 100000,
    role: "actor",
    backendPercent: 0,
  } as Contract;
}

describe("OpportunitySystem impact processing", () => {
  it("bag impact with newContracts adds contracts to entities.contracts and contractsByProjectId", () => {
    const state = makeMockState();
    const contract = makeContract("c1", "p1", "t1");
    const impact = { newContracts: [contract] } as StateImpact;
    const result = applySingleImpact(state, impact);
    expect(result.entities.contracts["c1"]).toBeDefined();
    expect(result.entities.contractsByProjectId["p1"]).toContain("c1");
  });

  it("bag impact with newProjects adds projects to entities.projects", () => {
    const state = makeMockState();
    const project = makeProject("p1");
    const impact = { newProjects: [project] } as StateImpact;
    const result = applySingleImpact(state, impact);
    expect(result.entities.projects["p1"]).toBeDefined();
    expect(result.entities.projects["p1"].id).toBe("p1");
  });

  it("bag impact with both newContracts and newProjects processes both", () => {
    const state = makeMockState();
    const contract = makeContract("c1", "p1", "t1");
    const project = makeProject("p1");
    const impact = { newContracts: [contract], newProjects: [project] } as StateImpact;
    const result = applySingleImpact(state, impact);
    expect(result.entities.contracts["c1"]).toBeDefined();
    expect(result.entities.contractsByProjectId["p1"]).toContain("c1");
    expect(result.entities.projects["p1"]).toBeDefined();
  });
});
