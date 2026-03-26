import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { UNSCRIPTED_FORMATS } from '@/engine/data/unscriptedFormats';

export function getFilmStats(tier: typeof BUDGET_TIERS[keyof typeof BUDGET_TIERS]) {
  // The Studio Comptroller: Increased extreme risk multiplier for $250M+ films (2.0 to 2.5) and $100M+ films (1.35 to 1.5). Megabudget logistical failures should break studios, not just sting.
  const riskMultiplier = tier.budget >= 250_000_000 ? 2.5 : tier.budget >= 100_000_000 ? 1.5 : 1.0;

  return {
    budget: tier.budget,
    weeklyCost: tier.weeklyCost * riskMultiplier,
    developmentWeeks: Math.ceil(tier.developmentWeeks * riskMultiplier),
    productionWeeks: Math.ceil(tier.productionWeeks * riskMultiplier),
    renewable: false,
  };
}

export function getTvStats(tier: typeof BUDGET_TIERS[keyof typeof BUDGET_TIERS], tvFormatData: typeof TV_FORMATS[keyof typeof TV_FORMATS], episodes: number) {
  // The Studio Comptroller: Steeper scaling for mega-budget TV risks (e.g., 2.0x for >=100M, up from 1.8x, and 1.5x for >50M) to punish excessive streamer spending sprees.
  const scaleMultiplier = tier.budget >= 100_000_000 ? 2.0 : tier.budget > 50_000_000 ? 1.5 : 1.0;
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
  // The Studio Comptroller: Increased scaling for massive unscripted logistics overhead (e.g., 2.0x for >=100M, up from 1.7x, and 1.5x for >50M) simulating complex location hazards.
  const scaleMultiplier = tier.budget >= 100_000_000 ? 2.0 : tier.budget > 50_000_000 ? 1.5 : 1.0;
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
