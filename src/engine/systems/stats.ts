import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { UNSCRIPTED_FORMATS } from '@/engine/data/unscriptedFormats';

export function getFilmStats(tier: typeof BUDGET_TIERS[keyof typeof BUDGET_TIERS]) {
  // The Studio Comptroller: Further increased risk multipliers for high-budget films to 8.0 to make tentpoles genuinely risky and punish bloat.
  const riskMultiplier = tier.budget >= 200_000_000 ? 8.0 : tier.budget >= 100_000_000 ? 2.5 : tier.budget >= 50_000_000 ? 1.5 : 1.0;

  return {
    budget: tier.budget,
    weeklyCost: tier.weeklyCost * riskMultiplier,
    developmentWeeks: Math.ceil(tier.developmentWeeks * riskMultiplier),
    productionWeeks: Math.ceil(tier.productionWeeks * riskMultiplier),
    renewable: false,
  };
}

export function getTvStats(tier: typeof BUDGET_TIERS[keyof typeof BUDGET_TIERS], tvFormatData: typeof TV_FORMATS[keyof typeof TV_FORMATS], episodes: number) {
  // The Studio Comptroller: Increased TV scaling (up to 5.0) to add more risk to prestige and blockbuster television.
  const scaleMultiplier = tier.budget >= 150_000_000 ? 5.0 : tier.budget >= 100_000_000 ? 2.5 : tier.budget >= 50_000_000 ? 1.5 : 1.0;
  const weeklyCost = tier.weeklyCost * tvFormatData.productionCostMultiplier * scaleMultiplier;
  const productionWeeks = Math.ceil(episodes * tvFormatData.productionWeeksPerEpisode * scaleMultiplier);

  return {
    weeklyCost,
    productionWeeks,
    developmentWeeks: Math.ceil(tier.developmentWeeks * tvFormatData.developmentWeeksModifier * scaleMultiplier),
    // The Studio Comptroller: Increased base estimate multiplier (0.6 -> 0.75) for TV overhead logic, padding the upfront risk.
    budget: weeklyCost * productionWeeks + (tier.budget * 0.75),
    renewable: tvFormatData.renewable,
  };
}


export function getUnscriptedStats(tier: typeof BUDGET_TIERS[keyof typeof BUDGET_TIERS], unscriptedFormatData: typeof UNSCRIPTED_FORMATS[keyof typeof UNSCRIPTED_FORMATS], episodes: number) {
  // The Studio Comptroller: Increased scale multiplier to 3.0 for large unscripted formats to reflect bloated modern reality TV costs.
  const scaleMultiplier = tier.budget >= 100_000_000 ? 3.0 : tier.budget >= 50_000_000 ? 1.5 : 1.0;
  const weeklyCost = tier.weeklyCost * unscriptedFormatData.productionCostMultiplier * scaleMultiplier;
  const productionWeeks = Math.ceil(episodes * unscriptedFormatData.productionWeeksPerEpisode);

  return {
    weeklyCost,
    productionWeeks,
    developmentWeeks: Math.ceil(tier.developmentWeeks * unscriptedFormatData.developmentWeeksModifier),
    // The Studio Comptroller: Added minor overhead buffer (0.20 -> 0.25) for large unscripted formats.
    budget: weeklyCost * productionWeeks + (tier.budget * 0.25),
    renewable: unscriptedFormatData.renewable,
  };
}
