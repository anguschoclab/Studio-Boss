import { create } from 'zustand';
import { ModalType } from '@/engine/types';

export interface QueuedModal {
  id: string;
  type: ModalType;
  payload: Record<string, unknown> | null;
}

// New consolidated 4-Hub Navigation System
export type HubId = 'hq' | 'production' | 'talent' | 'intelligence';

// Sub-tabs for each hub
export type HQSubTab = 'overview' | 'operations' | 'strategy' | 'news';
export type ProductionSubTab = 'slate' | 'development' | 'distribution' | 'catalog';
export type TalentSubTab = 'roster' | 'marketplace' | 'negotiations' | 'agencies';
export type IntelligenceSubTab = 'rivals' | 'awards' | 'market' | 'financials';

export type SubTabId = HQSubTab | ProductionSubTab | TalentSubTab | IntelligenceSubTab;

// Legacy TabId for backward compatibility (maps to hubs)
export type TabId = HubId | 'command' | 'pipeline' | 'ip' | 'distribution' | 'talent' | 'finance' | 'trades' | 'industry' | 'awards';

interface UIStore {
  // New Hub Navigation
  activeHub: HubId;
  activeSubTab: SubTabId;
  setActiveHub: (hub: HubId, subTab?: SubTabId) => void;
  setActiveSubTab: (subTab: SubTabId) => void;
  
  // Legacy support (maps to hubs)
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  
  showCreateProject: boolean;
  showPitchProject: boolean;
  pitchingProjectId: string | null;
  showSummary: boolean;
  // Modal Queue System
  modalQueue: QueuedModal[];
  activeModal: QueuedModal | null;
  enqueueModal: (type: ModalType, payload: Record<string, unknown> | null) => void;
  resolveCurrentModal: () => void;
  
  selectedProjectId: string | null;
  selectedTalentId: string | null;
  openCreateProject: () => void;
  closeCreateProject: () => void;
  openPitchProject: (projectId: string) => void;
  closePitchProject: () => void;
  selectProject: (id: string | null) => void;
  selectTalent: (id: string | null) => void;
  openSummary: () => void;
  closeSummary: () => void;
  
  // Quick Actions Dock visibility
  showQuickActions: boolean;
  toggleQuickActions: () => void;
}

// Helper to map legacy tabs to new hub system
const mapLegacyTabToHub = (tab: TabId): { hub: HubId; subTab: SubTabId } => {
  switch (tab) {
    // HQ Hub
    case 'command':
    case 'hq':
      return { hub: 'hq', subTab: 'overview' };
    
    // Production Hub
    case 'pipeline':
    case 'production':
      return { hub: 'production', subTab: 'slate' };
    case 'ip':
      return { hub: 'production', subTab: 'catalog' };
    case 'distribution':
      return { hub: 'production', subTab: 'distribution' };
    
    // Talent Hub
    case 'talent':
      return { hub: 'talent', subTab: 'roster' };
    case 'trades':
      return { hub: 'talent', subTab: 'marketplace' };
    
    // Intelligence Hub
    case 'industry':
    case 'intelligence':
      return { hub: 'intelligence', subTab: 'rivals' };
    case 'awards':
      return { hub: 'intelligence', subTab: 'awards' };
    case 'finance':
      return { hub: 'intelligence', subTab: 'financials' };
    
    default:
      return { hub: 'hq', subTab: 'overview' };
  }
};

// Default sub-tabs for each hub
const getDefaultSubTab = (hub: HubId): SubTabId => {
  switch (hub) {
    case 'hq': return 'overview';
    case 'production': return 'slate';
    case 'talent': return 'roster';
    case 'intelligence': return 'rivals';
    default: return 'overview';
  }
};

export const useUIStore = create<UIStore>((set) => ({
  // New Hub Navigation (default to HQ)
  activeHub: 'hq',
  activeSubTab: 'overview',
  setActiveHub: (hub, subTab) => set({ 
    activeHub: hub, 
    activeSubTab: subTab || getDefaultSubTab(hub),
    activeTab: hub // Keep legacy in sync
  }),
  setActiveSubTab: (subTab) => set({ activeSubTab: subTab }),
  
  // Legacy Tab Support (maps to hubs)
  activeTab: 'hq',
  setActiveTab: (tab) => {
    const { hub, subTab } = mapLegacyTabToHub(tab);
    set({ activeTab: tab, activeHub: hub, activeSubTab: subTab });
  },
  
  showCreateProject: false,
  showPitchProject: false,
  pitchingProjectId: null,
  showSummary: false,
  showQuickActions: true,
  
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
  openCreateProject: () => set({ showCreateProject: true }),
  closeCreateProject: () => set({ showCreateProject: false }),
  openPitchProject: (projectId) => set({ showPitchProject: true, pitchingProjectId: projectId }),
  closePitchProject: () => set({ showPitchProject: false, pitchingProjectId: null }),
  selectProject: (id) => set({ selectedProjectId: id }),
  selectTalent: (id) => set({ selectedTalentId: id }),
  openSummary: () => set({ showSummary: true }),
  closeSummary: () => set({ showSummary: false }),
  toggleQuickActions: () => set((state) => ({ showQuickActions: !state.showQuickActions })),
}));
