import { describe, it, expect } from "vitest";
import { GameState, RivalStudio, Project } from "@/engine/types";
import { RandomGenerator } from "@/engine/utils/rng";
import { tickRivalProduction } from "@/engine/systems/rivals/rivalProduction";
import { createMockRival, createMockProject } from "@/test/utils/mockFactories";

function makeState(rivals: RivalStudio[]): GameState {
  const rivalMap: Record<string, RivalStudio> = {};
  for (const r of rivals) rivalMap[r.id] = r;
  return {
    week: 10,
    gameSeed: 12345,
    tickCount: 10,
    finance: { cash: 100_000_000, ledger: [], weeklyHistory: [], marketState: {} as any },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    entities: {
      projects: {},
      releasedProjectIds: [],
      talents: {},
      contracts: {},
      rivals: rivalMap,
    },
    studio: {
      id: "player",
      name: "Test Studio",
      archetype: "major",
      prestige: 50,
      internal: { projectHistory: [], projects: {}, contracts: [] },
    },
    market: {
      opportunities: [],
      trends: [],
      activeMarketEvents: [],
      buyers: [],
      marketingIntensity: 0,
    },
    industry: { families: [], agencies: [], agents: [], newsHistory: [] },
    culture: { genrePopularity: {} },
  } as unknown as GameState;
}

describe("tickRivalProduction", () => {
  it("spawns projects for rivals over time", () => {
    const rival = createMockRival({
      id: "r1",
      archetype: "major",
      cash: 500_000_000,
      strength: 80,
    });
    const state = makeState([rival]);
    const rng = new RandomGenerator(12345);

    // Run many weeks; rivals should accumulate owned projects.
    let current = state;
    for (let i = 0; i < 30; i++) {
      const impacts = tickRivalProduction(current, rng);
      // Apply PROJECT_CREATED impacts to a fresh state copy for the next iteration.
      const added = impacts.filter((im: any) => im.type === "PROJECT_CREATED");
      const nextProjects = { ...current.entities.projects };
      for (const im of added) {
        const p = (im.payload as any).project as Project;
        nextProjects[p.id] = p;
      }
      current = {
        ...current,
        entities: { ...current.entities, projects: nextProjects },
      };
    }

    const owned = Object.values(current.entities.projects).filter((p) => p.ownerId === "r1");
    expect(owned.length).toBeGreaterThan(0);
  });

  it("gates spawn rate by cash/strength", () => {
    const flush = createMockRival({
      id: "rich",
      archetype: "major",
      cash: 1_000_000_000,
      strength: 95,
    });
    const broke = createMockRival({
      id: "poor",
      archetype: "indie",
      cash: 1_000_000,
      strength: 20,
    });
    const state = makeState([flush, broke]);
    const rng = new RandomGenerator(777);

    let current = state;
    for (let i = 0; i < 20; i++) {
      const impacts = tickRivalProduction(current, rng);
      const added = impacts.filter((im: any) => im.type === "PROJECT_CREATED");
      const nextProjects = { ...current.entities.projects };
      for (const im of added) {
        const p = (im.payload as any).project as Project;
        nextProjects[p.id] = p;
      }
      current = { ...current, entities: { ...current.entities, projects: nextProjects } };
    }

    const richCount = Object.values(current.entities.projects).filter(
      (p) => p.ownerId === "rich"
    ).length;
    const poorCount = Object.values(current.entities.projects).filter(
      (p) => p.ownerId === "poor"
    ).length;
    expect(richCount).toBeGreaterThanOrEqual(poorCount);
  });

  it("tags spawned projects with ownerId and a valid budget tier", () => {
    const rival = createMockRival({
      id: "r1",
      archetype: "major",
      cash: 500_000_000,
      strength: 80,
    });
    const rng = new RandomGenerator(42);
    let current = makeState([rival]);
    let added: any[] = [];
    // Run a handful of weeks; a major rival should spawn within this window.
    for (let i = 0; i < 10 && added.length === 0; i++) {
      const impacts = tickRivalProduction(current, rng);
      added = impacts.filter((im: any) => im.type === "PROJECT_CREATED");
      const nextProjects = { ...current.entities.projects };
      for (const im of added) {
        const p = (im.payload as any).project as Project;
        nextProjects[p.id] = p;
      }
      current = { ...current, entities: { ...current.entities, projects: nextProjects } };
    }
    expect(added.length).toBeGreaterThan(0);
    const p = (added[0].payload as any).project as Project;
    expect(p.ownerId).toBe("r1");
    expect(["low", "mid", "high", "blockbuster"]).toContain(p.budgetTier);
  });

  it("is deterministic for a fixed seed", () => {
    const mk = () =>
      makeState([
        createMockRival({ id: "r1", archetype: "major", cash: 500_000_000, strength: 80 }),
      ]);
    const a = tickRivalProduction(mk(), new RandomGenerator(99));
    const b = tickRivalProduction(mk(), new RandomGenerator(99));
    expect(a.length).toBe(b.length);
  });

  it("returns empty impacts when there are no rivals", () => {
    const state = makeState([]);
    const impacts = tickRivalProduction(state, new RandomGenerator(1));
    expect(impacts.length).toBe(0);
  });

  it("spawns projects for mid-tier rivals", () => {
    const rival = createMockRival({
      id: "mid1",
      archetype: "mid-tier",
      cash: 500_000_000,
      strength: 80,
    });
    const state = makeState([rival]);
    const rng = new RandomGenerator(12345);

    let current = state;
    for (let i = 0; i < 30; i++) {
      const impacts = tickRivalProduction(current, rng);
      const added = impacts.filter((im: any) => im.type === "PROJECT_CREATED");
      const nextProjects = { ...current.entities.projects };
      for (const im of added) {
        const p = (im.payload as any).project as Project;
        nextProjects[p.id] = p;
      }
      current = {
        ...current,
        entities: { ...current.entities, projects: nextProjects },
      };
    }

    const owned = Object.values(current.entities.projects).filter(
      (p) => p.ownerId === "mid1"
    );
    expect(owned.length).toBeGreaterThan(0);
  });

  it("spawned projects have all required ProjectBase fields", () => {
    const rival = createMockRival({
      id: "r1",
      archetype: "major",
      cash: 500_000_000,
      strength: 80,
    });
    const rng = new RandomGenerator(42);
    let current = makeState([rival]);
    let added: any[] = [];
    for (let i = 0; i < 10 && added.length === 0; i++) {
      const impacts = tickRivalProduction(current, rng);
      added = impacts.filter((im: any) => im.type === "PROJECT_CREATED");
      const nextProjects = { ...current.entities.projects };
      for (const im of added) {
        const p = (im.payload as any).project as Project;
        nextProjects[p.id] = p;
      }
      current = { ...current, entities: { ...current.entities, projects: nextProjects } };
    }
    expect(added.length).toBeGreaterThan(0);

    const p = (added[0].payload as any).project as Project;
    expect(p.activeCrisis).toBeNull();
    expect(typeof p.momentum).toBe("number");
    expect(p.progress).toBe(0);
    expect(p.accumulatedCost).toBe(0);
    expect(Array.isArray((p as any).activeRoles)).toBe(true);
    expect(Array.isArray((p as any).scriptEvents)).toBe(true);
    expect(typeof (p as any).scriptHeat).toBe("number");
    if (p.type === "SERIES") {
      expect((p as any).tvDetails).toBeDefined();
      expect(typeof (p as any).tvDetails.currentSeason).toBe("number");
    }
  });

  it("advances rival projects through lifecycle: development → production → released", () => {
    const rival = createMockRival({
      id: "r1",
      archetype: "major",
      cash: 500_000_000,
      strength: 80,
    });
    const seedProject = createMockProject({
      id: "rival-r1-dev",
      ownerId: "r1",
      state: "development",
      developmentWeeks: 2,
      productionWeeks: 2,
      weeksInPhase: 0,
    });
    let state = makeState([rival]);
    state.entities.projects[seedProject.id] = seedProject;
    const rng = new RandomGenerator(999);

    // Week 1: still in development (weeksInPhase becomes 1, < 2)
    let impacts = tickRivalProduction(state, rng);
    let updates = impacts.filter((im: any) => im.type === "PROJECT_UPDATED");
    expect(updates.length).toBeGreaterThan(0);
    let updated = (updates[0].payload as any).update as Project;
    expect(updated.state).toBe("development");
    expect(updated.weeksInPhase).toBe(1);
    state = { ...state, entities: { ...state.entities, projects: { ...state.entities.projects, [updated.id]: updated } } };

    // Week 2: development complete → production
    impacts = tickRivalProduction(state, rng);
    updates = impacts.filter((im: any) => im.type === "PROJECT_UPDATED");
    updated = (updates[0].payload as any).update as Project;
    expect(updated.state).toBe("production");
    expect(updated.weeksInPhase).toBe(0);
    state = { ...state, entities: { ...state.entities, projects: { ...state.entities.projects, [updated.id]: updated } } };

    // Week 3: production week 1
    impacts = tickRivalProduction(state, rng);
    updates = impacts.filter((im: any) => im.type === "PROJECT_UPDATED");
    updated = (updates[0].payload as any).update as Project;
    expect(updated.state).toBe("production");
    expect(updated.weeksInPhase).toBe(1);
    state = { ...state, entities: { ...state.entities, projects: { ...state.entities.projects, [updated.id]: updated } } };

    // Week 4: production complete → released
    impacts = tickRivalProduction(state, rng);
    updates = impacts.filter((im: any) => im.type === "PROJECT_UPDATED");
    updated = (updates[0].payload as any).update as Project;
    expect(updated.state).toBe("released");
    expect((updated as any).boxOffice).toBeDefined();
  });

  it("does not spawn projects when rival cannot afford any tier", () => {
    const rival = createMockRival({
      id: "broke",
      archetype: "major",
      cash: 0,
      strength: 80,
    });
    const state = makeState([rival]);
    const rng = new RandomGenerator(12345);

    let created: any[] = [];
    for (let i = 0; i < 20; i++) {
      const impacts = tickRivalProduction(state, rng);
      created = impacts.filter((im: any) => im.type === "PROJECT_CREATED");
    }
    expect(created.length).toBe(0);
  });

  it("does not advance already-released rival projects", () => {
    const rival = createMockRival({
      id: "r1",
      archetype: "major",
      cash: 500_000_000,
      strength: 80,
    });
    const releasedProject = createMockProject({
      id: "rival-r1-rel",
      ownerId: "r1",
      state: "released",
      weeksInPhase: 5,
    });
    const state = makeState([rival]);
    state.entities.projects[releasedProject.id] = releasedProject;
    const rng = new RandomGenerator(999);

    const impacts = tickRivalProduction(state, rng);
    const updates = impacts.filter(
      (im: any) =>
        im.type === "PROJECT_UPDATED" &&
        (im.payload as any).projectId === "rival-r1-rel"
    );
    expect(updates.length).toBe(0);
  });
});
