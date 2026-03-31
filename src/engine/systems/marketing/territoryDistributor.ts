import { MarketingCampaign, BoxOfficeResult } from '../../types';

export function calculateTerritorySplit(
  baseGross: number,
  campaign: MarketingCampaign,
  genre: string
): BoxOfficeResult {
  const { domesticBudget, foreignBudget } = campaign;
  const totalBudget = domesticBudget + foreignBudget;

  const domesticWeight = domesticBudget / Math.max(1, totalBudget);
  const foreignWeight = foreignBudget / Math.max(1, totalBudget);

  // Genre skews (e.g., Action/Sci-Fi performs better foreign, Drama/Comedy domestic)
  let genreDomesticSkew = 0.5;
  const g = genre.toUpperCase();

  if (['ACTION', 'SCI-FI', 'ANIMATION'].includes(g)) {
    genreDomesticSkew = 0.4; // 60% foreign base
  } else if (['DRAMA', 'COMEDY', 'ROMANCE'].includes(g)) {
    genreDomesticSkew = 0.65; // 35% foreign base
  }

  // Combined Weight (Budget is more impactful than base genre skew)
  const finalDomesticPct = (domesticWeight * 0.6) + (genreDomesticSkew * 0.4);
  const finalForeignPct = 1 - finalDomesticPct;

  const totalDomestic = baseGross * finalDomesticPct;
  const totalForeign = baseGross * finalForeignPct;

  return {
    openingWeekendDomestic: totalDomestic * 0.35,
    openingWeekendForeign: totalForeign * 0.35,
    totalDomestic,
    totalForeign,
    multiplier: finalForeignPct / 0.5 // Relative foreign strength factor
  };
}
