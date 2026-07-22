import { describe, it, expect, beforeEach } from "vitest";
import { handleNewsAdded } from "@/engine/core/impactHandlers/studioHandlers";
import { createMockGameState } from "@/test/utils/mockFactories";
import { GameState, StateImpact } from "@/engine/types";

describe("handleNewsAdded - Determinism", () => {
  let state: GameState;

  beforeEach(() => {
    state = createMockGameState();
    state.week = 10;
    state.tickCount = 5;
  });

  it("uses provided id when id is present", () => {
    const impact: StateImpact = {
      type: "NEWS_ADDED",
      payload: {
        id: "custom-news-id",
        headline: "Test headline",
        description: "Test description",
        publication: "Variety",
      },
    } as unknown as StateImpact;

    const result = handleNewsAdded(state, impact as never);
    expect(result.industry.newsHistory[0].id).toBe("custom-news-id");
  });

  it("generates deterministic ID when id is not provided (no Date.now())", () => {
    const impact: StateImpact = {
      type: "NEWS_ADDED",
      payload: {
        headline: "Breaking News Story",
        description: "Something happened",
        publication: "Variety",
      },
    } as unknown as StateImpact;

    const result = handleNewsAdded(state, impact as never);
    const newsId = result.industry.newsHistory[0].id;
    // Should be deterministic based on week, tickCount, and headline
    expect(newsId).toBe("news-10-5-Breaking News Story");
    // Should NOT contain a timestamp
    expect(newsId).not.toMatch(/\d{13,}/); // No Date.now() style timestamps
  });

  it("produces identical IDs for two calls with same state and headline", () => {
    const impact: StateImpact = {
      type: "NEWS_ADDED",
      payload: {
        headline: "Same Headline",
        description: "Same description",
        publication: "Variety",
      },
    } as unknown as StateImpact;

    const result1 = handleNewsAdded(state, impact as never);
    const id1 = result1.industry.newsHistory[0].id;

    // Reset state to same initial conditions
    const state2 = createMockGameState();
    state2.week = 10;
    state2.tickCount = 5;

    const result2 = handleNewsAdded(state2, impact as never);
    const id2 = result2.industry.newsHistory[0].id;

    expect(id1).toBe(id2);
  });

  it("produces different IDs for different headlines", () => {
    const impact1: StateImpact = {
      type: "NEWS_ADDED",
      payload: { headline: "Headline A", description: "", publication: "Variety" },
    } as unknown as StateImpact;

    const impact2: StateImpact = {
      type: "NEWS_ADDED",
      payload: { headline: "Headline B", description: "", publication: "Variety" },
    } as unknown as StateImpact;

    const result1 = handleNewsAdded(state, impact1 as never);
    const result2 = handleNewsAdded(state, impact2 as never);
    expect(result1.industry.newsHistory[0].id).not.toBe(result2.industry.newsHistory[0].id);
  });

  it("produces different IDs for different weeks", () => {
    const impact: StateImpact = {
      type: "NEWS_ADDED",
      payload: { headline: "Same Headline", description: "", publication: "Variety" },
    } as unknown as StateImpact;

    const result1 = handleNewsAdded(state, impact as never);

    state.week = 11;
    const result2 = handleNewsAdded(state, impact as never);

    expect(result1.industry.newsHistory[0].id).not.toBe(result2.industry.newsHistory[0].id);
  });

  it("truncates headline to 20 characters in deterministic ID", () => {
    const longHeadline = "This is a very long headline that exceeds twenty characters";
    const impact: StateImpact = {
      type: "NEWS_ADDED",
      payload: { headline: longHeadline, description: "", publication: "Variety" },
    } as unknown as StateImpact;

    const result = handleNewsAdded(state, impact as never);
    const newsId = result.industry.newsHistory[0].id;
    // Should contain first 20 chars of headline
    expect(newsId).toContain(longHeadline.slice(0, 20));
    expect(newsId).not.toContain(longHeadline.slice(0, 21));
  });
});
