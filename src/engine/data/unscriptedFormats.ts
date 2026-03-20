import { UnscriptedFormatKey } from '../types';

interface UnscriptedFormatData {
  key: UnscriptedFormatKey;
  name: string;
  defaultEpisodes: number;
  minEpisodes: number;
  maxEpisodes: number;
  productionCostMultiplier: number; // Modifies base weekly cost
  developmentWeeksModifier: number; // Multiplier
  productionWeeksPerEpisode: number;
  renewable: boolean;
  revenueDecayBinge: number;
  revenueDecayWeekly: number;
}

export const UNSCRIPTED_FORMATS: Record<UnscriptedFormatKey, UnscriptedFormatData> = {
  competition: {
    key: 'competition',
    name: 'Competition Reality',
    defaultEpisodes: 10,
    minEpisodes: 6,
    maxEpisodes: 16,
    productionCostMultiplier: 0.5,
    developmentWeeksModifier: 0.5,
    productionWeeksPerEpisode: 0.6,
    renewable: true,
    revenueDecayBinge: 0.6,
    revenueDecayWeekly: 0.85,
  },
  docuseries: {
    key: 'docuseries',
    name: 'Docuseries',
    defaultEpisodes: 6,
    minEpisodes: 2,
    maxEpisodes: 10,
    productionCostMultiplier: 0.4,
    developmentWeeksModifier: 0.8,
    productionWeeksPerEpisode: 1.0,
    renewable: false, // Usually limited, but can have sequels. Keep it simple.
    revenueDecayBinge: 0.5,
    revenueDecayWeekly: 0.8,
  },
  reality_ensemble: {
    key: 'reality_ensemble',
    name: 'Ensemble Reality / Housewives',
    defaultEpisodes: 12,
    minEpisodes: 8,
    maxEpisodes: 20,
    productionCostMultiplier: 0.3,
    developmentWeeksModifier: 0.4,
    productionWeeksPerEpisode: 0.5,
    renewable: true,
    revenueDecayBinge: 0.55,
    revenueDecayWeekly: 0.9,
  },
  game_show: {
    key: 'game_show',
    name: 'Game Show / Quiz',
    defaultEpisodes: 20,
    minEpisodes: 10,
    maxEpisodes: 40,
    productionCostMultiplier: 0.2, // Very cheap
    developmentWeeksModifier: 0.3,
    productionWeeksPerEpisode: 0.2, // Shoot 5 a day
    renewable: true,
    revenueDecayBinge: 0.4,
    revenueDecayWeekly: 0.95, // Consistent syndication
  },
  lifestyle: {
    key: 'lifestyle',
    name: 'Lifestyle / Makeover / Food',
    defaultEpisodes: 13,
    minEpisodes: 6,
    maxEpisodes: 24,
    productionCostMultiplier: 0.25,
    developmentWeeksModifier: 0.4,
    productionWeeksPerEpisode: 0.4,
    renewable: true,
    revenueDecayBinge: 0.45,
    revenueDecayWeekly: 0.9,
  },
};
