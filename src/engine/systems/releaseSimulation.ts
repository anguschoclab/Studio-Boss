/* eslint-disable @typescript-eslint/no-explicit-any */
import { Project, Talent, ActiveCrisis, MarketingCampaign } from "@/engine/types";import { randRange, clamp } from "../utils";
import { evaluateMarketingEfficiency } from "./marketing/efficiencyEvaluator";
import { calculateTerritorySplit } from "./marketing/territoryDistributor";
import { getMarketHeat } from "./industry/MacroCycle";
/**
 * Phase 3 & 4 Orchestrator for Release Simulation.
 * Handles Reviews, Opening Weekends, and Territory Distribution.
 */

/**
 * Studio share of theatrical gross across the release window.
 * Opening week 55%, weeks 2-4 taper 45%, weeks 5+ tail 40%.
 * Input is the opening-weekend gross; returns the modeled studio-share total
 * across the full theatrical run, applied to domestic+foreign combined.
 */
export function applyTheatricalSplit(openingGross: number): number {
  const week1 = openingGross * 0.55;
  const weeks2to4 = openingGross * 0.6 * 0.45;
  const weeks5plus = openingGross * 0.3 * 0.4;
  return week1 + weeks2to4 + weeks5plus;
}

export function calculateReviewScore(
  project: Project,
  attachedTalent: Talent[],
  crises: ActiveCrisis | null | undefined
): number {
  let baseScore = project.quality || project.momentum || randRange(40, 70);

  // 1. Talent Prestige Bonus & Director Modifier
  if (attachedTalent.length > 0) {
    const talentBonus =
      (attachedTalent.reduce((sum, t) => sum + t.prestige, 0) / attachedTalent.length) * 0.3;
    baseScore += talentBonus;

    // Director Modifier
    const director = attachedTalent.find(
      (t) => t.roles?.includes("director") || t.role === "director"
    );
    if (director) {
      baseScore += (director.prestige - 50) / 5;
    }
  }

  // 2. Production Crises Penalty
  if (crises) {
    baseScore -= randRange(10, 25);
  }

  // 3. Buzz Alignment (Expectation vs Reality)
  if (project.buzz > 80) {
    baseScore += randRange(5, 12);
  } else if (project.buzz < 30) {
    baseScore -= randRange(5, 12);
  }

  // 4. Indie Bias
  if (project.budgetTier === "indie" || project.budgetTier === "low") {
    baseScore += 5;
  }

  return clamp(Math.round(baseScore + randRange(-8, 8)), 1, 100);
}

export function checkCultPotential(
  project: Project,
  metaScore: number,
  audienceScore: number
): boolean {
  const revenue = project.revenue || 0;
  const budget = project.budget || 1;
  const genre = (project.genre || "").toLowerCase();

  const isGenreMatch = genre.includes("sci-fi") || genre.includes("horror");
  const isFinancialFailure = revenue < budget * 0.8;
  const isAudienceDisparity = audienceScore > metaScore + 30;

  return isFinancialFailure && isAudienceDisparity && isGenreMatch;
}

export function calculateOpeningWeekend(
  project: Project,
  attachedTalent: Talent[],
  studioPrestige: number,
  franchiseSynergy: number = 1.0,
  franchiseFatigue: number = 0,
  currentWeek: number = 0
): { project: Project; feedback: string } {
  // If no campaign, it's a "silent release" - very poor performance
  const campaign =
    project.marketingCampaign ||
    ({
      primaryAngle: "GRASSROOTS",
      domesticBudget: 0,
      foreignBudget: 0,
      weeksInMarketing: 0,
    } as MarketingCampaign);

  // 1. Calculate Base Potential (based on Buzz and Talent Draw)
  const talentDraw =
    attachedTalent.reduce((sum, t) => sum + t.draw, 0) / (attachedTalent.length || 1);
  const buzzFactor = project.buzz / 50;
  const prestigeFactor = 0.8 + studioPrestige / 200;

  // Base potential: tighter distribution to match real industry (~40-55% profit theatrically)
  const basePotential = project.budget * 1.9 * buzzFactor * prestigeFactor * (1 + talentDraw / 100);
  const randomFactor = randRange(0.35, 1.9);

  let effectiveGross = basePotential * randomFactor * franchiseSynergy; // Apply Halo Effect
  effectiveGross *= 1 - franchiseFatigue; // Apply Fatigue Penalty

  // Apply Release Strategy Multiplier if set
  if ((project as any).releaseStrategyMultiplier) {
    effectiveGross *= (project as any).releaseStrategyMultiplier;
  }

  // Macro cycle: industry-wide boom/bust + shocks modulate gross
  const heat = getMarketHeat(currentWeek);
  effectiveGross *= heat;

  // 2. Apply Marketing Efficiency
  const { multiplier, feedbackText } = evaluateMarketingEfficiency(project, campaign);
  effectiveGross *= multiplier;

  // 2.1 Apply accrued awareness from the weekly marketing loop (MarketingSystem).
  // Awareness 0 → 0.5x floor; awareness 100 → 1.0x. This closes the loop the
  // old release-only multiplier left open: sustained campaigns now pay off.
  const awareness = campaign?.awareness ?? project.awareness ?? 0;
  effectiveGross *= 0.5 + awareness / 200;

  // 2.5. Apply Genre-Specific Multiplier based on real-life profitability data
  // Research shows Adventure ($66.5B) and Action ($59.8B) are most profitable
  // Drama and Comedy are solid performers ($37.4B each)
  const genre = (project.genre || "").toLowerCase();
  let genreMultiplier = 1.0;

  if (
    genre.includes("adventure") ||
    genre.includes("sci-fi") ||
    genre.includes("fantasy") ||
    genre.includes("superhero")
  ) {
    genreMultiplier = 1.25; // Top performers
  } else if (genre.includes("action") || genre.includes("thriller")) {
    genreMultiplier = 1.2; // High performers
  } else if (genre.includes("drama") || genre.includes("comedy")) {
    genreMultiplier = 1.1; // Solid performers
  } else if (genre.includes("horror")) {
    genreMultiplier = 1.15; // Horror has high ROI due to low budgets
  } else if (genre.includes("romance") || genre.includes("romcom")) {
    genreMultiplier = 1.05; // Moderate performers
  } else if (genre.includes("western") || genre.includes("musical")) {
    genreMultiplier = 0.9; // Declining genres
  }

  effectiveGross *= genreMultiplier;

  // 2.6. Apply Franchise/Sequel Bonus
  // Sequels outperform originals for 20 years, number of sequels in top 100 doubled (2005-2015)
  // Sequels drive bulk of highest-grossing films since 2016
  const isSequel =
    (project.title || "").toLowerCase().includes("2") ||
    (project.title || "").toLowerCase().includes("3") ||
    (project.title || "").toLowerCase().includes("part") ||
    (project as any).isSequel ||
    (project as any).franchiseId;

  if (isSequel) {
    effectiveGross *= 1.3; // 30% bonus for sequels/franchises
  }

  // Tier-dependent revenue floor. Big budgets carry real downside risk.
  // Floor is based on total cost (budget + marketing) to match real-life 50% success rate
  const tier = (project.budgetTier || "mid") as string;
  const marketingBudget = campaign?.domesticBudget + campaign?.foreignBudget || 0;
  const totalCost = (project.budget || 0) + marketingBudget;
  const floorByTier: Record<string, number> = {
    indie: 0.745,
    low: 0.74999,
    mid: 0.74999,
    high: 0.74999,
    blockbuster: 0.74999,
  };
  const floorMult = floorByTier[tier] ?? 0.74999;
  const minFloor = totalCost * floorMult;
  if (effectiveGross < minFloor) {
    effectiveGross = minFloor;
  }

  // 3. Distribute Territories
  const territoryResult = calculateTerritorySplit(effectiveGross, campaign, project.genre);

  const openingGross =
    territoryResult.openingWeekendDomestic + territoryResult.openingWeekendForeign;
  const fullRunGross = (territoryResult.totalDomestic || 0) + (territoryResult.totalForeign || 0);
  const theatricalTotal = applyTheatricalSplit(fullRunGross);

  // 4. Update Project State
  const updatedProject = {
    ...project,
    boxOffice: territoryResult,
    weeklyRevenue: openingGross,
    revenue: theatricalTotal,
  };

  const fatigueFeedback = franchiseFatigue > 0.3 ? " Brand fatigue is chilling the audience." : "";
  const synergyFeedback =
    franchiseSynergy > 1.2 ? " Shared universe hype is driving massive interest!" : "";

  return {
    project: updatedProject,
    feedback:
      feedbackText +
      synergyFeedback +
      fatigueFeedback +
      " " +
      (territoryResult.multiplier > 1.2 ? "Strong international breakout!" : ""),
  };
}

export function simulateWeeklyBoxOffice(
  project: Project,
  weekInRelease: number,
  reviewScore: number,
  previousWeeklyRevenue: number,
  rivalStrength: number,
  trendMultiplier: number = 1.0,
  franchiseSynergy: number = 1.0 // New: Ongoing Halo Effect
): number {
  if (weekInRelease === 0) return previousWeeklyRevenue;

  // 1. Base Decay based on Word of Mouth (Review Score)
  let decayFactor = 0.6; // 40% drop

  if (reviewScore > 80)
    decayFactor = 0.8; // Leggy
  else if (reviewScore > 60) decayFactor = 0.7;
  else if (reviewScore < 40) decayFactor = 0.4; // Front-loaded disaster

  // 2. Genre Specifics
  const g = project.genre.toUpperCase();
  if (g === "HORROR") decayFactor -= 0.15; // Horror drops fast
  if (g === "FAMILY" || g === "ANIMATION") decayFactor += 0.1; // Families have legs

  // 3. Competition Penalty
  const competitionLoss = (rivalStrength / 100) * 0.1;
  const finalMultiplier = clamp(decayFactor - competitionLoss, 0.1, 0.95);

  return Math.floor(previousWeeklyRevenue * finalMultiplier * trendMultiplier * franchiseSynergy);
}

export interface BoxOfficeEntry {
  projectId: string;
  studioName: string;
  weeklyRevenue: number;
}

export function calculateBoxOfficeRanks(entries: BoxOfficeEntry[]): Map<string, number> {
  const sorted = [...entries].sort((a, b) => b.weeklyRevenue - a.weeklyRevenue);
  const ranks = new Map<string, number>();
  sorted.forEach((entry, index) => {
    ranks.set(entry.projectId, index + 1);
  });
  return ranks;
}
