/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { WeekSummary } from "@/engine/types";

export type ModalType =
  | "CRISIS"
  | "AWARDS"
  | "SUMMARY"
  | "GAME_OVER"
  | "RELEASE_STRATEGY"
  | "POST_PRODUCTION"
  | "ACHIEVEMENT_UNLOCKED"
  | "FESTIVAL_MARKET"
  | "PACKAGE_DEAL_OFFERED"
  | "DIRECTORS_CUT_AVAILABLE"
  | "UPFRONTS"
  | "BIDDING_WAR"
  | "BREAKOUT_BIDDING_WAR"
  | "REBOOT_OPPORTUNITY"
  | "DISTRESSED_ASSET_OFFER"
  | "GREENLIGHT_DECISION"
  | "STRATEGY_CHOICE"
  | "ACQUISITION_CONFIRM";

let modalIdCounter = 0;

export interface QueuedModal {
  id: string;
  type: ModalType;
  payload: any;
}

export type TabId =
  | "command"
  | "pipeline"
  | "ip"
  | "distribution"
  | "talent"
  | "finance"
  | "trades"
  | "industry"
  | "awards"
  | "bookmarks";

interface UIStore {
  activeTab: TabId;
  activeHub: string;
  showQuickActions: boolean;
  showCreateProject: boolean;
  showPitchProject: boolean;
  pitchingProjectId: string | null;

  // Modal Queue System
  modalQueue: QueuedModal[];
  activeModal: QueuedModal | null;
  enqueueModal: (type: ModalType, payload: any) => void;
  resolveCurrentModal: () => void;

  // Settings modal (Plan 4)
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;

  // Legacy (Will be refactored to use queue)
  showCrisisModal: boolean;
  crisisProjectId: string | null;
  showWeekSummary: boolean;
  weekSummary: WeekSummary | null;

  selectedProjectId: string | null;
  selectedTalentId: string | null;
  setActiveTab: (tab: TabId) => void;
  setActiveHub: (hub: string) => void;
  setActiveSubTab: (tab: string) => void;
  toggleQuickActions: () => void;
  openCreateProject: () => void;
  closeCreateProject: () => void;
  openPitchProject: (projectId: string) => void;
  closePitchProject: () => void;
  openCrisisModal: (projectId: string) => void;
  closeCrisisModal: () => void;
  showSummary: (summary: WeekSummary) => void;
  closeSummary: () => void;
  selectProject: (id: string | null) => void;
  selectTalent: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: "command",
  activeHub: "studio",
  showQuickActions: false,
  showCreateProject: false,
  showPitchProject: false,
  pitchingProjectId: null,

  modalQueue: [],
  activeModal: null,
  showSettings: false,
  setShowSettings: (v) => set({ showSettings: v }),

  enqueueModal: (type, payload) => {
    const newModal = { id: `modal-${modalIdCounter++}`, type, payload };
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
  selectedTalentId: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveHub: (hub) => set({ activeHub: hub }),
  setActiveSubTab: () => {},
  toggleQuickActions: () => set((s) => ({ showQuickActions: !s.showQuickActions })),
  openCreateProject: () => set({ showCreateProject: true }),
  closeCreateProject: () => set({ showCreateProject: false }),
  openPitchProject: (projectId) => set({ showPitchProject: true, pitchingProjectId: projectId }),
  closePitchProject: () => set({ showPitchProject: false, pitchingProjectId: null }),
  openCrisisModal: (projectId) => set({ showCrisisModal: true, crisisProjectId: projectId }),
  closeCrisisModal: () => set({ showCrisisModal: false, crisisProjectId: null }),
  showSummary: (summary) => set({ showWeekSummary: true, weekSummary: summary }),
  closeSummary: () => set({ showWeekSummary: false }),
  selectProject: (id) => set({ selectedProjectId: id }),
  selectTalent: (id) => set({ selectedTalentId: id }),
}));
