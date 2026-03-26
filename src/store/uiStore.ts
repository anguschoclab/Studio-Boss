import { create } from 'zustand';
import { WeekSummary } from '@/engine/types';

export type ModalType = 'CRISIS' | 'AWARDS' | 'SUMMARY';

export interface QueuedModal {
  id: string;
  type: ModalType;
  payload: any;
}

interface UIStore {
  activeTab: 'discovery' | 'pipeline' | 'finance' | 'talent' | 'media';
  showCreateProject: boolean;
  showPitchProject: boolean;
  pitchingProjectId: string | null;
  
  // Modal Queue System
  modalQueue: QueuedModal[];
  activeModal: QueuedModal | null;
  enqueueModal: (type: ModalType, payload: any) => void;
  resolveCurrentModal: () => void;

  // Legacy (Will be refactored to use queue)
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

export const useUIStore = create<UIStore>((set, get) => ({
  activeTab: 'discovery',
  showCreateProject: false,
  showPitchProject: false,
  pitchingProjectId: null,
  
  modalQueue: [],
  activeModal: null,

  enqueueModal: (type, payload) => {
    const newModal = { id: crypto.randomUUID(), type, payload };
    set((state) => {
      // If no modal is active, set it and return
      if (!state.activeModal) {
        return {
          activeModal: newModal,
        };
      }
      // Otherwise, add to queue
      return { modalQueue: [...state.modalQueue, newModal] };
    });
  },

  resolveCurrentModal: () => {
    set((state) => {
      if (state.modalQueue.length > 0) {
        const nextModal = state.modalQueue[0];
        return {
          activeModal: nextModal,
          modalQueue: state.modalQueue.slice(1),
        };
      }
      return { activeModal: null };
    });
  },

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

