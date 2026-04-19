import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { StudioSnapshot } from '@/engine/types/studio.types';

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
    const projectsArray = Object.values(state.entities.projects);
    let completedProjects = 0;
    let activeProjects = 0;

    for (let i = 0; i < projectsArray.length; i++) {
      const p = projectsArray[i];
      if (p.state === 'released' || p.state === 'post_release' || p.state === 'archived') {
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
      timestamp: new Date().toISOString()
    };

    set((s) => ({
      snapshots: [...s.snapshots, snapshot]
    }));
  }
});
