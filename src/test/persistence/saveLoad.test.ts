import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveGame, loadGame, getSaveSlots } from "../../persistence/saveLoad";
import { persistenceService } from "../../persistence/PersistenceService";
import { initializeGame } from "../../engine/core/gameInit";

// Mock the persistenceService
vi.mock("../../persistence/PersistenceService", () => ({
  persistenceService: {
    save: vi.fn(),
    load: vi.fn(),
    exists: vi.fn(),
  }
}));

describe("saveLoad", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when loading an empty slot", async () => {
    vi.mocked(persistenceService.load).mockResolvedValue(null);
    const result = await loadGame(1);
    expect(result).toBeNull();
  });

  it("handles malformed or missing save data from persistence service", async () => {
    vi.mocked(persistenceService.load).mockRejectedValue(new Error("Disk Error"));
    const result = await loadGame(1);
    expect(result).toBeNull();
  });

  it("saves and loads game state correctly", async () => {
    const mockState = initializeGame("Save Studio", "major", 42);
    vi.mocked(persistenceService.save).mockResolvedValue(true);
    vi.mocked(persistenceService.load).mockResolvedValue(mockState);

    await saveGame(0, mockState);
    expect(persistenceService.save).toHaveBeenCalledWith(0, mockState);

    const loaded = await loadGame(0);
    expect(loaded).toEqual(mockState);
    expect(loaded?.studio.name).toBe("Save Studio");
  });

  it("retrieves save slots info asynchronously", async () => {
    const mockState = initializeGame("Save Studio", "major", 42);
    
    // Setup: Slot 1 exists, Slot 0 and 2 do not
    vi.mocked(persistenceService.load).mockImplementation(async (slot: number) => {
        if (slot === 1) return mockState;
        return null;
    });

    const slots = await getSaveSlots();
    
    expect(slots).toHaveLength(3);
    expect(slots[0].exists).toBe(false);
    expect(slots[1].exists).toBe(true);
    expect(slots[1].studioName).toBe("Save Studio");
    expect(slots[2].exists).toBe(false);
  });

  it("logs errors when save fails", async () => {
    const mockState = initializeGame("Error Studio", "indie", 42);
    vi.mocked(persistenceService.save).mockRejectedValue(new Error("Write failure"));
    
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    await saveGame(5, mockState);
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Failed to save game state"), expect.any(Error));
    consoleSpy.mockRestore();
  });
});
