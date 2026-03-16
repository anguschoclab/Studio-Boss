import { create } from 'zustand';
import { WeekSummary } from '@/engine/types';

interface UIStore {
  activeTab: 'discovery' | 'pipeline' | 'finance' | 'talent' | 'media';
  showCreateProject: boolean;
  showPitchProject: boolean;
  pitchingProjectId: string | null;
  showCrisisModal: boolean;
  crisisProjectId: string | null;
  showWeekSummary: boolean;
  weekSummary: WeekSummary | null;
  selectedProjectId: string | null;
  setActiveTab: (tab: 'discovery' | 'pipeline' | 'finance' | 'talent' | 'media') => void;
  openCreateProject: () => void;
  closeCreateProject: () => void;
  openPitchProject: (projectId: string) => void;
  closePitchProject: () => void;
  openCrisisModal: (projectId: string) => void;
  closeCrisisModal: () => void;
  showSummary: (summary: WeekSummary) => void;
  closeSummary: () => void;
  selectProject: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'discovery',
  showCreateProject: false,
  showPitchProject: false,
  pitchingProjectId: null,
  showCrisisModal: false,
  crisisProjectId: null,
  showWeekSummary: false,
  weekSummary: null,
  selectedProjectId: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  openCreateProject: () => set({ showCreateProject: true }),
  closeCreateProject: () => set({ showCreateProject: false }),
  openPitchProject: (projectId) => set({ showPitchProject: true, pitchingProjectId: projectId }),
  closePitchProject: () => set({ showPitchProject: false, pitchingProjectId: null }),
  openCrisisModal: (projectId) => set({ showCrisisModal: true, crisisProjectId: projectId }),
  closeCrisisModal: () => set({ showCrisisModal: false, crisisProjectId: null }),
  showSummary: (summary) => set({ showWeekSummary: true, weekSummary: summary }),
  closeSummary: () => set({ showWeekSummary: false }),
  selectProject: (id) => set({ selectedProjectId: id }),
}));
