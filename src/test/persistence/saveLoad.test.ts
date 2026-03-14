import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { saveGame, loadGame, getSaveSlots } from "../../persistence/saveLoad";
import { GameState } from "../../engine/types";
import { initializeGame } from "../../engine/core/gameInit";

describe("saveLoad", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
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
    expect(slotsBefore.every(s => !s.exists)).toBe(true);

    const state: GameState = initializeGame("Save Studio", "major");
    saveGame(1, state);

    const slotsAfter = getSaveSlots();
    expect(slotsAfter[1].exists).toBe(true);
    expect(slotsAfter[1].studioName).toBe("Save Studio");
    expect(slotsAfter[0].exists).toBe(false);
  });
});
