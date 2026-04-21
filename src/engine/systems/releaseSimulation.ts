import { Project, Talent, ActiveCrisis, BoxOfficeResult, MarketingCampaign } from '@/engine/types';
import { randRange, clamp } from '../utils';
import { evaluateMarketingEfficiency } from './marketing/efficiencyEvaluator';
import { calculateTerritorySplit } from './marketing/territoryDistributor';

/**
 * Phase 3 & 4 Orchestrator for Release Simulation.
 * Handles Reviews, Opening Weekends, and Territory Distribution.
 */

export function calculateReviewScore(
  project: Project,
  attachedTalent: Talent[],
  crises: ActiveCrisis | null | undefined
): number {
  let baseScore = randRange(40, 70);

  // 1. Talent Prestige Bonus
  if (attachedTalent.length > 0) {
    const talentBonus = attachedTalent.reduce((sum, t) => sum + t.prestige, 0) / attachedTalent.length * 0.3;
    baseScore += talentBonus;
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

  return clamp(Math.round(baseScore + randRange(-5, 5)), 1, 100);
}

export function calculateOpeningWeekend(
  project: Project,
  attachedTalent: Talent[],
  studioPrestige: number,
  franchiseSynergy: number = 1.0, // New: Halo Effect (1.0 - 2.5)
  franchiseFatigue: number = 0 // New: Audience Saturation (0 - 1.0)
): { project: Project; feedback: string } {
  // If no campaign, it's a "silent release" - very poor performance
  const campaign = project.marketingCampaign || {
    primaryAngle: 'GRASSROOTS',
    domesticBudget: 0,
    foreignBudget: 0,
    weeksInMarketing: 0
  } as MarketingCampaign;

  // 1. Calculate Base Potential (based on Buzz and Talent Draw)
  const talentDraw = attachedTalent.reduce((sum, t) => sum + t.draw, 0) / (attachedTalent.length || 1);
  const buzzFactor = project.buzz / 50;
  const prestigeFactor = 0.8 + (studioPrestige / 200);
  
  // Base potential: roughly 5x budget for a perfect storm, 0.5x for a dud
  const basePotential = (project.budget * 0.4) * buzzFactor * prestigeFactor * (1 + (talentDraw / 100));
  const randomFactor = randRange(0.85, 1.15);
  
  let effectiveGross = basePotential * randomFactor * franchiseSynergy; // Apply Halo Effect
  effectiveGross *= (1 - franchiseFatigue); // Apply Fatigue Penalty

  // 2. Apply Marketing Efficiency
  const { multiplier, feedbackText } = evaluateMarketingEfficiency(project, campaign);
  effectiveGross *= multiplier;

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
  franchiseSynergy: number = 1.0 // New: Ongoing Halo Effect
): number {
  if (weekInRelease === 0) return previousWeeklyRevenue;

  // 1. Base Decay based on Word of Mouth (Review Score)
  let decayFactor = 0.6; // 40% drop
  
  if (reviewScore > 80) decayFactor = 0.8; // Leggy
  else if (reviewScore > 60) decayFactor = 0.7;
  else if (reviewScore < 40) decayFactor = 0.4; // Front-loaded disaster

  // 2. Genre Specifics
  const g = project.genre.toUpperCase();
  if (g === 'HORROR') decayFactor -= 0.15; // Horror drops fast
  if (g === 'FAMILY' || g === 'ANIMATION') decayFactor += 0.1; // Families have legs

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
