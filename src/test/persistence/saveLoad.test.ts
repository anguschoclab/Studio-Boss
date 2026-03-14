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
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

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

  it("initializes empty slots correctly when no saved data exists", () => {
    (localStorage.getItem as any).mockReturnValueOnce(null);
    const slots = getSaveSlots();

    expect(slots).toHaveLength(3);
    slots.forEach((slot, index) => {
      expect(slot.slot).toBe(index);
      expect(slot.exists).toBe(false);
      expect(slot.studioName).toBe('');
      expect(slot.archetype).toBe('indie');
      expect(slot.week).toBe(0);
      expect(slot.cash).toBe(0);
      expect(slot.timestamp).toBe(0);
    });

    (localStorage.getItem as any).mockReturnValueOnce('{}');
    const slotsEmptyObj = getSaveSlots();

    expect(slotsEmptyObj).toHaveLength(3);
    slotsEmptyObj.forEach((slot, index) => {
      expect(slot.slot).toBe(index);
      expect(slot.exists).toBe(false);
      expect(slot.studioName).toBe('');
      expect(slot.archetype).toBe('indie');
      expect(slot.week).toBe(0);
      expect(slot.cash).toBe(0);
      expect(slot.timestamp).toBe(0);
    });
  });
});
