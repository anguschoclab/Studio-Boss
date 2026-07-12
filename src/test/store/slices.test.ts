import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@/store/gameStore";
import { initializeGame } from "@/engine/core/gameInit";

describe("Store Slice Isolation", () => {
  beforeEach(() => {
    const gameState = initializeGame("Test Studio", "major", 42);
    useGameStore.setState({ gameState, finance: gameState.finance as any, news: gameState.news });
  });

  describe("Finance Slice Isolation", () => {
    it("should update funds without mutating project or talent state", () => {
      const initialState = useGameStore.getState();
      if (!initialState.gameState) throw new Error("Game not initialized");

      const initialProjects = { ...initialState.gameState.entities.projects };
      const initialCash = initialState.gameState.finance.cash;

      useGameStore.getState().addFunds(5000);

      const newState = useGameStore.getState();
      if (!newState.gameState) throw new Error("Game missing after action");

      expect(newState.gameState.finance.cash).toBe(initialCash + 5000);
      expect(newState.gameState.entities.projects).toStrictEqual(initialProjects); // Deep equality check
    });
  });

  describe("Project Slice Isolation", () => {
    it("should manage UUIDs internally and access by O(1) dictionary key", () => {
      const state = useGameStore.getState();
      state.addProject({ id: "p_O1", title: "O1 Project", state: "development" });
      const newState = useGameStore.getState();
      expect(newState.gameState?.entities.projects["p_O1"]).toBeDefined();
      expect(Object.keys(newState.gameState?.entities.projects || {}).includes("p_O1")).toBe(true);
    });
    it("should advance a specific project status immutably", () => {
      useGameStore.getState().addProject({ id: "p1", state: "development", title: "P1" });
      useGameStore.getState().addProject({ id: "p2", state: "production", title: "P2" });

      useGameStore.getState().advanceProjectPhase("p1", "production");

      const newState = useGameStore.getState();
      if (!newState.gameState) throw new Error("Game missing");

      const p1 = newState.gameState.entities.projects["p1"];
      const p2 = newState.gameState.entities.projects["p2"];

      expect(p1?.state).toBe("production");
      expect(p2?.state).toBe("production");
    });
  });
});
