import { describe, it, expect } from "vitest";
import { useGameStore } from "@/store/gameStore";

// Characterization test for captureSnapshot's derived project counts.
// Guards the for...in refactor (PR #900): completed = released/post_release/
// archived; active = everything else.
describe("snapshotSlice — derived project counts", () => {
  it("computes completed/active counts and calendar fields from entities.projects", () => {
    useGameStore.setState({
      gameState: {
        week: 53, // year 2, week 1
        finance: { cash: 42_000_000 },
        studio: { prestige: 77 },
        entities: {
          projects: {
            a: { state: "released" },
            b: { state: "post_release" },
            c: { state: "archived" },
            d: { state: "production" },
            e: { state: "development" },
          },
        },
      },
      snapshots: [],
    } as never);

    useGameStore.getState().captureSnapshot();

    const [snap] = useGameStore.getState().snapshots;
    expect(snap.completedProjects).toBe(3);
    expect(snap.activeProjects).toBe(2);
    expect(snap.year).toBe(2);
    expect(snap.week).toBe(1);
    expect(snap.funds).toBe(42_000_000);
    expect(snap.totalPrestige).toBe(77);
  });

  it("counts an empty project map as zero/zero", () => {
    useGameStore.setState({
      gameState: {
        week: 1,
        finance: { cash: 0 },
        studio: { prestige: 0 },
        entities: { projects: {} },
      },
      snapshots: [],
    } as never);

    useGameStore.getState().captureSnapshot();

    const [snap] = useGameStore.getState().snapshots;
    expect(snap.completedProjects).toBe(0);
    expect(snap.activeProjects).toBe(0);
  });
});
