import { describe, it, expect } from "vitest";
import { initializeGame } from "../../../engine/core/gameInit";

describe("initializeGame", () => {
  it("initializes game state with correctly passed parameters", () => {
    const state = initializeGame("My Studio", "major");
    expect(state.studio.name).toBe("My Studio");
    expect(state.studio.archetype).toBe("major");
    expect(state.week).toBe(1);
    expect(state.news.headlines).toHaveLength(1);
    expect(state.news.headlines[0].text).toContain("My Studio");
  });

  it("assigns player streamer ownerId to the actual studio ID", () => {
    const state = initializeGame("My Studio", "major");
    const playerStreamer = state.market.buyers.find(
      b => b.archetype === 'streamer' && b.ownerId === state.studio.id
    );
    expect(playerStreamer).toBeDefined();
    expect(playerStreamer!.ownerId).toBe(state.studio.id);
    expect(state.studio.ownedPlatforms).toContain(playerStreamer!.id);
  });

  it("does not assign a streamer for indie archetype", () => {
    const state = initializeGame("Indie Studio", "indie");
    const playerStreamer = state.market.buyers.find(
      b => b.archetype === 'streamer' && b.ownerId === state.studio.id
    );
    expect(playerStreamer).toBeUndefined();
  });

  it("initializes contractsByProjectId as empty object in entities", () => {
    const state = initializeGame("My Studio", "major");
    expect(state.entities.contractsByProjectId).toBeDefined();
    expect(state.entities.contractsByProjectId).toEqual({});
  });
});
