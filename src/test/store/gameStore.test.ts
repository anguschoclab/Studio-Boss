import { describe, it, expect, beforeEach, vi } from "vitest";
import { useGameStore } from "../../store/gameStore";
import * as saveLoad from "../../persistence/saveLoad";
import { createMockGameState, createMockTalent, createMockProject } from "../utils/mockFactories";

// Mock saveLoad
vi.mock("../../persistence/saveLoad", () => ({
  saveGame: vi.fn(),
  loadGame: vi.fn(async (slot) => {
    if (slot === 1) {
      const state = createMockGameState();
      state.studio.name = "Loaded Studio";
      return state;
    }
    return null;
  }),
  getSaveSlots: vi.fn(async () => [{ id: 1, name: 'Slot 1', date: '2026-03-31', week: 1, studio: 'Studio' }]),
}));

describe("gameStore", () => {
  beforeEach(() => {
    useGameStore.getState().clearGame();
    vi.clearAllMocks();
  });

  it("starts with null game state", () => {
    expect(useGameStore.getState().gameState).toBeNull();
  });

  it("creates a new game", async () => {
    await useGameStore.getState().newGame("My Studio", "major");
    const state = useGameStore.getState().gameState;
    expect(state).not.toBeNull();
    expect(state?.studio.name).toBe("My Studio");
    expect(saveLoad.saveGame).toHaveBeenCalledWith(0, state);
  });

  it("advances week", async () => {
    await useGameStore.getState().newGame("My Studio", "major");
    const state = useGameStore.getState().gameState!;
    useGameStore.setState({ gameState: state });

    const summary = await useGameStore.getState().doAdvanceWeek();
    expect(summary).not.toBeNull();
    expect(summary!.fromWeek).toBe(1);
    expect(useGameStore.getState().gameState?.week).toBe(2);
  });

  it("creates a project", async () => {
    await useGameStore.getState().newGame("My Studio", "major");
    useGameStore.getState().createProject({
      title: "Test Project",
      format: "film",
      genre: "Comedy",
      budgetTier: "low",
      targetAudience: "General",
      flavor: "Funny",
      attachedTalentIds: []
    });

    const state = useGameStore.getState().gameState;
    const projects = Object.values(state?.entities.projects || {});
    expect(projects).toHaveLength(1);
    expect(projects[0].title).toBe("Test Project");
  });

  it("loads from slot", async () => {
    const loaded = await useGameStore.getState().loadFromSlot(1);
    expect(loaded).toBe(true);
    expect(useGameStore.getState().gameState?.studio.name).toBe("Loaded Studio");
  });

  it("signs a contract if sufficient funds", async () => {
    await useGameStore.getState().newGame("My Studio", "major");
    const state = useGameStore.getState().gameState!;
    state.finance.cash = 1000000;
    
    const talent = createMockTalent({ id: "t1", name: "Star", role: "actor", roles: ["actor"], fee: 100000 });
    const project = createMockProject({ id: "p1", title: "Test", state: "development" });
    
    state.entities.talents = { "t1": talent };
    state.entities.projects = { "p1": project };
    useGameStore.setState({ gameState: state });

    useGameStore.getState().signContract("t1", "p1");

    const newState = useGameStore.getState().gameState!;
    const contracts = Object.values(newState.entities.contracts);
    expect(newState.finance.cash).toBe(900000); // 1M - 100k fee
    expect(contracts).toHaveLength(1);
    expect(contracts[0].talentId).toBe("t1");
  });
});
