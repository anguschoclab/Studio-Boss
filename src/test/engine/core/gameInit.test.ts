import { describe, it, expect } from "vitest";
import { initializeGame } from "../../../engine/core/gameInit";

describe("initializeGame", () => {
  it("initializes game state with correctly passed parameters", () => {
    const state = initializeGame("My Studio", "major");
    expect(state.studio.name).toBe("My Studio");
    expect(state.studio.archetype).toBe("major");
    expect(state.week).toBe(1);
    expect(state.weekSummaries).toHaveLength(1);
    expect(state.weekSummaries[0].newsEvents[0].headline).toContain("My Studio");
  });

  it("assigns player streamer ownerId to the actual studio ID", () => {
    const state = initializeGame("My Studio", "major");
    const playerStreamer = state.market.buyers.find(
      (b) => b.archetype === "streamer" && b.ownerId === state.studio.id
    );
    expect(playerStreamer).toBeDefined();
    expect(playerStreamer!.ownerId).toBe(state.studio.id);
    expect(state.studio.ownedPlatforms).toContain(playerStreamer!.id);
  });

  it("never emits the PLR-STUDIO-1 placeholder on any buyer", () => {
    const state = initializeGame("My Studio", "major");
    expect(state.studio.id).not.toBe("PLR-STUDIO-1");
    const placeholder = state.market.buyers.find((b) => b.ownerId === "PLR-STUDIO-1");
    expect(placeholder).toBeUndefined();
  });

  it("does not assign a streamer for indie archetype", () => {
    const state = initializeGame("Indie Studio", "indie");
    const playerStreamer = state.market.buyers.find(
      (b) => b.archetype === "streamer" && b.ownerId === state.studio.id
    );
    expect(playerStreamer).toBeUndefined();
  });

  it("initializes contractsByProjectId as empty object in entities", () => {
    const state = initializeGame("My Studio", "major");
    expect(state.entities.contractsByProjectId).toBeDefined();
    expect(state.entities.contractsByProjectId).toEqual({});
  });

  it("initializes weekSummaries with launch news event", () => {
    const state = initializeGame("My Studio", "major");
    expect(state.weekSummaries).toBeDefined();
    expect(state.weekSummaries).toHaveLength(1);
    expect(state.weekSummaries[0].newsEvents).toBeDefined();
    expect(state.weekSummaries[0].newsEvents.length).toBeGreaterThan(0);
    expect(state.weekSummaries[0].newsEvents[0].headline).toContain("My Studio");
  });

  it("produces identical state for the same explicit seed", () => {
    const a = initializeGame("Seeded Studio", "major", 42);
    const b = initializeGame("Seeded Studio", "major", 42);
    expect(a).toEqual(b);
  });

  it("produces different worlds for different seeds", () => {
    const a = initializeGame("Seeded Studio", "major", 42);
    const b = initializeGame("Seeded Studio", "major", 1337);
    expect(a.gameSeed).toBe(42);
    expect(b.gameSeed).toBe(1337);
    expect(a).not.toEqual(b);
  });

  it.each(["major", "mid-tier", "indie"] as const)(
    "initializes cleanly for the %s archetype",
    (archetype) => {
      const state = initializeGame(`${archetype} studio`, archetype, 7);
      expect(state.studio.archetype).toBe(archetype);
      expect(state.entities.rivals).toBeDefined();
    }
  );

  it("fails fast on an unknown archetype instead of silently misconfiguring", () => {
    // ARCHETYPES[archetype] is undefined → accessing startingCash throws.
    expect(() => initializeGame("Bogus", "megacorp" as never, 1)).toThrow();
  });
});
