export interface ElectronAPI {
  // File system operations
  saveGame: (slot: number, state: unknown) => Promise<boolean>;
  loadGame: (slot: number) => Promise<unknown | null>;
  listSaves: () => Promise<number[]>;
  deleteSave: (slot: number) => Promise<boolean>;
  exportSave: (slot: number) => Promise<boolean>;
  importSave: () => Promise<unknown | null>;

  // electron-store operations
  store: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<boolean>;
    delete: (key: string) => Promise<boolean>;
  };

  // Native notifications
  showNotification: (options: NotificationOptions) => Promise<boolean>;

  // Window controls
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;

  // Worker operations
  initGame: (studioName: string, archetype: string, seed: number) => Promise<unknown | null>;
  advanceWeek: (state: unknown) => Promise<unknown | null>;

  // App info
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
