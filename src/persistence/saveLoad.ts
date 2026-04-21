import { GameState, SaveSlotMeta } from '@/engine/types';
import { persistenceService } from './PersistenceService';

/**
 * High-level orchestration for Game State Persistence.
 * This bridges the UI/Store to the background Save Worker.
 */

export async function saveGame(slot: number, state: GameState): Promise<void> {
  try {
    // 1. Offload to background worker (OPFS)
    await persistenceService.save(slot, state);

    // 2. We skip synchronous metadata cache for now, or we could store it in OPFS too.
    console.log(`[SaveLoad] State saved to slot ${slot} via OPFS.`);
  } catch (e) {
    console.error('[SaveLoad] Failed to save game state', e);
  }
}

export async function loadGame(slot: number): Promise<GameState | null> {
  try {
    // 1. Fetch from background worker (OPFS)
    const state = await persistenceService.load(slot);
    if (!state) return null;

    console.log(`[SaveLoad] State loaded from slot ${slot} via OPFS.`);
    return state as GameState;
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
