import { GameState, SaveSlotMeta } from '@/engine/types';
import { z } from 'zod';

const SAVE_PREFIX = 'studioboss_save_';
const SLOTS_KEY = 'studioboss_slots';

const SaveSlotMetaSchema = z.object({
  slot: z.number(),
  studioName: z.string(),
  archetype: z.enum(['major', 'mid-tier', 'indie']),
  week: z.number(),
  cash: z.number(),
  timestamp: z.number(),
});

const SaveSlotsSchema = z.record(z.string().or(z.number()), SaveSlotMetaSchema);

function loadSaveSlots(): Record<number, SaveSlotMeta> {
  let slots: Record<number, SaveSlotMeta> = {};
  try {
    const slotsData = localStorage.getItem(SLOTS_KEY);
    if (slotsData) {
      const parsed = JSON.parse(slotsData);
      const result = SaveSlotsSchema.safeParse(parsed);
      if (result.success) {
        slots = result.data;
      } else {
        console.error('Invalid save slots metadata format:', result.error);
      }
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
      cash: state.finance.cash,
      timestamp: Date.now(),
    };

    localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  } catch (e) {
    console.error('Failed to save game state', e);
  }
}

const GameStatePartialSchema = z.object({
  week: z.number(),
  finance: z.object({
    cash: z.number(),
  }).passthrough(),
  studio: z.object({
    name: z.string(),
    archetype: z.enum(['major', 'mid-tier', 'indie']),
    prestige: z.number(),
  }).passthrough(),
}).passthrough();

export function loadGame(slot: number): GameState | null {
  try {
    const data = localStorage.getItem(`${SAVE_PREFIX}${slot}`);
    if (!data) return null;

    const parsed = JSON.parse(data);
    const result = GameStatePartialSchema.safeParse(parsed);

    if (result.success) {
      return parsed as GameState;
    } else {
      console.error('Invalid game state format:', result.error);
      return null;
    }
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
