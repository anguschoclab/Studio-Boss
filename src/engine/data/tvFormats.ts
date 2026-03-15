import { TvFormatKey } from '../types';

export interface TvFormatData {
  key: TvFormatKey;
  name: string;
  defaultEpisodes: number;
  minEpisodes: number;
  maxEpisodes: number;
  productionCostMultiplier: number; // Modifies base weekly cost
  developmentWeeksModifier: number; // Multiplier
  productionWeeksPerEpisode: number;
  renewable: boolean;
  revenueDecayBinge: number; // Weekly revenue multiplier after drop (e.g. 0.4 = rapid decay)
  revenueDecayWeekly: number; // Weekly revenue multiplier during run (e.g. 0.85 = slow decay)
}

export const TV_FORMATS: Record<TvFormatKey, TvFormatData> = {
  sitcom: {
    key: 'sitcom',
    name: 'Half-Hour Sitcom',
    defaultEpisodes: 22,
    minEpisodes: 6,
    maxEpisodes: 24,
    productionCostMultiplier: 0.6,
    developmentWeeksModifier: 1.0,
    productionWeeksPerEpisode: 0.8,
    renewable: true,
    revenueDecayBinge: 0.5,
    revenueDecayWeekly: 0.9,
  },
  procedural: {
    key: 'procedural',
    name: 'One-Hour Procedural',
    defaultEpisodes: 22,
    minEpisodes: 10,
    maxEpisodes: 24,
    productionCostMultiplier: 0.8,
    developmentWeeksModifier: 1.0,
    productionWeeksPerEpisode: 1.2,
    renewable: true,
    revenueDecayBinge: 0.45,
    revenueDecayWeekly: 0.95,
  },
  prestige_drama: {
    key: 'prestige_drama',
    name: 'Prestige Serial Drama',
    defaultEpisodes: 10,
    minEpisodes: 6,
    maxEpisodes: 13,
    productionCostMultiplier: 1.5,
    developmentWeeksModifier: 1.5,
    productionWeeksPerEpisode: 1.8,
    renewable: true,
    revenueDecayBinge: 0.35,
    revenueDecayWeekly: 0.85,
  },
  limited_series: {
    key: 'limited_series',
    name: 'Limited Series / Miniseries',
    defaultEpisodes: 8,
    minEpisodes: 4,
    maxEpisodes: 10,
    productionCostMultiplier: 1.4,
    developmentWeeksModifier: 1.2,
    productionWeeksPerEpisode: 1.5,
    renewable: false,
    revenueDecayBinge: 0.3,
    revenueDecayWeekly: 0.8,
  },
  animated_comedy: {
    key: 'animated_comedy',
    name: 'Animated Comedy',
    defaultEpisodes: 13,
    minEpisodes: 8,
    maxEpisodes: 22,
    productionCostMultiplier: 0.7,
    developmentWeeksModifier: 2.0,
    productionWeeksPerEpisode: 1.5, // Takes longer to produce animation
    renewable: true,
    revenueDecayBinge: 0.55,
    revenueDecayWeekly: 0.92,
  },
  animated_prestige: {
    key: 'animated_prestige',
    name: 'Adult Animation / Prestige',
    defaultEpisodes: 10,
    minEpisodes: 6,
    maxEpisodes: 13,
    productionCostMultiplier: 0.9,
    developmentWeeksModifier: 2.2,
    productionWeeksPerEpisode: 1.8,
    renewable: true,
    revenueDecayBinge: 0.5,
    revenueDecayWeekly: 0.9,
  },
};
