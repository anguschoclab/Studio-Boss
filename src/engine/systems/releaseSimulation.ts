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
  let dropOffMultiplier = randRange(0.4, 0.6); // Standard drop-off

  // Adjust drop-off based on "legs" (word-of-mouth determined by review score)
  if (reviewScore >= 85) {
    dropOffMultiplier = randRange(0.65, 0.85); // Excellent legs
  } else if (reviewScore >= 60) {
    dropOffMultiplier = randRange(0.5, 0.7); // Average legs
  } else if (reviewScore < 40) {
    dropOffMultiplier = randRange(0.2, 0.4); // Terrible legs, falls off a cliff
  }

  // Heavy competition penalty: high rival strength slightly eats into revenue legs
  const competitionPenalty = (rivalStrength / 100) * 0.1;
  dropOffMultiplier = Math.max(0.1, dropOffMultiplier - competitionPenalty);

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
