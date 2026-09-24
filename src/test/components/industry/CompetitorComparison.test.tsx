import {describe, it, expect} from "vitest";
import {computeRadarMetrics} from "@/components/industry/competitorMetrics";
import {GameState, RivalStudio} from "@/engine/types";

const makeState = (overrides: Partial<GameState> = {}): GameState =>
  ({
    week: 10,
    finance: { cash: 100_000_000 },
    studio: { id: "player-studio", name: "Test Studio", prestige: 60 },
    entities: {
      projects: {},
      releasedProjectIds: [],
      talents: {},
      contracts: {},
      rivals: {},
      contractsByProjectId: {},
      contractsByTalentId: {},
    },
    ...overrides,
  }) as GameState;

const makeRival = (overrides: Partial<RivalStudio> = {}): RivalStudio =>
  ({
    id: "r1",
    name: "Rival One",
    cash: 50_000_000,
    prestige: 40,
    strength: 70,
    projects: {},
    ...overrides,
  }) as RivalStudio;

const projectsMetric = (metrics: { metric: string; player: number; avgRival: number }[]) =>
  metrics.find((m) => m.metric === "Projects")!;

describe("computeRadarMetrics", () => {
  it("attributes entity-store projects to the correct studio", () => {
    const state = makeState();
    state.entities.projects = {
      p1: { id: "p1" } as any, // unowned → player
      p2: { id: "p2", ownerId: "player-studio" } as any, // player
      p3: { id: "p3", ownerId: "r1" } as any, // rival-owned entity project
    };
    const rival = makeRival({ id: "r1", projects: { rp1: { id: "rp1" } as any } });

    const metric = projectsMetric(computeRadarMetrics(state, state.studio, [rival]));

    // player: 2 projects / max(2, 2) = 100
    expect(metric.player).toBe(100);
    // avgRival: (rp1 + p3) = 2 projects / 1 rival / max 2 = 100
    expect(metric.avgRival).toBe(100);
  });

  it("excludes rival-owned entity projects from the player count", () => {
    const state = makeState();
    state.entities.projects = {
      p1: { id: "p1" } as any, // only player project
      p2: { id: "p2", ownerId: "r1" } as any,
      p3: { id: "p3", ownerId: "r1" } as any,
      p4: { id: "p4", ownerId: "r1" } as any,
    };
    const rival = makeRival({ id: "r1" });

    const metric = projectsMetric(computeRadarMetrics(state, state.studio, [rival]));

    // maxProjects = 3 (rival has 3 entity projects); player = 1/3
    expect(metric.player).toBeCloseTo((1 / 3) * 100, 5);
    // avgRival = 3/1/3 = 100
    expect(metric.avgRival).toBe(100);
  });

  it("returns 0 (not NaN) for the Projects metric when nobody has projects", () => {
    const state = makeState();
    const rival = makeRival();

    const metric = projectsMetric(computeRadarMetrics(state, state.studio, [rival]));

    expect(metric.player).toBe(0);
    expect(metric.avgRival).toBe(0);
    expect(Number.isNaN(metric.player)).toBe(false);
    expect(Number.isNaN(metric.avgRival)).toBe(false);
  });

  it("still computes Cash and Prestige metrics", () => {
    const state = makeState();
    const rival = makeRival({ cash: 50_000_000, prestige: 40 });

    const metrics = computeRadarMetrics(state, state.studio, [rival]);
    const cash = metrics.find((m) => m.metric === "Cash")!;
    const prestige = metrics.find((m) => m.metric === "Prestige")!;

    // maxCash = 100M → player 100, avgRival 50
    expect(cash.player).toBe(100);
    expect(cash.avgRival).toBe(50);
    expect(prestige.player).toBe(60);
    expect(prestige.avgRival).toBe(40);
  });
});
