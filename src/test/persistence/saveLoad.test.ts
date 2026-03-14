import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { saveGame, loadGame, getSaveSlots } from "../../persistence/saveLoad";
import { GameState } from "../../engine/types";
import { initializeGame } from "../../engine/core/gameInit";

describe("saveLoad", () => {
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem(key) {
        return store[key] || null;
      },
      setItem(key, value) {
        store[key] = value.toString();
      },
      clear() {
        store = {};
      },
      removeItem(key) {
        delete store[key];
      }
    };
  })();
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
  });

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("returns null when loading an empty slot", () => {
    expect(loadGame(1)).toBeNull();
  });

  it("handles malformed save data", () => {
    localStorage.setItem("studioboss_save_1", "invalid json");
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
