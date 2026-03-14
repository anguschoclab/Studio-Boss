import { GameState, SaveSlotMeta } from '@/engine/types';

const SAVE_PREFIX = 'studioboss_save_';
const SLOTS_KEY = 'studioboss_slots';

export function saveGame(slot: number, state: GameState): void {
  localStorage.setItem(`${SAVE_PREFIX}${slot}`, JSON.stringify(state));
  const slots: Record<number, SaveSlotMeta> = JSON.parse(localStorage.getItem(SLOTS_KEY) || '{}');
  slots[slot] = {
    slot,
    studioName: state.studio.name,
    archetype: state.studio.archetype,
    week: state.week,
    cash: state.cash,
    timestamp: Date.now(),
  };
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
}

export function loadGame(slot: number): GameState | null {
  const data = localStorage.getItem(`${SAVE_PREFIX}${slot}`);
  if (!data) return null;
  try {
    return JSON.parse(data) as GameState;
  } catch {
    return null;
  }
}

export interface SaveSlotInfo extends SaveSlotMeta {
  exists: boolean;
}

export function getSaveSlots(): SaveSlotInfo[] {
  const slots: Record<number, SaveSlotMeta> = JSON.parse(localStorage.getItem(SLOTS_KEY) || '{}');
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
