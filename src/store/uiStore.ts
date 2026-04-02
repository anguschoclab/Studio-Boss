import { create } from 'zustand';
import { ModalType } from '@/engine/types';

export interface QueuedModal {
  id: string;
  type: ModalType;
  payload: Record<string, unknown> | null;
}

export type TabId = 'command' | 'pipeline' | 'ip' | 'deals' | 'talent' | 'finance' | 'trades' | 'industry' | 'sbdb' | 'streaming';

interface UIStore {
  activeTab: TabId;
  showCreateProject: boolean;
  showPitchProject: boolean;
  pitchingProjectId: string | null;
  
  // Modal Queue System
  modalQueue: QueuedModal[];
  activeModal: QueuedModal | null;
  enqueueModal: (type: ModalType, payload: Record<string, unknown> | null) => void;
  resolveCurrentModal: () => void;
  
  selectedProjectId: string | null;
  selectedTalentId: string | null;
  setActiveTab: (tab: TabId) => void;
  openCreateProject: () => void;
  closeCreateProject: () => void;
  openPitchProject: (projectId: string) => void;
  closePitchProject: () => void;
  selectProject: (id: string | null) => void;
  selectTalent: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'command',
  showCreateProject: false,
  showPitchProject: false,
  pitchingProjectId: null,
  
  modalQueue: [],
  activeModal: null,

  enqueueModal: (type, payload) => {
    const newModal = { id: crypto.randomUUID(), type, payload };
    set((state) => {
      if (!state.activeModal) return { activeModal: newModal };
      return { modalQueue: [...state.modalQueue, newModal] };
    });
  },

  resolveCurrentModal: () => {
    set((state) => {
      if (state.modalQueue.length > 0) {
        return {
          activeModal: state.modalQueue[0],
          modalQueue: state.modalQueue.slice(1),
        };
      }
      return { activeModal: null };
    });
  },

  selectedProjectId: null,
  selectedTalentId: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  openCreateProject: () => set({ showCreateProject: true }),
  closeCreateProject: () => set({ showCreateProject: false }),
  openPitchProject: (projectId) => set({ showPitchProject: true, pitchingProjectId: projectId }),
  closePitchProject: () => set({ showPitchProject: false, pitchingProjectId: null }),
  selectProject: (id) => set({ selectedProjectId: id }),
  selectTalent: (id) => set({ selectedTalentId: id }),
}));
