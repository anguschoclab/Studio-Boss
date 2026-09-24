import type {GameState} from "../types";
import type {SimMemory} from "../types/state.types";

export const CURRENT_SAVE_VERSION = 2;

export function defaultSimMemory(): SimMemory {
  return {
    antitrust: { lastActionWeek: -9999 },
    distress: { negativeStreak: {}, lastActionWeek: {}, stageActionCount: {} },
    flops: {},
    headlessCashStreaks: {},
    syndication: {},
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
  const mem = state.simMemory;
  if (!mem) return defaultSimMemory();
  const defaults = defaultSimMemory();
  return {
    ...defaults,
    ...mem,
    antitrust: { ...defaults.antitrust, ...mem.antitrust },
    distress: { ...defaults.distress, ...mem.distress },
    eventLogs: { ...defaults.eventLogs, ...mem.eventLogs },
  };
}
