import { describe, it, expect } from "vitest";
import { tickProductionEnhancementSystem } from "@/engine/systems/talent/ProductionEnhancementSystem";
import { RandomGenerator } from "@/engine/utils/rng";
import {
  createMockGameState,
  createMockTalent,
  createMockProject,
  createMockContract,
} from "../../generators/mockFactory";
import { Project } from "@/engine/types";

function makeProject(overrides: Partial<Project> = {}): Project {
  return createMockProject({
    type: "FILM" as any,
    budget: 60_000_000,
    ...overrides,
  } as any);
}

describe("tickProductionEnhancementSystem", () => {
  // ── Screenplay Notes ──

  it("generates screenplay notes for a development-phase project with attached talent", () => {
    const talent1 = createMockTalent({ id: "TAL-1", name: "Alice", prestige: 80 });
    const talent2 = createMockTalent({ id: "TAL-2", name: "Bob", prestige: 60 });
    const project = makeProject({ id: "PRJ-1", state: "development" });
    const contract1 = createMockContract({ id: "CON-1", talentId: "TAL-1", projectId: "PRJ-1" });
    const contract2 = createMockContract({ id: "CON-2", talentId: "TAL-2", projectId: "PRJ-1" });

    const state = createMockGameState({
      entities: {
        projects: { "PRJ-1": project },
        releasedProjectIds: [],
        talents: { "TAL-1": talent1, "TAL-2": talent2 },
        contracts: { "CON-1": contract1, "CON-2": contract2 },
        contractsByProjectId: { "PRJ-1": ["CON-1", "CON-2"] },
        rivals: {},
      },
    });

    // Use a seed that produces at least one note (15% chance per talent)
    // Try multiple seeds to find one that generates notes
    let notes: any[] = [];
    for (let seed = 1; seed <= 200 && notes.length === 0; seed++) {
      const rng = new RandomGenerator(seed);
      const impacts = tickProductionEnhancementSystem(state, rng);
      notes = impacts.filter((i: any) => i.type === "SCREENPLAY_NOTE_CREATED");
    }

    expect(notes.length).toBeGreaterThan(0);
    for (const impact of notes) {
      const note = impact.payload.note;
      expect(note.projectId).toBe("PRJ-1");
      expect(note.authorId).toMatch(/^TAL-[12]$/);
      expect(note.implemented).toBe(false);
    }
  });

  it("does not generate screenplay notes when no talent is attached", () => {
    const project = makeProject({ id: "PRJ-1", state: "development" });
    const state = createMockGameState({
      entities: {
        projects: { "PRJ-1": project },
        releasedProjectIds: [],
        talents: {},
        contracts: {},
        rivals: {},
      },
    });

    const rng = new RandomGenerator(42);
    const impacts = tickProductionEnhancementSystem(state, rng);
    const notes = impacts.filter((i: any) => i.type === "SCREENPLAY_NOTE_CREATED");
    expect(notes).toHaveLength(0);
  });

  it("does not generate screenplay notes for a production-state project", () => {
    const talent = createMockTalent({ id: "TAL-1", prestige: 80 });
    const project = makeProject({ id: "PRJ-1", state: "production" });
    const contract = createMockContract({ id: "CON-1", talentId: "TAL-1", projectId: "PRJ-1" });

    const state = createMockGameState({
      entities: {
        projects: { "PRJ-1": project },
        releasedProjectIds: [],
        talents: { "TAL-1": talent },
        contracts: { "CON-1": contract },
        contractsByProjectId: { "PRJ-1": ["CON-1"] },
        rivals: {},
      },
    });

    const rng = new RandomGenerator(42);
    const impacts = tickProductionEnhancementSystem(state, rng);
    const notes = impacts.filter((i: any) => i.type === "SCREENPLAY_NOTE_CREATED");
    expect(notes).toHaveLength(0);
  });

  it("does not generate screenplay notes for a released project", () => {
    const talent = createMockTalent({ id: "TAL-1", prestige: 80 });
    const project = makeProject({ id: "PRJ-1", state: "released" });
    const contract = createMockContract({ id: "CON-1", talentId: "TAL-1", projectId: "PRJ-1" });

    const state = createMockGameState({
      entities: {
        projects: { "PRJ-1": project },
        releasedProjectIds: ["PRJ-1"],
        talents: { "TAL-1": talent },
        contracts: { "CON-1": contract },
        contractsByProjectId: { "PRJ-1": ["CON-1"] },
        rivals: {},
      },
    });

    const rng = new RandomGenerator(42);
    const impacts = tickProductionEnhancementSystem(state, rng);
    const notes = impacts.filter((i: any) => i.type === "SCREENPLAY_NOTE_CREATED");
    expect(notes).toHaveLength(0);
  });

  // ── Production Additions ──

  it("may generate production additions for a production-state project", () => {
    const project = makeProject({ id: "PRJ-1", state: "production" });

    const state = createMockGameState({
      entities: {
        projects: { "PRJ-1": project },
        releasedProjectIds: [],
        talents: {},
        contracts: {},
        rivals: {},
      },
    });

    // 10% chance per tick — try multiple seeds
    let additions: any[] = [];
    for (let seed = 1; seed <= 200 && additions.length === 0; seed++) {
      const rng = new RandomGenerator(seed);
      const impacts = tickProductionEnhancementSystem(state, rng);
      additions = impacts.filter((i: any) => i.type === "PRODUCTION_ADDITION_CREATED");
    }

    expect(additions.length).toBeGreaterThan(0);
    for (const impact of additions) {
      expect(impact.payload.addition.projectId).toBe("PRJ-1");
    }
  });

  it("does not generate production additions for a development-state project", () => {
    const project = makeProject({ id: "PRJ-1", state: "development" });

    const state = createMockGameState({
      entities: {
        projects: { "PRJ-1": project },
        releasedProjectIds: [],
        talents: {},
        contracts: {},
        rivals: {},
      },
    });

    const rng = new RandomGenerator(42);
    const impacts = tickProductionEnhancementSystem(state, rng);
    const additions = impacts.filter((i: any) => i.type === "PRODUCTION_ADDITION_CREATED");
    expect(additions).toHaveLength(0);
  });

  // ── Credit Scenes ──

  it("may generate credit scenes for a high-budget FILM in production", () => {
    const project = makeProject({
      id: "PRJ-1",
      state: "production",
      type: "FILM" as any,
      budget: 80_000_000,
    });

    const state = createMockGameState({
      entities: {
        projects: { "PRJ-1": project },
        releasedProjectIds: [],
        talents: {},
        contracts: {},
        rivals: {},
      },
    });

    // 40% chance per tick — try multiple seeds
    let scenes: any[] = [];
    for (let seed = 1; seed <= 200 && scenes.length === 0; seed++) {
      const rng = new RandomGenerator(seed);
      const impacts = tickProductionEnhancementSystem(state, rng);
      scenes = impacts.filter((i: any) => i.type === "CREDIT_SCENE_CREATED");
    }

    expect(scenes.length).toBeGreaterThan(0);
    for (const impact of scenes) {
      expect(impact.payload.scene.projectId).toBe("PRJ-1");
    }
  });

  it("does not generate credit scenes for a SERIES project", () => {
    const project = makeProject({
      id: "PRJ-1",
      state: "production",
      type: "SERIES" as any,
      budget: 80_000_000,
    });

    const state = createMockGameState({
      entities: {
        projects: { "PRJ-1": project },
        releasedProjectIds: [],
        talents: {},
        contracts: {},
        rivals: {},
      },
    });

    const rng = new RandomGenerator(42);
    const impacts = tickProductionEnhancementSystem(state, rng);
    const scenes = impacts.filter((i: any) => i.type === "CREDIT_SCENE_CREATED");
    expect(scenes).toHaveLength(0);
  });

  it("does not generate credit scenes for a low-budget FILM", () => {
    const project = makeProject({
      id: "PRJ-1",
      state: "production",
      type: "FILM" as any,
      budget: 40_000_000,
    });

    const state = createMockGameState({
      entities: {
        projects: { "PRJ-1": project },
        releasedProjectIds: [],
        talents: {},
        contracts: {},
        rivals: {},
      },
    });

    const rng = new RandomGenerator(42);
    const impacts = tickProductionEnhancementSystem(state, rng);
    const scenes = impacts.filter((i: any) => i.type === "CREDIT_SCENE_CREATED");
    expect(scenes).toHaveLength(0);
  });

  // ── Contract Isolation ──

  it("isolates contracts between projects", () => {
    const talentA = createMockTalent({ id: "TAL-A", name: "Talent A", prestige: 80 });
    const talentB = createMockTalent({ id: "TAL-B", name: "Talent B", prestige: 80 });
    const projectA = makeProject({ id: "PRJ-A", state: "development" });
    const projectB = makeProject({ id: "PRJ-B", state: "development" });
    const contractA = createMockContract({ id: "CON-A", talentId: "TAL-A", projectId: "PRJ-A" });
    const contractB = createMockContract({ id: "CON-B", talentId: "TAL-B", projectId: "PRJ-B" });

    const state = createMockGameState({
      entities: {
        projects: { "PRJ-A": projectA, "PRJ-B": projectB },
        releasedProjectIds: [],
        talents: { "TAL-A": talentA, "TAL-B": talentB },
        contracts: { "CON-A": contractA, "CON-B": contractB },
        contractsByProjectId: { "PRJ-A": ["CON-A"], "PRJ-B": ["CON-B"] },
        rivals: {},
      },
    });

    // Find a seed that generates notes for both projects
    let notesA: any[] = [];
    let notesB: any[] = [];
    for (let seed = 1; seed <= 500 && (notesA.length === 0 || notesB.length === 0); seed++) {
      const rng = new RandomGenerator(seed);
      const impacts = tickProductionEnhancementSystem(state, rng);
      notesA = impacts.filter(
        (i: any) => i.type === "SCREENPLAY_NOTE_CREATED" && i.payload.note.projectId === "PRJ-A"
      );
      notesB = impacts.filter(
        (i: any) => i.type === "SCREENPLAY_NOTE_CREATED" && i.payload.note.projectId === "PRJ-B"
      );
    }

    // If we found notes, verify isolation
    for (const impact of notesA) {
      expect(impact.payload.note.authorId).toBe("TAL-A");
    }
    for (const impact of notesB) {
      expect(impact.payload.note.authorId).toBe("TAL-B");
    }
  });

  // ── Edge Cases ──

  it("returns no impacts when there are no projects", () => {
    const state = createMockGameState({
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: {},
        contracts: {},
        rivals: {},
      },
    });

    const rng = new RandomGenerator(42);
    const impacts = tickProductionEnhancementSystem(state, rng);
    expect(impacts).toHaveLength(0);
  });

  it("does not generate screenplay notes when contracts is empty", () => {
    const project = makeProject({ id: "PRJ-1", state: "development" });
    const state = createMockGameState({
      entities: {
        projects: { "PRJ-1": project },
        releasedProjectIds: [],
        talents: { "TAL-1": createMockTalent({ id: "TAL-1" }) },
        contracts: {},
        rivals: {},
      },
    });

    const rng = new RandomGenerator(42);
    const impacts = tickProductionEnhancementSystem(state, rng);
    const notes = impacts.filter((i: any) => i.type === "SCREENPLAY_NOTE_CREATED");
    expect(notes).toHaveLength(0);
  });
});
