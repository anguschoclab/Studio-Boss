import {StateCreator} from "zustand";
import {GameStore} from "../gameStore";
import {StudioSnapshot} from "@/engine/types/studio.types";

export interface SnapshotSlice {
  snapshots: StudioSnapshot[];
  captureSnapshot: () => void;
}

export const createSnapshotSlice: StateCreator<GameStore, [], [], SnapshotSlice> = (set, get) => ({
  snapshots: [],

  captureSnapshot: () => {
    const state = get().gameState;
    if (!state) return;

    // ⚡ Bolt Optimization: Calculate derived counts using a single for...in loop
    // to avoid intermediate array allocations and GC overhead
    let completedProjects = 0;
    let activeProjects = 0;
    const projectsMap = state.entities.projects || {};

    for (const id in projectsMap) {
      if (!Object.prototype.hasOwnProperty.call(projectsMap, id)) continue;
      const p = projectsMap[id];
      if (p.state === "released" || p.state === "post_release" || p.state === "archived") {
        completedProjects++;
      } else {
        activeProjects++;
      }
    }

    const currentYear = Math.floor((state.week - 1) / 52) + 1;
    const currentWeek = ((state.week - 1) % 52) + 1;

    const snapshot: StudioSnapshot = {
      year: currentYear,
      week: currentWeek,
      funds: state.finance.cash,
      activeProjects,
      completedProjects,
      totalPrestige: state.studio.prestige,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({
      snapshots: [...s.snapshots, snapshot],
    }));
  },
});
