import { create } from 'zustand';
import { WeekSummary } from '@/engine/types';

interface UIStore {
  activeTab: 'pipeline' | 'finance';
  showCreateProject: boolean;
  showWeekSummary: boolean;
  weekSummary: WeekSummary | null;
  selectedProjectId: string | null;
  setActiveTab: (tab: 'pipeline' | 'finance') => void;
  openCreateProject: () => void;
  closeCreateProject: () => void;
  showSummary: (summary: WeekSummary) => void;
  closeSummary: () => void;
  selectProject: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'pipeline',
  showCreateProject: false,
  showWeekSummary: false,
  weekSummary: null,
  selectedProjectId: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  openCreateProject: () => set({ showCreateProject: true }),
  closeCreateProject: () => set({ showCreateProject: false }),
  showSummary: (summary) => set({ showWeekSummary: true, weekSummary: summary }),
  closeSummary: () => set({ showWeekSummary: false }),
  selectProject: (id) => set({ selectedProjectId: id }),
}));
