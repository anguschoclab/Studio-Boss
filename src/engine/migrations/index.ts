import type { GameState } from "../types";
import { CURRENT_SAVE_VERSION, defaultSimMemory } from "../core/simMemory";

/**
 * Save normalization for current-version saves.
 *
 * Backward compatibility with old save versions is intentionally not
 * supported: saves older than CURRENT_SAVE_VERSION are rejected by the
 * caller, not upgraded. This function only stamps the current version and
 * backfills `simMemory` if absent (defensive default for partially written
 * states).
 */
export function migrateSave(raw: GameState): GameState {
  if ((raw.saveVersion ?? 0) !== CURRENT_SAVE_VERSION) {
    throw new Error(
      `Unsupported save version ${raw.saveVersion ?? "none"}; expected ${CURRENT_SAVE_VERSION}`
    );
  }
  if (raw.simMemory != null) return raw;
  return { ...raw, simMemory: defaultSimMemory() };
}
