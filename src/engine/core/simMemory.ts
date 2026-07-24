import type { GameState } from "../types";
import type { SimMemory } from "../types/state.types";

export const CURRENT_SAVE_VERSION = 2;

export function defaultSimMemory(): SimMemory {
  return {
    antitrust: { lastActionWeek: -9999 },
    distress: { negativeStreak: {}, lastActionWeek: {}, stageActionCount: {} },
    flops: {},
    headlessCashStreaks: {},
    eventLogs: {
      antitrust: [],
      distress: [],
      consolidation: [],
      shingle: [],
      pitch: [],
    },
    antitrustBlockList: [],
    headlineCounter: 0,
    lastProcessedTickCount: -1,
  };
}

export function getSimMemory(state: GameState): SimMemory {
  return state.simMemory ?? defaultSimMemory();
}
