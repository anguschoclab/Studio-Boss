import { describe, it, expect } from "vitest";
import { initializeGame } from "../../../engine/core/gameInit";

describe("initializeGame", () => {
  it("initializes game state with correctly passed parameters", () => {
    const state = initializeGame("My Studio", "major");
    expect(state.studio.name).toBe("My Studio");
    expect(state.studio.archetype).toBe("major");
    expect(state.projects).toEqual([]);
    expect(state.rivals).toHaveLength(4);
    expect(state.week).toBe(1);
    expect(state.headlines).toHaveLength(1);
    expect(state.headlines[0].text).toContain("My Studio");
  });
});
