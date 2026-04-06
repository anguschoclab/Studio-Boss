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
    // Completed projects are those that have been released (including post-release and archived)
    const completedProjects = projectsArray.filter(p => 
      p.state === 'released' || p.state === 'post_release' || p.state === 'archived'
    ).length;

    // Active projects are those currently in development, production, or marketing
    const activeProjects = projectsArray.filter(p => 
      p.state !== 'released' && p.state !== 'post_release' && p.state !== 'archived'
    ).length;

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
