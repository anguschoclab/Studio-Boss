import { GameState, SaveSlotMeta } from '@/engine/types';

/**
 * High-level orchestration for Game State Persistence.
 * This bridges the UI/Store to Electron file system via IPC.
 */

declare global {
  interface Window {
    electronAPI?: {
      saveGame: (slot: number, state: GameState) => Promise<boolean>;
      loadGame: (slot: number) => Promise<GameState | null>;
      listSaves: () => Promise<number[]>;
      deleteSave: (slot: number) => Promise<boolean>;
      exportSave: (slot: number) => Promise<boolean>;
      importSave: () => Promise<GameState | null>;
      store: {
        get: (key: string) => Promise<unknown>;
        set: (key: string, value: unknown) => Promise<boolean>;
        delete: (key: string) => Promise<boolean>;
      };
      showNotification: (options: { title: string; body: string }) => Promise<boolean>;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      initGame: (studioName: string, archetype: string, seed: number) => Promise<unknown>;
      advanceWeek: (state: GameState) => Promise<unknown>;
      getVersion: () => Promise<string>;
      getPlatform: () => Promise<string>;
    };
  }
}

// Check if running in Electron environment
const isElectron = typeof window !== 'undefined' && 'electronAPI' in window;

export async function saveGame(slot: number, state: GameState): Promise<void> {
  try {
    if (isElectron && window.electronAPI) {
      // Use Electron IPC for file system operations
      const success = await window.electronAPI.saveGame(slot, state);
      if (!success) {
        throw new Error('Failed to save game via Electron IPC');
      }
    } else {
      // Fallback to OPFS for web version
      const { persistenceService } = await import('./PersistenceService');
      await persistenceService.save(slot, state);
    }
  } catch (e) {
    console.error('[SaveLoad] Failed to save game state', e);
  }
}

export async function loadGame(slot: number): Promise<GameState | null> {
  try {
    if (isElectron && window.electronAPI) {
      // Use Electron IPC for file system operations
      const state = await window.electronAPI.loadGame(slot);
      if (!state) return null;
      return state as GameState;
    } else {
      // Fallback to OPFS for web version
      const { persistenceService } = await import('./PersistenceService');
      const state = await persistenceService.load(slot);
      if (!state) return null;
      return state as GameState;
    }
  } catch (e) {
    console.error('[SaveLoad] Failed to load game state', e);
    return null;
  }
}

export interface SaveSlotInfo extends SaveSlotMeta {
  exists: boolean;
}

/**
 * Returns a preview of all available save slots.
 */
export async function getSaveSlots(): Promise<SaveSlotInfo[]> {
  const slots: SaveSlotInfo[] = [];

  for (let i = 0; i < 3; i++) {
    const state = await loadGame(i);
    if (state) {
      slots.push({
        slot: i,
        exists: true,
        studioName: state.studio.name || 'Active Game',
        archetype: state.studio.archetype || 'major',
        week: state.week || 1,
        cash: state.finance.cash || 0,
        timestamp: Date.now(), // ideally state.saveTimestamp
      });
    } else {
      slots.push({
        slot: i,
        exists: false,
        studioName: '',
        archetype: 'indie',
        week: 0,
        cash: 0,
        timestamp: 0,
      });
    }
  }

  return slots;
}
