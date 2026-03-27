import { describe, it, expect, beforeEach, vi } from "vitest";
import { useGameStore } from "../../store/gameStore";

Object.defineProperty(global, 'crypto', {
  value: { randomUUID: () => 'test-uuid' },
  writable: true
});

describe("projectSlice dictionary tests", () => {
  beforeEach(() => {
    useGameStore.getState().newGame("Test Studio", "major");
  });

  it("Stores projects as a Record", () => {
    const store = useGameStore.getState();
    const id = store.addProject({ title: "Test Project", status: "development" } as any);
    const state = useGameStore.getState();
    const projects = state.gameState?.studio.internal.projects;
    expect(projects).toBeDefined();
    expect(Array.isArray(projects)).toBe(false);
    expect(typeof projects).toBe("object");
    expect(Object.keys(projects || {}).length).toBeGreaterThan(0);
  });

  it("Updates in O(1) time without array mapping", () => {
    const store = useGameStore.getState();
    const id = store.addProject({ title: "Test Project 2", budget: 500 } as any);
    store.updateProject(id, { budget: 1000 } as any);
    const state = useGameStore.getState();
    expect(state.gameState?.studio.internal.projects[id].budget).toBe(1000);
  });

  it("ID Generation ownership", () => {
    const store = useGameStore.getState();
    const id = store.addProject({ title: "Test Project 3" } as any);
    expect(id).toBeDefined();
    expect(typeof id).toBe("string");
  });
});
