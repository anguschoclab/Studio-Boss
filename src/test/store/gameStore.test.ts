import { describe, it, expect, beforeEach, vi } from "vitest";
import { useGameStore } from "../../store/gameStore";



import * as saveLoad from "../../persistence/saveLoad";

// Mock saveLoad
vi.mock("../../persistence/saveLoad", () => ({
  saveGame: vi.fn(),
  loadGame: vi.fn((slot) => {
    if (slot === 1) return { studio: { name: "Loaded Studio" } };
    return null;
  }),
  getSaveSlots: vi.fn(() => [{ exists: true }]),
}));

Object.defineProperty(global, 'crypto', {
  value: { randomUUID: () => 'test-uuid' },
  writable: true
});


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
    expect(saveLoad.saveGame).toHaveBeenCalledWith(0, state);
  });

  it("advances week", () => {
    useGameStore.getState().newGame("My Studio", "major");
    // Ensure the necessary arrays are present
    const state = useGameStore.getState().gameState!;
    state.studio.internal.contracts = [];
    state.industry.talentPool = [];
    state.industry.awards = [];
    useGameStore.setState({ gameState: state });

    const summary = useGameStore.getState().doAdvanceWeek();
    expect(summary.fromWeek).toBe(1);
    expect(useGameStore.getState().gameState?.week).toBe(2);
    expect(saveLoad.saveGame).toHaveBeenCalledTimes(2); // once in newGame, once in advanceWeek
  });

  it("throws when advancing without game state", () => {
    expect(() => useGameStore.getState().doAdvanceWeek()).toThrowError("No game in progress");
  });

  it("creates a project", () => {
    useGameStore.getState().newGame("My Studio", "major");
    useGameStore.getState().createProject({
      title: "Test Project",
      format: "film",
      genre: "Comedy",
      budgetTier: "low",
      targetAudience: "All",
      flavor: "Funny"
    });

    const state = useGameStore.getState().gameState;
    expect(state?.studio.internal.projects).toHaveLength(1);
    expect(state?.studio.internal.projects[0].title).toBe("Test Project");
  });

  it("handles creating project when no game state exists", () => {
    useGameStore.getState().createProject({
      title: "Test Project",
      format: "film",
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
    expect(saveLoad.saveGame).toHaveBeenCalledWith(1, useGameStore.getState().gameState);
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

  const setupSignContractState = (initialCash: number) => {
    useGameStore.getState().newGame("My Studio", "major");
    const state = useGameStore.getState().gameState!;
    state.cash = initialCash;
    state.studio.internal.contracts = [];
    state.industry.talentPool = [
      { id: "t1", name: "Star", roles: ["actor"], prestige: 85, draw: 80, fee: 500, accessLevel: "outsider", temperament: "normal" } as unknown as import('../../engine/types').TalentProfile
    ];
    useGameStore.setState({ gameState: state });
  };

  it("signs a contract if sufficient funds", () => {
    setupSignContractState(1000);
    const state = useGameStore.getState().gameState!;
    state.studio.internal.projects = [{ 
      id: "p1", title: "Test", format: "film", genre: "Action", budgetTier: "low", budget: 100_000, weeklyCost: 0,
      targetAudience: "All", flavor: "", status: "development", weeksInPhase: 0, productionWeeks: 10, developmentWeeks: 10,
      revenue: 0, weeklyRevenue: 0, releaseWeek: null 
    } as any];
    useGameStore.setState({ gameState: state });

    useGameStore.getState().signContract("t1", "p1");

    const newState = useGameStore.getState().gameState!;
    expect(newState.cash).toBe(500);
    expect(newState.studio.internal.contracts).toHaveLength(1);
    expect(newState.studio.internal.contracts[0].talentId).toBe("t1");
    expect(newState.studio.internal.contracts[0].backendPercent).toBe(5);
  });

  it("fails to sign contract if insufficient funds", () => {
    setupSignContractState(100); // Not enough for fee of 500
    const state = useGameStore.getState().gameState!;
    state.studio.internal.projects = [{ 
      id: "p1", title: "Test", format: "film", genre: "Action", budgetTier: "low", budget: 100_000, weeklyCost: 0,
      targetAudience: "All", flavor: "", status: "development", weeksInPhase: 0, productionWeeks: 10, developmentWeeks: 10,
      revenue: 0, weeklyRevenue: 0, releaseWeek: null 
    } as any];
    useGameStore.setState({ gameState: state });

    useGameStore.getState().signContract("t1", "p1");

    const newState = useGameStore.getState().gameState!;
    expect(newState.cash).toBe(100);
    expect(newState.studio.internal.contracts).toHaveLength(0);
  });

  it('should acquire an opportunity and convert it to a project', () => {
    const store = useGameStore.getState();
    store.newGame('Test Studio', 'indie');

    // Check initial state has opportunities
    const initialState = useGameStore.getState().gameState!;
    expect(initialState.market.opportunities.length).toBeGreaterThan(0);

    initialState.market.opportunities[0].id = 'unique-opp-id';
    const opp = initialState.market.opportunities[0];
    const initialOppCount = initialState.market.opportunities.length;

    // Acquire the opportunity

    useGameStore.getState().acquireOpportunity(opp.id);

    const afterState = useGameStore.getState().gameState!;


    // Opportunity should be removed
    expect(afterState.market.opportunities.length).toBe(initialOppCount - 1);

    // A project should be created
    expect(afterState.studio.internal.projects.length).toBe(1);
    const newProject = afterState.studio.internal.projects[0];

    // Properties should map correctly
    expect(newProject.title).toBe(opp.title);
    expect(newProject.format).toBe(opp.format);
    expect(newProject.genre).toBe(opp.genre);
    expect(newProject.budgetTier).toBe(opp.budgetTier);
    expect(newProject.targetAudience).toBe(opp.targetAudience);
    expect(newProject.flavor).toBe(opp.flavor);
    expect(newProject.status).toBe('development');
    expect(newProject.weeksInPhase).toBe(0);
    expect(afterState.cash).toBeLessThan(initialState.cash); // Cost to acquire is subtracted
  });

});
