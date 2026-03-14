import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock localStorage for Bun test runner
if (typeof localStorage === 'undefined') {
  const store: Record<string, string> = {};
  global.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { Object.keys(store).forEach(key => delete store[key]); },
    removeItem: (key: string) => { delete store[key]; },
    key: (index: number) => Object.keys(store)[index] || null,
    length: 0,
  } as Storage;

  Object.defineProperty(global, 'Storage', {
    value: class {
      getItem(key: string) { return store[key] || null; }
      setItem(key: string, value: string) { store[key] = value; }
      clear() { Object.keys(store).forEach(key => delete store[key]); }
      removeItem(key: string) { delete store[key]; }
      get length() { return Object.keys(store).length; }
      key(index: number) { return Object.keys(store)[index] || null; }
    },
    writable: true,
  });
}

import { saveGame, loadGame, getSaveSlots } from "../../persistence/saveLoad";
import { GameState } from "../../engine/types";
import { initializeGame } from "../../engine/core/gameInit";

describe("saveLoad", () => {
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

  it("does not crash when localStorage.setItem throws (reproduction)", () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    const state: GameState = initializeGame("Save Studio", "major");

    // This should NOT throw if the fix is implemented.
    // Currently, it WILL throw and fail this test.
    expect(() => saveGame(0, state)).not.toThrow();

    setItemSpy.mockRestore();
  });

  it("does not crash when localStorage.getItem throws", () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error("SecurityError");
    });

    expect(() => loadGame(0)).not.toThrow();
    expect(loadGame(0)).toBeNull();

    expect(() => getSaveSlots()).not.toThrow();
    expect(getSaveSlots()).toHaveLength(3);

    getItemSpy.mockRestore();
  });
});
