import { create } from "zustand";
import type { CastingConstraintOption } from "@/engine/types/casting.types";
import type { WeekSummary } from "@/engine/types/engine.types";
import type { Award } from "@/engine/types";
import type { RebootProposal } from "@/engine/systems/ip/ipRebootEngine";
import type { FestivalAuctionResult } from "@/engine/systems/festivals/festivalAuctionEngine";

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
  | "CASTING_CONSTRAINT"
  | "ACQUISITION_CONFIRM";

/**
 * Payload shapes emitted for each modal type. Modal components narrow these
 * further with local casts where the payload carries engine entities.
 */
export interface ModalPayloadMap {
  CRISIS: { projectId?: string; crisis?: unknown; id?: string };
  AWARDS: { week?: number; year?: number; awards: Award[]; body?: string };
  SUMMARY: WeekSummary;
  GAME_OVER: { reason?: string; cashDeficit?: number };
  RELEASE_STRATEGY: { projectId: string; projectTitle?: string };
  POST_PRODUCTION: { projectId?: string; projectTitle?: string };
  ACHIEVEMENT_UNLOCKED: {
    achievementId: string;
    name: string;
    description: string;
    week: number;
  };
  FESTIVAL_MARKET: { results: FestivalAuctionResult[]; festivalBody?: string; week?: number };
  PACKAGE_DEAL_OFFERED: Record<string, unknown>;
  DIRECTORS_CUT_AVAILABLE: { projectId: string; projectTitle?: string };
  UPFRONTS: { results: unknown[]; week?: number };
  BIDDING_WAR: {
    attackerId?: string;
    attackerName?: string;
    targetId?: string;
    targetName?: string;
    offerAmount?: number;
    week?: number;
  };
  BREAKOUT_BIDDING_WAR: {
    talentId: string;
    currentFee?: number;
    competingStudios?: string[];
  };
  REBOOT_OPPORTUNITY: RebootProposal;
  DISTRESSED_ASSET_OFFER: { offerId: string };
  GREENLIGHT_DECISION: { projectId: string };
  CASTING_CONSTRAINT: {
    violationId: string;
    projectId: string;
    talentId: string;
    options: CastingConstraintOption[];
  };
  ACQUISITION_CONFIRM: { targetId: string };
}

export type ModalPayload = ModalPayloadMap[ModalType];

let modalIdCounter = 0;

/** Discriminated on `type` — `activeModal.type === "X"` narrows `payload`. */
export type QueuedModal = {
  [K in ModalType]: { id: string; type: K; payload: ModalPayloadMap[K] };
}[ModalType];

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
  activeSubTab: string | null;
  showQuickActions: boolean;
  showCreateProject: boolean;
  showPitchProject: boolean;
  pitchingProjectId: string | null;

  // Modal Queue System
  modalQueue: QueuedModal[];
  activeModal: QueuedModal | null;
  enqueueModal: <T extends ModalType>(type: T, payload: ModalPayloadMap[T]) => void;
  resolveCurrentModal: () => void;

  // Settings modal (Plan 4)
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;

  selectedProjectId: string | null;
  selectedTalentId: string | null;
  selectedRivalId: string | null;
  setActiveTab: (tab: TabId) => void;
  setActiveHub: (hub: string) => void;
  setActiveSubTab: (tab: string) => void;
  toggleQuickActions: () => void;
  openCreateProject: () => void;
  closeCreateProject: () => void;
  openPitchProject: (projectId: string) => void;
  closePitchProject: () => void;
  selectProject: (id: string | null) => void;
  selectTalent: (id: string | null) => void;
  selectRival: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: "command",
  activeHub: "studio",
  activeSubTab: null,
  showQuickActions: false,
  showCreateProject: false,
  showPitchProject: false,
  pitchingProjectId: null,

  modalQueue: [],
  activeModal: null,
  showSettings: false,
  setShowSettings: (v) => set({ showSettings: v }),

  enqueueModal: (type, payload) => {
    const newModal = {
      id: `modal-${modalIdCounter++}`,
      type,
      payload,
    } as QueuedModal;
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

  selectedProjectId: null,
  selectedTalentId: null,
  selectedRivalId: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveHub: (hub) => set({ activeHub: hub }),
  setActiveSubTab: (tab) => set({ activeSubTab: tab }),
  toggleQuickActions: () => set((s) => ({ showQuickActions: !s.showQuickActions })),
  openCreateProject: () => set({ showCreateProject: true }),
  closeCreateProject: () => set({ showCreateProject: false }),
  openPitchProject: (projectId) => set({ showPitchProject: true, pitchingProjectId: projectId }),
  closePitchProject: () => set({ showPitchProject: false, pitchingProjectId: null }),
  selectProject: (id) => set({ selectedProjectId: id }),
  selectTalent: (id) => set({ selectedTalentId: id }),
  selectRival: (id) =>
    set({ selectedRivalId: id, activeTab: "industry", activeHub: "intelligence" }),
}));
