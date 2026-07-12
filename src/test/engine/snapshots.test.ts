import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@/store/gameStore";
import { initializeGame } from "@/engine/core/gameInit";

describe("Historical Snapshots System", () => {
  beforeEach(() => {
    const gameState = initializeGame("Test Studio", "major", 42);
    useGameStore.setState({
      gameState,
      finance: gameState.finance as any,
      news: gameState.news,
      snapshots: [],
    });
  });

  it("should capture a complete snapshot exactly on week 52", () => {
    // Advance 51 weeks (getting to week 52)
    for (let i = 1; i < 52; i++) {
      useGameStore.getState().doAdvanceWeek();
    }

    expect(useGameStore.getState().gameState?.week).toBe(52);
    expect(useGameStore.getState().snapshots.length).toBe(0);

    // Action: Advance from week 52 to 53/1
    // This triggers the snapshot in weekAdvance.ts
    useGameStore.getState().doAdvanceWeek();

    // Verification
    const snapshots = useGameStore.getState().snapshots;
    expect(snapshots.length).toBe(1);
    expect(snapshots[0].year).toBe(2);
    expect(snapshots[0].week).toBe(1);
    expect(snapshots[0].funds).toBe(useGameStore.getState().gameState?.finance.cash || 0);
  });
});
