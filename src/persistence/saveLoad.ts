import { GameState, SaveSlotMeta } from '@/engine/types/index';

const SAVE_PREFIX = 'studioboss_save_';
const SLOTS_KEY = 'studioboss_slots';

function loadSaveSlots(): Record<number, SaveSlotMeta> {
  let slots: Record<number, SaveSlotMeta> = {};
  try {
    const slotsData = localStorage.getItem(SLOTS_KEY);
    if (slotsData) {
      slots = JSON.parse(slotsData);
    }
  } catch (e) {
    console.error('Failed to load save slots metadata', e);
  }
  return slots;
}

export function saveGame(slot: number, state: GameState): void {
  try {
    localStorage.setItem(`${SAVE_PREFIX}${slot}`, JSON.stringify(state));

    const slots = loadSaveSlots();

    slots[slot] = {
      slot,
      studioName: state.studio.name,
      archetype: state.studio.archetype,
      week: state.week,
      cash: state.cash,
      timestamp: Date.now(),
    };

    localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  } catch (e) {
    console.error('Failed to save game state', e);
  }
}

export function loadGame(slot: number): GameState | null {
  try {
    const data = localStorage.getItem(`${SAVE_PREFIX}${slot}`);
    if (!data) return null;
    return JSON.parse(data) as GameState;
  } catch (e) {
    console.error('Failed to load game state', e);
    return null;
  }
}

export interface SaveSlotInfo extends SaveSlotMeta {
  exists: boolean;
}

export function getSaveSlots(): SaveSlotInfo[] {
  const slots = loadSaveSlots();

  return [0, 1, 2].map(i => ({
    slot: i,
    exists: !!slots[i],
    studioName: slots[i]?.studioName || '',
    archetype: slots[i]?.archetype || 'indie',
    week: slots[i]?.week || 0,
    cash: slots[i]?.cash || 0,
    timestamp: slots[i]?.timestamp || 0,
  }));
}
