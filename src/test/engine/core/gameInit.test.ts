import { describe, it, expect } from "vitest";
import { initializeGame } from "../../../engine/core/gameInit";

describe.skip("initializeGame", () => {
  it("initializes game state with correctly passed parameters", () => {
    const state = initializeGame("My Studio", "major");
    expect(state.studio.name).toBe("My Studio");
    expect(state.studio.archetype).toBe("major");
    expect(state.studio.internal.projects).toEqual([]);
    expect(state.industry.rivals).toHaveLength(4);
    expect(state.week).toBe(1);
    expect(state.industry.newsHistory).toHaveLength(0);
    expect(state.news.headlines).toHaveLength(1);
    expect(state.news.headlines[0].text).toContain("My Studio");
  });
});
