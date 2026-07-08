import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Difficulty = 'relaxed' | 'standard' | 'cutthroat';
export type AutosaveFrequency = 'weekly' | 'off';

export interface DifficultyParams {
  /** Multiplier applied to macro market heat (higher = more volatile). */
  heatMultiplier: number;
  /** Additive bias to budget inflation (higher = steeper cost curve). */
  inflationBias: number;
}

/**
 * Maps a difficulty to macro tuning params. Relaxed softens the boom/bust
 * cycle and inflation; cutthroat amplifies both (Design Bible §30.29 / §33.3).
 */
export function getDifficultyParams(difficulty: Difficulty): DifficultyParams {
  switch (difficulty) {
    case 'relaxed':
      return { heatMultiplier: 0.8, inflationBias: -0.01 };
    case 'cutthroat':
      return { heatMultiplier: 1.25, inflationBias: 0.01 };
    case 'standard':
    default:
      return { heatMultiplier: 1.0, inflationBias: 0.0 };
  }
}

interface SettingsState {
  reduceMotion: boolean;
  autosaveFrequency: AutosaveFrequency;
  difficulty: Difficulty;
  // Studio policy toggles (Design Bible §30.29)
  allowVanityAttachments: boolean;
  capOverheadDeals: boolean;
  preferExternalWriters: boolean;
  requireVeteranShowrunner: boolean;
  autoFlagNepotism: boolean;
  allowAuteurPackages: boolean;
  prioritizeOrbitStaffing: boolean;

  setReduceMotion: (v: boolean) => void;
  setAutosaveFrequency: (v: AutosaveFrequency) => void;
  setDifficulty: (v: Difficulty) => void;
  setPolicy: (key: PolicyKey, v: boolean) => void;
}

export type PolicyKey =
  | 'allowVanityAttachments'
  | 'capOverheadDeals'
  | 'preferExternalWriters'
  | 'requireVeteranShowrunner'
  | 'autoFlagNepotism'
  | 'allowAuteurPackages'
  | 'prioritizeOrbitStaffing';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      reduceMotion: false,
      autosaveFrequency: 'weekly',
      difficulty: 'standard',
      allowVanityAttachments: false,
      capOverheadDeals: false,
      preferExternalWriters: false,
      requireVeteranShowrunner: false,
      autoFlagNepotism: false,
      allowAuteurPackages: false,
      prioritizeOrbitStaffing: false,

      setReduceMotion: (v) => set({ reduceMotion: v }),
      setAutosaveFrequency: (v) => set({ autosaveFrequency: v }),
      setDifficulty: (v) => set({ difficulty: v }),
      setPolicy: (key, v) => set({ [key]: v } as Partial<SettingsState>),
    }),
    {
      name: 'studio-boss-settings',
    }
  )
);
