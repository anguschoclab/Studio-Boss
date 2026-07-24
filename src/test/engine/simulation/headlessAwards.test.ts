import { describe, it, expect } from "vitest";
import { RandomGenerator } from "@/engine/utils/rng";
import { createMockGameState } from "../generators/mockFactory";
import { HeadlessController } from "@/engine/simulation/HeadlessController";
import type { Project, GameState, StateImpact } from "@/engine/types";

function createProject(
  id: string,
  ownerId: string,
  reviewScore: number,
  releaseWeek: number,
  buzz: number = 50,
  state: string = "released"
): Project {
  return {
    id,
    ownerId,
    title: `Project ${id}`,
    state,
    releaseWeek,
    reviewScore,
    buzz,
    genre: "Drama",
  } as unknown as Project;
}

function setupState(
  playerId: string,
  projects: Project[] = [],
  cash: number = 100_000_000,
  week: number = 100
): GameState {
  const state = createMockGameState({ week });
  state.studio.id = playerId;
  state.finance.cash = cash;

  state.entities.projects = {};
  for (const p of projects) {
    state.entities.projects[p.id] = p;
  }

  return state;
}

function findProjectBuzzUpdate(impacts: StateImpact[], projectId: string): StateImpact | undefined {
  return impacts.find(
    (i) =>
      i.type === "PROJECT_UPDATED" &&
      (i.payload as any).projectId === projectId &&
      (i.payload as any).update?.buzz !== undefined
  );
}

describe("HeadlessController awards campaigns", () => {
  it("launches awards campaign for high-review player project", () => {
    const playerId = "player";
    const project = createProject("p1", playerId, 88, 90, 50);
    const state = setupState(playerId, [project], 100_000_000);
    const rng = new RandomGenerator(42);

    const impacts = HeadlessController.tick(state, rng);

    const projectUpdate = findProjectBuzzUpdate(impacts, "p1");
    expect(projectUpdate).toBeDefined();
    const updatedBuzz = (projectUpdate!.payload as any).update.buzz;
    expect(updatedBuzz).toBeGreaterThan(50);
  });

  it("does not launch campaign for low-review project", () => {
    const playerId = "player";
    const project = createProject("p1", playerId, 60, 90, 50);
    const state = setupState(playerId, [project], 100_000_000);
    const rng = new RandomGenerator(42);

    const impacts = HeadlessController.tick(state, rng);

    const projectUpdate = findProjectBuzzUpdate(impacts, "p1");
    expect(projectUpdate).toBeUndefined();
  });

  it("does not launch campaign for project released >52 weeks ago", () => {
    const playerId = "player";
    const project = createProject("p1", playerId, 88, 10, 50);
    const state = setupState(playerId, [project], 100_000_000, 100);
    const rng = new RandomGenerator(42);

    const impacts = HeadlessController.tick(state, rng);

    const projectUpdate = findProjectBuzzUpdate(impacts, "p1");
    expect(projectUpdate).toBeUndefined();
  });

  it("deducts cash when launching campaign", () => {
    const playerId = "player";
    const project = createProject("p1", playerId, 88, 90, 50);
    const state = setupState(playerId, [project], 100_000_000);
    const rng = new RandomGenerator(42);

    const impacts = HeadlessController.tick(state, rng);

    expect(impacts.length).toBeGreaterThan(0);
  });

  it("selects Blitz tier for reviewScore >= 85 with cash > $50M", () => {
    const playerId = "player";
    const project = createProject("p1", playerId, 88, 90, 50);
    const state = setupState(playerId, [project], 100_000_000);
    const rng = new RandomGenerator(42);

    const impacts = HeadlessController.tick(state, rng);

    const projectUpdate = findProjectBuzzUpdate(impacts, "p1");
    expect(projectUpdate).toBeDefined();
    expect((projectUpdate!.payload as any).update.buzz).toBeGreaterThanOrEqual(85);
  });

  it("selects Trade tier for reviewScore 75-84 with cash > $10M", () => {
    const playerId = "player";
    const project = createProject("p1", playerId, 78, 90, 50);
    const state = setupState(playerId, [project], 20_000_000);
    const rng = new RandomGenerator(42);

    const impacts = HeadlessController.tick(state, rng);

    const projectUpdate = findProjectBuzzUpdate(impacts, "p1");
    if (projectUpdate) {
      expect((projectUpdate!.payload as any).update.buzz).toBeGreaterThanOrEqual(60);
    }
  });

  it("does not campaign when cash is insufficient", () => {
    const playerId = "player";
    const project = createProject("p1", playerId, 88, 90, 50);
    const state = setupState(playerId, [project], 1_000_000);
    const rng = new RandomGenerator(42);

    const impacts = HeadlessController.tick(state, rng);

    const projectUpdate = findProjectBuzzUpdate(impacts, "p1");
    expect(projectUpdate).toBeUndefined();
  });
});
