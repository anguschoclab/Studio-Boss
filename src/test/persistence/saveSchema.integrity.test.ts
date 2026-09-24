import { describe, it, expect } from "vitest";
import { validateSaveData } from "../../persistence/saveSchema";
import { initializeGame } from "../../engine/core/gameInit";

/**
 * Referential-integrity + load-bearing field validation for saves.
 * RED at authoring time: current schema only validates structure.
 */

function makeProject(id: string) {
  return {
    id,
    title: "Test Project",
    type: "FILM",
    state: "development",
    ownerId: "player",
  };
}

function makeContract(projectId: string, talentId: string) {
  return {
    id: `ct-${projectId}-${talentId}`,
    talentId,
    projectId,
    studioId: "player",
    fee: 1000,
    backendPercent: 0,
    startDate: 1,
    endDate: 10,
    weeklyOverhead: 0,
    exclusivity: false,
    status: "active",
    type: "cast",
  };
}

describe("saveSchema integrity", () => {
  const validState = initializeGame("Integrity Test", "major");

  it("accepts the initializeGame fixture", () => {
    expect(validateSaveData(validState).success).toBe(true);
  });

  it("accepts empty entity maps (new-game boundary)", () => {
    const state = {
      ...validState,
      entities: {
        ...validState.entities,
        talents: {},
        contracts: {},
        rivals: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    };
    expect(validateSaveData(state).success).toBe(true);
  });

  it("rejects an entity missing required fields (project without state)", () => {
    const project = makeProject("p1");
    const broken = { ...project };
    delete (broken as Record<string, unknown>).state;
    const state = {
      ...validState,
      entities: {
        ...validState.entities,
        projects: { ...validState.entities.projects, [project.id]: broken },
      },
    };
    const result = validateSaveData(state);
    expect(result.success).toBe(false);
  });

  it("rejects a contract with a dangling projectId", () => {
    const contract = makeContract("ghost-project", "ghost-talent");
    const state = {
      ...validState,
      entities: {
        ...validState.entities,
        contracts: { ...validState.entities.contracts, [contract.id]: contract },
      },
    };
    const result = validateSaveData(state);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toContain(contract.id);
  });

  it("rejects a contract with a dangling talentId", () => {
    const project = makeProject("p1");
    const contract = makeContract(project.id, "ghost-talent");
    const state = {
      ...validState,
      entities: {
        ...validState.entities,
        projects: { ...validState.entities.projects, [project.id]: project },
        contracts: { ...validState.entities.contracts, [contract.id]: contract },
      },
    };
    expect(validateSaveData(state).success).toBe(false);
  });

  it("rejects ghost ids in contractsByProjectId index", () => {
    const project = makeProject("p1");
    const state = {
      ...validState,
      entities: {
        ...validState.entities,
        projects: { ...validState.entities.projects, [project.id]: project },
        contractsByProjectId: {
          ...validState.entities.contractsByProjectId,
          [project.id]: ["ghost-contract-id"],
        },
      },
    };
    expect(validateSaveData(state).success).toBe(false);
  });

  it("rejects releasedProjectIds referencing missing projects", () => {
    const state = {
      ...validState,
      entities: {
        ...validState.entities,
        releasedProjectIds: ["never-existed"],
      },
    };
    expect(validateSaveData(state).success).toBe(false);
  });

  it("rejects studio.internal.projects referencing missing entities.projects keys", () => {
    const state = {
      ...validState,
      studio: {
        ...validState.studio,
        internal: {
          ...validState.studio.internal,
          projects: { "ghost-proj": { id: "ghost-proj", title: "G", type: "FILM", state: "development" } },
        },
      },
    };
    expect(validateSaveData(state).success).toBe(false);
  });

  it("rejects record key / entity.id mismatch", () => {
    const talent = Object.values(validState.entities.talents)[0];
    const state = {
      ...validState,
      entities: {
        ...validState.entities,
        talents: { ...validState.entities.talents, wrongKey: { ...talent, id: "real-id" } },
      },
    };
    expect(validateSaveData(state).success).toBe(false);
  });

  it("rejects NaN week", () => {
    expect(validateSaveData({ ...validState, week: NaN }).success).toBe(false);
  });

  it("rejects Infinity tickCount", () => {
    expect(validateSaveData({ ...validState, tickCount: Infinity }).success).toBe(false);
  });

  it("rejects a project record entry missing id", () => {
    const project = makeProject("p1");
    const broken = { ...project };
    delete (broken as Record<string, unknown>).id;
    const state = {
      ...validState,
      entities: {
        ...validState.entities,
        projects: { ...validState.entities.projects, ghost: broken },
      },
    };
    expect(validateSaveData(state).success).toBe(false);
  });
});

describe("saveSchema load-bearing fields", () => {
  const validState = initializeGame("Load-Bearing Test", "major");

  const withProject = (patch: Record<string, unknown>) => ({
    ...validState,
    entities: {
      ...validState.entities,
      projects: {
        ...validState.entities.projects,
        pBad: { ...makeProject("pBad"), ...patch },
      },
    },
  });

  it("rejects a project with an unknown type", () => {
    expect(validateSaveData(withProject({ type: "VIDEO_GAME" })).success).toBe(false);
  });

  it("rejects a project with an unknown lifecycle state", () => {
    expect(validateSaveData(withProject({ state: "limbo" })).success).toBe(false);
  });

  it("rejects a project missing title", () => {
    expect(validateSaveData(withProject({ title: undefined })).success).toBe(false);
  });

  it("rejects a talent missing name", () => {
    const talent = { ...Object.values(validState.entities.talents)[0] };
    delete (talent as Record<string, unknown>).name;
    const state = {
      ...validState,
      entities: {
        ...validState.entities,
        talents: { ...validState.entities.talents, [talent.id]: talent },
      },
    };
    expect(validateSaveData(state).success).toBe(false);
  });

  it("rejects a talent with an unknown tier", () => {
    const talent = { ...Object.values(validState.entities.talents)[0], tier: "Z_LIST" };
    const state = {
      ...validState,
      entities: {
        ...validState.entities,
        talents: { ...validState.entities.talents, [talent.id]: talent },
      },
    };
    expect(validateSaveData(state).success).toBe(false);
  });

  it("rejects a contract missing projectId", () => {
    const contract = { ...makeContract("p1", "t1") };
    delete (contract as Record<string, unknown>).projectId;
    const state = {
      ...validState,
      entities: {
        ...validState.entities,
        contracts: { ...validState.entities.contracts, [contract.id]: contract },
      },
    };
    expect(validateSaveData(state).success).toBe(false);
  });

  it("rejects a contract with a non-numeric fee", () => {
    const contract = { ...makeContract("p1", "t1"), fee: "a lot" };
    const state = {
      ...validState,
      entities: {
        ...validState.entities,
        contracts: { ...validState.entities.contracts, [contract.id]: contract },
      },
    };
    expect(validateSaveData(state).success).toBe(false);
  });

  it("rejects a rival missing cash", () => {
    const rival = { ...Object.values(validState.entities.rivals)[0] };
    delete (rival as Record<string, unknown>).cash;
    const state = {
      ...validState,
      entities: {
        ...validState.entities,
        rivals: { ...validState.entities.rivals, [rival.id]: rival },
      },
    };
    expect(validateSaveData(state).success).toBe(false);
  });

  it("rejects a rival with an unknown archetype", () => {
    const rival = { ...Object.values(validState.entities.rivals)[0], archetype: "megacorp" };
    const state = {
      ...validState,
      entities: {
        ...validState.entities,
        rivals: { ...validState.entities.rivals, [rival.id]: rival },
      },
    };
    expect(validateSaveData(state).success).toBe(false);
  });
});
