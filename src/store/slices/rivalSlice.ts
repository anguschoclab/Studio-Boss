import { StateCreator } from "zustand";
import { GameStore } from "../gameStore";
import {
  executeAcquisition,
  executeSabotage,
  executePoach,
  evaluatePlayerAcquisition,
  type AcquisitionPreview,
} from "@/engine/systems/mergers";

export interface RivalSlice {
  previewAcquisition: (targetId: string) => AcquisitionPreview | null;
  acquireRival: (targetId: string) => void;
  corporateSabotage: (targetId: string) => void;
  poachExec: (targetId: string) => void;
}

export const createRivalSlice: StateCreator<GameStore, [], [], RivalSlice> = (set, get) => ({
  previewAcquisition: (targetId) => {
    const state = get().gameState;
    if (!state) return null;
    return evaluatePlayerAcquisition(state, targetId);
  },

  acquireRival: (targetId) => {
    const s = get();
    if (!s.gameState) return;
    const result = executeAcquisition(s.gameState, targetId);
    set({ gameState: result.state, finance: result.state.finance as unknown as import("@/engine/types").FinanceState });
    if (result.newsEvents.length > 0) {
      get().appendNewsEvents(result.newsEvents);
    }
  },

  corporateSabotage: (targetId) => {
    set((s) => {
      if (!s.gameState) return s;
      return { gameState: executeSabotage(s.gameState, targetId) };
    });
  },

  poachExec: (targetId) => {
    const s = get();
    if (!s.gameState) return;
    const result = executePoach(s.gameState, targetId);
    set({ gameState: result.state });
    if (result.newsEvents.length > 0) {
      get().appendNewsEvents(result.newsEvents);
    }
  },
});
