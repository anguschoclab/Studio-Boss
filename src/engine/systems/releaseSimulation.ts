import { Project, TalentProfile, ActiveCrisis } from '../types';
import { randRange, clamp } from '../utils';

export function generateReviewScore(
  project: Project,
  attachedTalent: TalentProfile[],
  crises: ActiveCrisis | undefined
): number {
  let baseScore = randRange(40, 70);

  // Bonus from attached talent prestige
  const talentBonus = attachedTalent.reduce((sum, t) => sum + t.prestige, 0) / Math.max(1, attachedTalent.length) * 0.3;
  baseScore += talentBonus;

  // Penalty from production crises
  if (crises && !crises.resolved) {
    baseScore -= randRange(10, 25);
  }

  // Bonus for high buzz
  if (project.buzz > 80) {
    baseScore += randRange(5, 15);
  } else if (project.buzz < 30) {
    baseScore -= randRange(5, 15);
  }

  // Slight random variance for the final score
  const finalScore = clamp(Math.round(baseScore + randRange(-5, 5)), 1, 100);
  return finalScore;
}

export function simulateWeeklyBoxOffice(
  project: Project,
  weekInRelease: number,
  reviewScore: number,
  previousWeeklyRevenue: number,
  rivalStrength: number,
  trendMultiplier: number = 1.0
): number {
  // Base drop-off range
  let minDropOff = 0.3;
  let maxDropOff = 0.5;

  // Genre-specific legs adjustments (Sprint C feature)
  if (project.genre === 'Horror') {
    // Horror performs wildly differently — frontloaded, but if good, it holds phenomenally.
    minDropOff += 0.1;
    maxDropOff += 0.2;
  } else if (project.genre === 'Family' || project.genre === 'Animation') {
    // Family films have incredible legs compared to standard action blockbusters
    minDropOff += 0.2;
    maxDropOff += 0.3;
  } else if (project.genre === 'Comedy') {
    // Comedies drop off slower if word of mouth is good
    minDropOff += 0.15;
    maxDropOff += 0.15;
  }

  let dropOffMultiplier = randRange(minDropOff, maxDropOff);

  // Adjust drop-off based on "legs" (word-of-mouth determined by review score)
  if (reviewScore >= 85) {
    dropOffMultiplier = Math.min(0.95, dropOffMultiplier + 0.3); // Excellent legs
  } else if (reviewScore >= 60) {
    dropOffMultiplier = Math.min(0.85, dropOffMultiplier + 0.1); // Average legs
  } else if (reviewScore < 40) {
    // Punitive drop for terrible movies
    dropOffMultiplier = Math.max(0.1, dropOffMultiplier - 0.2); 
  }

  // Large budget films are more front-loaded due to massive marketing pushes week 1 (steeper drop-off).
  if (project.budget >= 200_000_000 && weekInRelease === 1) {
     dropOffMultiplier *= 0.50;
  } else if (project.budget >= 100_000_000 && weekInRelease === 1) {
     dropOffMultiplier *= 0.70;
  }

  // Strong word-of-mouth for anomalies (horror/indie) yields an even bigger boost.
  if (project.budget <= 20_000_000 && reviewScore >= 70) {
     dropOffMultiplier = Math.min(0.98, dropOffMultiplier * 1.5);
  }

  // Heavy competition penalty: high rival strength eats into revenue legs
  const competitionPenalty = (rivalStrength / 100) * 0.15;
  dropOffMultiplier = Math.max(0.05, dropOffMultiplier - competitionPenalty);

  return Math.max(0, previousWeeklyRevenue * dropOffMultiplier * trendMultiplier);
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
