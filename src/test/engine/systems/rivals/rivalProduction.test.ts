import { describe, it, expect } from "vitest";
import { GameState, RivalStudio, Project } from "@/engine/types";
import { RandomGenerator } from "@/engine/utils/rng";
import { tickRivalProduction } from "@/engine/systems/rivals/rivalProduction";
import { createMockRival } from "@/test/utils/mockFactories";

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
      // Apply PROJECT_ADDED impacts to a fresh state copy for the next iteration.
      const added = impacts.filter((im: any) => im.type === "PROJECT_ADDED");
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
      const added = impacts.filter((im: any) => im.type === "PROJECT_ADDED");
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
      added = impacts.filter((im: any) => im.type === "PROJECT_ADDED");
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
});
