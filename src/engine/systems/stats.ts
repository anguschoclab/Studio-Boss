import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { UNSCRIPTED_FORMATS } from '@/engine/data/unscriptedFormats';

export function getFilmStats(tier: typeof BUDGET_TIERS[keyof typeof BUDGET_TIERS]) {
  return {
    budget: tier.budget,
    weeklyCost: tier.weeklyCost,
    developmentWeeks: tier.developmentWeeks,
    productionWeeks: tier.productionWeeks,
    renewable: false,
  };
}

export function getTvStats(tier: typeof BUDGET_TIERS[keyof typeof BUDGET_TIERS], tvFormatData: typeof TV_FORMATS[keyof typeof TV_FORMATS], episodes: number) {
  const weeklyCost = tier.weeklyCost * tvFormatData.productionCostMultiplier;
  const productionWeeks = Math.ceil(episodes * tvFormatData.productionWeeksPerEpisode);

  return {
    weeklyCost,
    productionWeeks,
    developmentWeeks: Math.ceil(tier.developmentWeeks * tvFormatData.developmentWeeksModifier),
    budget: weeklyCost * productionWeeks + (tier.budget * 0.2), // Rough budget estimate
    renewable: tvFormatData.renewable,
  };
}


export function getUnscriptedStats(tier: typeof BUDGET_TIERS[keyof typeof BUDGET_TIERS], unscriptedFormatData: typeof UNSCRIPTED_FORMATS[keyof typeof UNSCRIPTED_FORMATS], episodes: number) {
  const weeklyCost = tier.weeklyCost * unscriptedFormatData.productionCostMultiplier;
  const productionWeeks = Math.ceil(episodes * unscriptedFormatData.productionWeeksPerEpisode);

  return {
    weeklyCost,
    productionWeeks,
    developmentWeeks: Math.ceil(tier.developmentWeeks * unscriptedFormatData.developmentWeeksModifier),
    budget: weeklyCost * productionWeeks + (tier.budget * 0.1),
    renewable: unscriptedFormatData.renewable,
  };
}
