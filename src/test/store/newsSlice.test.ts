import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@/store/gameStore";
import { initializeGame } from "@/engine/core/gameInit";

describe("appendNewsEvents store action", () => {
  beforeEach(() => {
    const state = initializeGame("Test Studio", "major");
    useGameStore.setState({
      gameState: state,
      finance: state.finance as any,
      news: state.news,
    });
  });

  it("appends news events to weekSummaries", () => {
    const initialLength = useGameStore.getState().gameState?.weekSummaries?.length || 0;
    useGameStore.getState().appendNewsEvents([
      {
        id: "test-ne-1",
        week: 1,
        type: "STUDIO_EVENT",
        headline: "Test event",
        description: "Test desc",
      },
    ]);
    const summaries = useGameStore.getState().gameState?.weekSummaries || [];
    expect(summaries.length).toBe(initialLength + 1);
    const lastSummary = summaries[summaries.length - 1];
    expect(lastSummary.newsEvents).toBeDefined();
    expect(lastSummary.newsEvents.length).toBe(1);
    expect(lastSummary.newsEvents[0].headline).toBe("Test event");
  });

  it("does not mutate other state slices", () => {
    const beforeState = useGameStore.getState().gameState;
    useGameStore.getState().appendNewsEvents([
      {
        id: "test-ne-2",
        week: 1,
        type: "CRISIS",
        headline: "Crisis event",
        description: "Desc",
      },
    ]);
    const afterState = useGameStore.getState().gameState;
    expect(afterState?.studio.name).toBe(beforeState?.studio.name);
    expect(afterState?.finance.cash).toBe(beforeState?.finance.cash);
    expect(afterState?.week).toBe(beforeState?.week);
  });
});
