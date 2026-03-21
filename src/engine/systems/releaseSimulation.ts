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
  rivalStrength: number
): number {
  // Increased base drop-off to simulate modern front-loaded box office trends (from 0.4-0.6 down to 0.3-0.5).
  let dropOffMultiplier = randRange(0.3, 0.5);

  // Adjust drop-off based on "legs" (word-of-mouth determined by review score)
  if (reviewScore >= 85) {
    dropOffMultiplier = randRange(0.6, 0.8); // Excellent legs, still strong but slightly worse than before
  } else if (reviewScore >= 60) {
    dropOffMultiplier = randRange(0.4, 0.6); // Average legs
  } else if (reviewScore < 40) {
    // Punitive drop for terrible movies to force tighter quality control on expensive projects.
    dropOffMultiplier = randRange(0.1, 0.25);
  }

  // Large budget films are more front-loaded due to massive marketing pushes week 1.
  if (project.budget >= 100_000_000 && weekInRelease === 1) {
     dropOffMultiplier *= 0.85; // Sharp second-weekend drop for tentpoles
  }

  // Heavy competition penalty: high rival strength eats into revenue legs
  const competitionPenalty = (rivalStrength / 100) * 0.15; // Increased penalty from 0.1 to 0.15
  dropOffMultiplier = Math.max(0.05, dropOffMultiplier - competitionPenalty);

  return Math.max(0, previousWeeklyRevenue * dropOffMultiplier);
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
