import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { saveGame, loadGame, getSaveSlots } from "../../persistence/saveLoad";
import { GameState } from "../../engine/types";
import { initializeGame } from "../../engine/core/gameInit";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

describe("saveLoad", () => {
Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
  });

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("returns null when loading an empty slot", () => {
    expect(loadGame(1)).toBeNull();
  });

  it("handles malformed save data", () => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValueOnce("malformed json");
    expect(loadGame(1)).toBeNull();
  });

  it("saves and loads game state", () => {
    const state: GameState = initializeGame("Save Studio", "major");
    saveGame(0, state);

    const loaded = loadGame(0);
    expect(loaded).not.toBeNull();
    expect(loaded?.studio.name).toBe("Save Studio");
  });

  it("retrieves save slots info", () => {
    const slotsBefore = getSaveSlots();
    expect(slotsBefore).toHaveLength(3);
    expect(slotsBefore.every((s) => !s.exists)).toBe(true);

    const state: GameState = initializeGame("Save Studio", "major");
    saveGame(1, state);

    const slotsAfter = getSaveSlots();
    expect(slotsAfter[1].exists).toBe(true);
    expect(slotsAfter[1].studioName).toBe("Save Studio");
    expect(slotsAfter[0].exists).toBe(false);
  });

  it("interacts with localStorage correctly when saving a game", () => {
    const state: GameState = initializeGame("Save Studio", "major");
    // Mock Date.now() to have a predictable timestamp if necessary, but we can just check properties.
    const originalDateNow = Date.now;
    const mockNow = 1234567890;
    Date.now = vi.fn(() => mockNow);

    saveGame(2, state);

    expect(vi.mocked(localStorage.setItem)).toHaveBeenCalledWith("studioboss_save_2", JSON.stringify(state));

    // Check if it saved slots correctly
    const expectedSlots = {
      2: {
        slot: 2,
        studioName: state.studio.name,
        archetype: state.studio.archetype,
        week: state.week,
        cash: state.cash,
        timestamp: mockNow,
      }
    };
    expect(vi.mocked(localStorage.setItem)).toHaveBeenCalledWith("studioboss_slots", JSON.stringify(expectedSlots));

    // Restore Date.now
    Date.now = originalDateNow;
  });

  it("preserves existing save slots when saving to a new slot", () => {
    const state1: GameState = initializeGame("Studio 1", "indie");
    const state2: GameState = initializeGame("Studio 2", "major");

    saveGame(0, state1);

    // Clear mock calls to check just the second save's behavior
    vi.clearAllMocks();

    const originalDateNow = Date.now;
    const mockNow = 9876543210;
    Date.now = vi.fn(() => mockNow);

    saveGame(1, state2);

    // It should have called setItem for the state
    expect(vi.mocked(localStorage.setItem)).toHaveBeenCalledWith("studioboss_save_1", JSON.stringify(state2));

    // It should have called getItem for the slots first to merge
    expect(vi.mocked(localStorage.getItem)).toHaveBeenCalledWith("studioboss_slots");

    // We can't know the exact timestamp of state1 without more mocking,
    // but we can parse the second setItem call to check if it preserved both slots.
    const calls = vi.mocked(localStorageMock.setItem).mock.calls;
    const slotsCall = calls.find(call => call[0] === "studioboss_slots");
    expect(slotsCall).toBeDefined();

    const savedSlots = JSON.parse(slotsCall![1]);
    expect(savedSlots[0]).toBeDefined();
    expect(savedSlots[0].studioName).toBe("Studio 1");
    expect(savedSlots[1]).toBeDefined();
    expect(savedSlots[1].studioName).toBe("Studio 2");
    expect(savedSlots[1].timestamp).toBe(mockNow);

    Date.now = originalDateNow;
  });
  it("handles storage errors gracefully without crashing", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(localStorage, "setItem").mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });

    const state = initializeGame("Error Studio", "major");

    // This should not throw an exception
    expect(() => saveGame(0, state)).not.toThrow();

    // It should have logged the error
    expect(consoleSpy).toHaveBeenCalledWith("Failed to save game state", expect.any(Error));

    consoleSpy.mockRestore();
    vi.restoreAllMocks();
  });
});