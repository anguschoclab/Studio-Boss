"use strict";

const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // File system operations for save/load
  saveGame: (slot, state) => ipcRenderer.invoke("save-game", slot, state),
  loadGame: (slot) => ipcRenderer.invoke("load-game", slot),
  listSaves: () => ipcRenderer.invoke("list-saves"),
  deleteSave: (slot) => ipcRenderer.invoke("delete-save", slot),
  exportSave: (slot) => ipcRenderer.invoke("export-save", slot),
  importSave: () => ipcRenderer.invoke("import-save"),

  // electron-store for configuration persistence
  store: {
    get: (key) => ipcRenderer.invoke("store-get", key),
    set: (key, value) => ipcRenderer.invoke("store-set", key, value),
    delete: (key) => ipcRenderer.invoke("store-delete", key),
  },

  // Native notifications
  showNotification: (options) => ipcRenderer.invoke("show-notification", options),

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke("window-minimize"),
  maximizeWindow: () => ipcRenderer.invoke("window-maximize"),
  closeWindow: () => ipcRenderer.invoke("window-close"),

  // App info
  getVersion: () => ipcRenderer.invoke("get-version"),
  getPlatform: () => ipcRenderer.invoke("get-platform"),
});
