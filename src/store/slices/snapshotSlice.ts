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

    // Derived counts
    // ⚡ Bolt: Replaced Object.values().filter() chain with a single for...in loop to avoid intermediate array allocations and redundant iterations.
    let completedProjects = 0;
    let activeProjects = 0;
    const projectsObj = state.entities.projects || {};
    for (const key in projectsObj) {
      if (Object.prototype.hasOwnProperty.call(projectsObj, key)) {
        const pState = projectsObj[key].state;
        if (pState === "released" || pState === "post_release" || pState === "archived") {
          completedProjects++;
        } else {
          activeProjects++;
        }
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
