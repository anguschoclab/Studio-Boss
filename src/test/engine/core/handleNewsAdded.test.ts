import {describe, it, expect, beforeEach} from "vitest";
import {handleNewsAdded} from "@/engine/core/impactHandlers/studioHandlers";
import {createMockGameState} from "@/test/utils/mockFactories";
import {GameState, StateImpact} from "@/engine/types";

describe("handleNewsAdded - No-op (news captured by WeekCoordinator)", () => {
  let state: GameState;

  beforeEach(() => {
    state = createMockGameState();
    state.week = 10;
    state.tickCount = 5;
  });

  it("returns state unchanged — news events are captured by WeekCoordinator.buildSummary", () => {
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
    expect(result).toBe(state);
  });

  it("returns state unchanged for any news impact payload", () => {
    const impact: StateImpact = {
      type: "NEWS_ADDED",
      payload: {
        headline: "Breaking News Story",
        description: "Something happened",
        publication: "Variety",
        type: "CRISIS",
        category: "scandal",
        talentId: "talent-1",
        projectId: "project-1",
      },
    } as unknown as StateImpact;

    const result = handleNewsAdded(state, impact as never);
    expect(result).toBe(state);
  });
});
