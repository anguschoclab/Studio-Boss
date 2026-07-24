import type { GameState } from "../types";
import { CURRENT_SAVE_VERSION, defaultSimMemory } from "../core/simMemory";

interface Migration {
  toVersion: number;
  migrate: (state: GameState) => GameState;
}

const MIGRATIONS: Migration[] = [
  {
    toVersion: 2,
    migrate: (s) => ({ ...s, simMemory: s.simMemory ?? defaultSimMemory() }),
  },
];

export function migrateSave(raw: GameState): GameState {
  let state = raw;
  let version = raw.saveVersion ?? 1;
  for (const m of MIGRATIONS) {
    if (version < m.toVersion) {
      state = m.migrate(state);
      version = m.toVersion;
    }
  }
  if (state.saveVersion !== version) state = { ...state, saveVersion: version };
  return state;
}
