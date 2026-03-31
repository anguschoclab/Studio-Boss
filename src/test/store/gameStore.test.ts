import { describe, it, expect, beforeEach, vi } from "vitest";
import { useGameStore } from "../../store/gameStore";
import * as saveLoad from "../../persistence/saveLoad";
import { Talent, Project } from "../../engine/types";

// Mock saveLoad
vi.mock("../../persistence/saveLoad", () => ({
  saveGame: vi.fn(),
  loadGame: vi.fn((slot) => {
    if (slot === 1) return { week: 1, 
      game: { currentWeek: 1 },
      finance: { cash: 0, ledger: [] },
      news: { headlines: [] },
      projects: { active: [] },
      studio: { name: "Loaded Studio", internal: { projects: {}, contracts: [] } }, industry: { talentPool: {} } };
    return null;
  }),
  getSaveSlots: vi.fn(() => [{ exists: true }]),
}));

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
    expect(saveLoad.saveGame).toHaveBeenCalledWith(0, state);
  });

  it("advances week", () => {
    useGameStore.getState().newGame("My Studio", "major");
    const state = useGameStore.getState().gameState!;
    // Ensure the necessary structures are present
    state.studio.internal.contracts = [];
    state.industry.talentPool = {};
    useGameStore.setState({ gameState: state });

    const summary = useGameStore.getState().doAdvanceWeek();
    expect(summary.fromWeek).toBe(1);
    expect(useGameStore.getState().gameState?.week).toBe(2);
  });

  it("creates a project", () => {
    useGameStore.getState().newGame("My Studio", "major");
    useGameStore.getState().createProject({
      title: "Test Project",
      format: "film",
      genre: "Comedy",
      budgetTier: "low",
      targetAudience: "General",
      flavor: "Funny"
    });

    const state = useGameStore.getState().gameState;
    const projects = Object.values(state?.studio.internal.projects || {});
    expect(projects).toHaveLength(1);
    expect(projects[0].title).toBe("Test Project");
  });

  it("loads from slot", () => {
    const loaded = useGameStore.getState().loadFromSlot(1);
    expect(loaded).toBe(true);
    expect(useGameStore.getState().gameState?.studio.name).toBe("Loaded Studio");
  });

  it("signs a contract if sufficient funds", () => {
    useGameStore.getState().newGame("My Studio", "major");
    const state = useGameStore.getState().gameState!;
    state.finance.cash = 1000000;
    state.industry.talentPool = {
      "t1": { 
          id: "t1", name: "Star", roles: ["actor"], prestige: 85, draw: 80, fee: 100000, accessLevel: "outsider", temperament: "normal",
          age: 30, gender: "male", ethnicity: "white", nationality: "USA", traits: [], stats: { acting: 80, directing: 0 }, workHistory: []
      } as any
    };
    state.studio.internal.projects = {
      "p1": { 
        id: "p1", title: "Test", format: "film", genre: "Action", budgetTier: "low", budget: 500000, weeklyCost: 10000,
        targetAudience: "General", flavor: "", state: "development", weeksInPhase: 0, productionWeeks: 10, developmentWeeks: 10,
        revenue: 0, weeklyRevenue: 0, releaseWeek: null 
      } as any
    };
    useGameStore.setState({ gameState: state });

    useGameStore.getState().signContract("t1", "p1");

    const newState = useGameStore.getState().gameState!;
    expect(newState.finance.cash).toBe(900000); // 1M - 100k fee
    expect(newState.studio.internal.contracts).toHaveLength(1);
    expect(newState.studio.internal.contracts[0].talentId).toBe("t1");
  });
});
