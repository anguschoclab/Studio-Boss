/* eslint-disable @typescript-eslint/no-explicit-any */
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
    set((s) => {
      if (!s.gameState) return s;
      const next = executeAcquisition(s.gameState, targetId);
      return { gameState: next, finance: next.finance as any };
    });
  },

  corporateSabotage: (targetId) => {
    set((s) => {
      if (!s.gameState) return s;
      return { gameState: executeSabotage(s.gameState, targetId) };
    });
  },

  poachExec: (targetId) => {
    set((s) => {
      if (!s.gameState) return s;
      return { gameState: executePoach(s.gameState, targetId) };
    });
  },
});
