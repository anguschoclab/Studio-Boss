import { describe, it, expect, beforeEach, vi, mock } from "vitest";
import { useGameStore } from "../../store/gameStore";
import { GameState } from "../../engine/types";
import { saveGame, loadGame, getSaveSlots } from "../../persistence/saveLoad";
import { initializeGame } from "../../engine/core/gameInit";

// Mock saveLoad
mock.module("../../persistence/saveLoad", () => ({
  saveGame: vi.fn(),
  loadGame: vi.fn((slot) => {
    if (slot === 1) return { studio: { name: "Loaded Studio" } };
    return null;
  }),
  getSaveSlots: vi.fn(() => [{ exists: true }]),
}));

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid'
  }
});

describe("gameStore", () => {
  beforeEach(() => {
    useGameStore.getState().clearGame();
    vi.clearAllMocks();
  });

  it("starts with null game state", () => {
    expect(useGameStore.getState().gameState).toBeNull();
  });

  it("creates a new game", () => {
    useGameStore.getState().newGame("My Studio", "major");
    const state = useGameStore.getState().gameState;
    expect(state).not.toBeNull();
    expect(state?.studio.name).toBe("My Studio");
    expect(saveGame).toHaveBeenCalledWith(0, state);
  });

  it("advances week", () => {
    useGameStore.getState().newGame("My Studio", "major");
    // Ensure the necessary arrays are present
    const state = useGameStore.getState().gameState!;
    state.contracts = [];
    state.talentPool = [];
    state.awards = [];
    useGameStore.setState({ gameState: state });

    const summary = useGameStore.getState().doAdvanceWeek();
    expect(summary.fromWeek).toBe(1);
    expect(useGameStore.getState().gameState?.week).toBe(2);
    expect(saveGame).toHaveBeenCalledTimes(2); // once in newGame, once in advanceWeek
  });

  it("throws when advancing without game state", () => {
    expect(() => useGameStore.getState().doAdvanceWeek()).toThrowError("No game in progress");
  });

  it("creates a project", () => {
    useGameStore.getState().newGame("My Studio", "major");
    useGameStore.getState().createProject({
      title: "Test Project",
      format: "Film",
      genre: "Comedy",
      budgetTier: "low",
      targetAudience: "All",
      flavor: "Funny"
    });

    const state = useGameStore.getState().gameState;
    expect(state?.projects).toHaveLength(1);
    expect(state?.projects[0].title).toBe("Test Project");
  });

  it("handles creating project when no game state exists", () => {
    useGameStore.getState().createProject({
      title: "Test Project",
      format: "Film",
      genre: "Comedy",
      budgetTier: "low",
      targetAudience: "All",
      flavor: "Funny"
    });
    expect(useGameStore.getState().gameState).toBeNull();
  });

  it("saves to slot", () => {
    useGameStore.getState().newGame("My Studio", "major");
    useGameStore.getState().saveToSlot(1);
    expect(saveGame).toHaveBeenCalledWith(1, useGameStore.getState().gameState);
  });

  it("loads from slot", () => {
    const loaded = useGameStore.getState().loadFromSlot(1);
    expect(loaded).toBe(true);
    expect(useGameStore.getState().gameState?.studio.name).toBe("Loaded Studio");

    const notLoaded = useGameStore.getState().loadFromSlot(0);
    expect(notLoaded).toBe(false);
  });

  it("retrieves save slots", () => {
    const slots = useGameStore.getState().getSaveSlots();
    expect(slots).toHaveLength(1);
  });

  it("signs a contract if sufficient funds", () => {
    useGameStore.getState().newGame("My Studio", "major");

    // Setup state for contract signing
    const state = useGameStore.getState().gameState!;
    state.cash = 1000;
    state.contracts = [];
    state.talentPool = [
      { id: "t1", name: "Star", role: "actor", skill: 90, prestige: 85, draw: 80, fee: 500, projects: [], history: [] }
    ];
    useGameStore.setState({ gameState: state });

    useGameStore.getState().signContract("t1", "p1");

    const newState = useGameStore.getState().gameState!;
    expect(newState.cash).toBe(500);
    expect(newState.contracts).toHaveLength(1);
    expect(newState.contracts[0].talentId).toBe("t1");
    expect(newState.contracts[0].backendPercent).toBe(10);
  });

  it("fails to sign contract if insufficient funds", () => {
    useGameStore.getState().newGame("My Studio", "major");

    // Setup state for contract signing
    const state = useGameStore.getState().gameState!;
    state.cash = 100; // Not enough for fee of 500
    state.contracts = [];
    state.talentPool = [
      { id: "t1", name: "Star", role: "actor", skill: 90, prestige: 85, draw: 80, fee: 500, projects: [], history: [] }
    ];
    useGameStore.setState({ gameState: state });

    useGameStore.getState().signContract("t1", "p1");

    const newState = useGameStore.getState().gameState!;
    expect(newState.cash).toBe(100);
    expect(newState.contracts).toHaveLength(0);
  });
});
