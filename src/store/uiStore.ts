import { create } from 'zustand';
import { WeekSummary } from '@/engine/types';

interface UIStore {
  activeTab: 'discovery' | 'pipeline' | 'finance' | 'talent' | 'media';
  showCreateProject: boolean;
  showPitchProject: boolean;
  pitchingProjectId: string | null;
  showWeekSummary: boolean;
  weekSummary: WeekSummary | null;
  selectedProjectId: string | null;
  setActiveTab: (tab: 'discovery' | 'pipeline' | 'finance' | 'talent' | 'media') => void;
  openCreateProject: () => void;
  closeCreateProject: () => void;
  openPitchProject: (projectId: string) => void;
  closePitchProject: () => void;
  showSummary: (summary: WeekSummary) => void;
  closeSummary: () => void;
  selectProject: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'discovery',
  showCreateProject: false,
  showPitchProject: false,
  pitchingProjectId: null,
  showWeekSummary: false,
  weekSummary: null,
  selectedProjectId: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  openCreateProject: () => set({ showCreateProject: true }),
  closeCreateProject: () => set({ showCreateProject: false }),
  openPitchProject: (projectId) => set({ showPitchProject: true, pitchingProjectId: projectId }),
  closePitchProject: () => set({ showPitchProject: false, pitchingProjectId: null }),
  showSummary: (summary) => set({ showWeekSummary: true, weekSummary: summary }),
  closeSummary: () => set({ showWeekSummary: false }),
  selectProject: (id) => set({ selectedProjectId: id }),
}));
