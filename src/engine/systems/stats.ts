import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { UNSCRIPTED_FORMATS } from '@/engine/data/unscriptedFormats';

export function getFilmStats(tier: typeof BUDGET_TIERS[keyof typeof BUDGET_TIERS]) {
  // The Studio Comptroller: Increased extreme risk multiplier for $200M+ films (to 5.0), $100M+ films (to 2.5), and $50M+ films (to 1.2).
  const riskMultiplier = tier.budget >= 200_000_000 ? 5.0 : tier.budget >= 100_000_000 ? 2.5 : tier.budget >= 50_000_000 ? 1.2 : 1.0;

  return {
    budget: tier.budget,
    weeklyCost: tier.weeklyCost * riskMultiplier,
    developmentWeeks: Math.ceil(tier.developmentWeeks * riskMultiplier),
    productionWeeks: Math.ceil(tier.productionWeeks * riskMultiplier),
    renewable: false,
  };
}

export function getTvStats(tier: typeof BUDGET_TIERS[keyof typeof BUDGET_TIERS], tvFormatData: typeof TV_FORMATS[keyof typeof TV_FORMATS], episodes: number) {
  // The Studio Comptroller: Steeper scaling for mega-budget TV risks (e.g., 3.5x for >=150M, 2.8x for >=100M, and 1.8x for >50M).
  const scaleMultiplier = tier.budget >= 150_000_000 ? 3.5 : tier.budget >= 100_000_000 ? 2.8 : tier.budget > 50_000_000 ? 1.8 : 1.0;
  const weeklyCost = tier.weeklyCost * tvFormatData.productionCostMultiplier * scaleMultiplier;
  const productionWeeks = Math.ceil(episodes * tvFormatData.productionWeeksPerEpisode * scaleMultiplier);

  return {
    weeklyCost,
    productionWeeks,
    developmentWeeks: Math.ceil(tier.developmentWeeks * tvFormatData.developmentWeeksModifier * scaleMultiplier),
    // Increased base estimate multiplier (0.3 -> 0.4) for TV overhead logic, padding the upfront risk.
    budget: weeklyCost * productionWeeks + (tier.budget * 0.4),
    renewable: tvFormatData.renewable,
  };
}


export function getUnscriptedStats(tier: typeof BUDGET_TIERS[keyof typeof BUDGET_TIERS], unscriptedFormatData: typeof UNSCRIPTED_FORMATS[keyof typeof UNSCRIPTED_FORMATS], episodes: number) {
  // The Studio Comptroller: Increased scaling for massive unscripted logistics overhead (e.g., 3.0x for >=100M, 1.8x for >50M).
  const scaleMultiplier = tier.budget >= 100_000_000 ? 3.0 : tier.budget > 50_000_000 ? 1.8 : 1.0;
  const weeklyCost = tier.weeklyCost * unscriptedFormatData.productionCostMultiplier * scaleMultiplier;
  const productionWeeks = Math.ceil(episodes * unscriptedFormatData.productionWeeksPerEpisode);

  return {
    weeklyCost,
    productionWeeks,
    developmentWeeks: Math.ceil(tier.developmentWeeks * unscriptedFormatData.developmentWeeksModifier),
    // Added minor overhead buffer (0.15 -> 0.20) for large unscripted formats.
    budget: weeklyCost * productionWeeks + (tier.budget * 0.20),
    renewable: unscriptedFormatData.renewable,
  };
}
