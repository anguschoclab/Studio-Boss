import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { UNSCRIPTED_FORMATS } from '@/engine/data/unscriptedFormats';

export function getFilmStats(tier: typeof BUDGET_TIERS[keyof typeof BUDGET_TIERS]) {
  // Severe scaling for megabudgets to increase risk of astronomical costs
  const riskMultiplier = tier.budget >= 200_000_000 ? 1.5 : tier.budget >= 100_000_000 ? 1.25 : 1.0;

  return {
    budget: tier.budget,
    weeklyCost: tier.weeklyCost * riskMultiplier,
    developmentWeeks: Math.ceil(tier.developmentWeeks * riskMultiplier),
    productionWeeks: Math.ceil(tier.productionWeeks * riskMultiplier),
    renewable: false,
  };
}

export function getTvStats(tier: typeof BUDGET_TIERS[keyof typeof BUDGET_TIERS], tvFormatData: typeof TV_FORMATS[keyof typeof TV_FORMATS], episodes: number) {
  // Steep scaling for mega-budget TV risks
  const scaleMultiplier = tier.budget >= 100_000_000 ? 1.5 : tier.budget > 50_000_000 ? 1.3 : 1.0;
  const weeklyCost = tier.weeklyCost * tvFormatData.productionCostMultiplier * scaleMultiplier;
  const productionWeeks = Math.ceil(episodes * tvFormatData.productionWeeksPerEpisode * scaleMultiplier);

  return {
    weeklyCost,
    productionWeeks,
    developmentWeeks: Math.ceil(tier.developmentWeeks * tvFormatData.developmentWeeksModifier * scaleMultiplier),
    // Increased base estimate multiplier (0.2 -> 0.3) for TV overhead logic, padding the upfront risk.
    budget: weeklyCost * productionWeeks + (tier.budget * 0.3),
    renewable: tvFormatData.renewable,
  };
}


export function getUnscriptedStats(tier: typeof BUDGET_TIERS[keyof typeof BUDGET_TIERS], unscriptedFormatData: typeof UNSCRIPTED_FORMATS[keyof typeof UNSCRIPTED_FORMATS], episodes: number) {
  // Progressive scaling for massive unscripted logisitics overhead
  const scaleMultiplier = tier.budget >= 100_000_000 ? 1.4 : tier.budget > 50_000_000 ? 1.2 : 1.0;
  const weeklyCost = tier.weeklyCost * unscriptedFormatData.productionCostMultiplier * scaleMultiplier;
  const productionWeeks = Math.ceil(episodes * unscriptedFormatData.productionWeeksPerEpisode);

  return {
    weeklyCost,
    productionWeeks,
    developmentWeeks: Math.ceil(tier.developmentWeeks * unscriptedFormatData.developmentWeeksModifier),
    // Added minor overhead buffer (0.1 -> 0.15) for large unscripted formats.
    budget: weeklyCost * productionWeeks + (tier.budget * 0.15),
    renewable: unscriptedFormatData.renewable,
  };
}
