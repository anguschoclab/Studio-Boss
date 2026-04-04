import { Project, Talent, ActiveCrisis, MarketingCampaign, ProjectRating } from '@/engine/types';
import { clamp } from '../utils';
import { evaluateMarketingEfficiency } from './marketing/efficiencyEvaluator';
import { calculateTerritorySplit } from './marketing/territoryDistributor';
import { getRatingEconomics, calculateRegionalPenalties } from './ratings';
import { RandomGenerator } from '../utils/rng';

/**
 * Phase 3 & 4 Orchestrator for Release Simulation.
 * Handles Reviews, Opening Weekends, and Territory Distribution.
 */

export function calculateReviewScore(
  project: Project,
  attachedTalent: Talent[],
  crises: ActiveCrisis | null | undefined,
  rng: RandomGenerator
): number {
  let baseScore = rng.range(40, 70);

  // 1. Talent Prestige Bonus
  if (attachedTalent.length > 0) {
    const talentBonus = attachedTalent.reduce((sum, t) => sum + t.prestige, 0) / attachedTalent.length * 0.3;
    baseScore += talentBonus;
  }

  // 2. Production Crises Penalty
  if (crises) {
    baseScore -= rng.range(10, 25);
  }

  // 3. Buzz Alignment (Expectation vs Reality)
  if (project.buzz > 80) {
    baseScore += rng.range(5, 12);
  } else if (project.buzz < 30) {
    baseScore -= rng.range(5, 12);
  }

  return clamp(Math.round(baseScore + rng.range(-5, 5)), 1, 100);
}

export function calculateOpeningWeekend(
  project: Project,
  attachedTalent: Talent[],
  studioPrestige: number,
  rng: RandomGenerator,
  franchiseSynergy: number = 1.0, 
  franchiseFatigue: number = 0 
): { project: Project; feedback: string } {
  // If no campaign, it's a "silent release" - very poor performance
  const campaign = project.marketingCampaign || {
    primaryAngle: 'GRASSROOTS',
    domesticBudget: 0,
    foreignBudget: 0,
    weeksInMarketing: 0
  } as MarketingCampaign;

  // 1. Calculate Base Potential (based on Buzz and Talent Draw)
  const talentDraw = attachedTalent.reduce((sum, t) => sum + t.draw, 1);
  const avgTalentDraw = attachedTalent.length > 0 ? talentDraw / attachedTalent.length : 0;
  const buzzFactor = project.buzz / 50;
  const prestigeFactor = 0.8 + (studioPrestige / 200);
  
  // Base potential: roughly 5x budget for a perfect storm, 0.5x for a duds
  const basePotential = (project.budget * 0.4) * buzzFactor * prestigeFactor * (1 + (avgTalentDraw / 100));
  const randomFactor = rng.range(0.85, 1.15);
  
  let effectiveGross = basePotential * randomFactor * franchiseSynergy; // Apply Halo Effect
  effectiveGross *= (1 - franchiseFatigue); // Apply Fatigue Penalty

  // 2. Apply Marketing Efficiency
  const { multiplier, feedbackText } = evaluateMarketingEfficiency(project, campaign);
  effectiveGross *= multiplier;

  // 2.5. Apply Rating Economics (theater access, audience reach, regional penalties)
  const ratingEcon = getRatingEconomics(project.rating ?? 'PG-13');
  effectiveGross *= ratingEcon.theaterAccessPct;
  effectiveGross *= ratingEcon.audienceReachMultiplier;
  const regionalMultiplier = calculateRegionalPenalties(project);
  effectiveGross *= regionalMultiplier;

  // 3. Distribute Territories
  const territoryResult = calculateTerritorySplit(effectiveGross, campaign, project.genre);

  // 4. Update Project State
  const updatedProject = {
    ...project,
    boxOffice: territoryResult,
    weeklyRevenue: (territoryResult.openingWeekendDomestic + territoryResult.openingWeekendForeign),
    revenue: (territoryResult.openingWeekendDomestic + territoryResult.openingWeekendForeign)
  };

  const fatigueFeedback = franchiseFatigue > 0.3 ? " Brand fatigue is chilling the audience." : "";
  const synergyFeedback = franchiseSynergy > 1.2 ? " Shared universe hype is driving massive interest!" : "";

  return { 
    project: updatedProject, 
    feedback: feedbackText + synergyFeedback + fatigueFeedback + " " + (territoryResult.multiplier > 1.2 ? "Strong international breakout!" : "")
  };
}

export function simulateWeeklyBoxOffice(
  project: Project,
  weekInRelease: number,
  reviewScore: number,
  previousWeeklyRevenue: number,
  rivalStrength: number,
  trendMultiplier: number = 1.0,
  franchiseSynergy: number = 1.0,
  franchiseFatigue: number = 0,
  rating: ProjectRating = 'PG-13'
): number {
  if (weekInRelease === 0) return previousWeeklyRevenue;

  // 1. Base Decay based on Word of Mouth (Review Score)
  let decayFactor = 0.6; // 40% drop

  if (reviewScore > 80) decayFactor = 0.8; // Leggy
  else if (reviewScore > 60) decayFactor = 0.7;
  else if (reviewScore < 40) decayFactor = 0.4; // Front-loaded disaster

  // 1.5. Rating-specific decay modifiers
  // R-rated dramas with strong reviews have prestige legs (word-of-mouth driven)
  if ((rating === 'R') && reviewScore > 70) {
    const g = project.genre.toUpperCase();
    if (g === 'DRAMA' || g === 'THRILLER' || g === 'CRIME') decayFactor += 0.05;
  }
  // NC-17 / Unrated are front-loaded (specialty audience turns out opening weekend)
  if (rating === 'NC-17' || rating === 'Unrated') decayFactor -= 0.05;

  // 2. Genre Specifics
  const g = project.genre.toUpperCase();
  if (g === 'HORROR') decayFactor -= 0.15; // Horror drops fast
  if (g === 'FAMILY' || g === 'ANIMATION') decayFactor += 0.1; // Families have legs

  // 3. Competition Penalty
  const competitionLoss = (rivalStrength / 100) * 0.1;
  const finalMultiplier = clamp(decayFactor - competitionLoss, 0.1, 0.95);

  return Math.floor(previousWeeklyRevenue * finalMultiplier * trendMultiplier * franchiseSynergy * (1 - (franchiseFatigue * 0.5))); 
}

export interface BoxOfficeEntry {
  projectId: string;
  studioName: string;
  weeklyRevenue: number;
}

export function calculateBoxOfficeRanks(
  entries: BoxOfficeEntry[]
): Map<string, number> {
  const sorted = [...entries].sort((a, b) => b.weeklyRevenue - a.weeklyRevenue);
  const ranks = new Map<string, number>();
  sorted.forEach((entry, index) => {
    ranks.set(entry.projectId, index + 1);
  });
  return ranks;
}

