import { Project, TalentProfile } from '@/engine/types';

export type GreenlightRecommendation =
  | 'Easy Greenlight'
  | 'Viable with Conditions'
  | 'Speculative Bet'
  | 'Dangerous Vanity Play'
  | 'Do Not Greenlight Yet';

export interface GreenlightReport {
  score: number;
  recommendation: GreenlightRecommendation;
  positives: string[];
  negatives: string[];
}

export function evaluateGreenlight(
  project: Project,
  cash: number,
  attachedTalent: TalentProfile[],
  currentWeek: number = 0,
  allProjects: Project[] = []
): GreenlightReport {
  let score = 50;
  const positives: string[] = [];
  const negatives: string[] = [];

  // Market Saturation Penalty
  let recentSimilarProjectsCount = 0;
  for (let i = 0; i < allProjects.length; i++) {
    const p = allProjects[i];
    if (
      p.status === 'released' &&
      p.genre === project.genre &&
      p.releaseWeek !== null &&
      (currentWeek - p.releaseWeek) <= 52 &&
      p.id !== project.id
    ) {
      recentSimilarProjectsCount++;
    }
  }

  let saturationPenalty = recentSimilarProjectsCount * 5;

  if (recentSimilarProjectsCount >= 5) {
    saturationPenalty += 20;
  }

  // The Festival Buyer: Heavily penalize oversaturated tentpole genres (like Superhero)
  if (recentSimilarProjectsCount >= 5 && project.genre.toLowerCase().includes('superhero')) {
    saturationPenalty *= 3;
    saturationPenalty += 75;
  }

  if (saturationPenalty > 0) {
    score -= saturationPenalty;
    negatives.push(`Market saturation: -${saturationPenalty} points due to ${recentSimilarProjectsCount} recent ${project.genre} release(s).`);
  }

  // Trend-modifier: Calendar Gap Bonus
  if (recentSimilarProjectsCount === 0) {
    score += 15;
    positives.push(`Market gap: +15 points due to no recent ${project.genre} releases in the past year.`);
  }

  // 1. Budget vs Cash
  if (cash < project.budget) {
    score -= 40;
    negatives.push('Severe cashflow strain: insufficient funds for budget.');
  } else if (cash < project.budget * 2) {
    score -= 15;
    negatives.push('High financial exposure relative to current reserves.');
  } else if (cash > project.budget * 5) {
    score += 10;
    positives.push('Comfortable cash reserves for this budget tier.');
  }

  // 2. Talent Package
  if (attachedTalent.length === 0) {
    score -= 20;
    negatives.push('Unpackaged: No key talent attached.');
  } else {
    let totalDraw = 0;
    let totalPrestige = 0;
    for (let i = 0; i < attachedTalent.length; i++) {
      totalDraw += attachedTalent[i].draw;
      totalPrestige += attachedTalent[i].prestige;
    }

    const avgDraw = totalDraw / attachedTalent.length;

    if (avgDraw > 75) {
      score += 30;
      positives.push('A-list package provides strong market floor.');
    } else if (avgDraw > 50) {
      score += 15;
      positives.push('Solid bankable talent attached.');
    } else {
      score -= 5;
      negatives.push('Attached talent lacks strong box office/ratings draw.');
    }

    if (totalPrestige > 150) {
      score += 10;
      positives.push('Strong prestige elements for awards narrative.');
    }
  }

  // 3. Project Buzz
  if (project.buzz > 80) {
    score += 20;
    positives.push('Exceptional pre-production buzz.');
  } else if (project.buzz > 60) {
    score += 10;
    positives.push('Healthy development buzz.');
  } else if (project.buzz < 30) {
    score -= 15;
    negatives.push('Very low market awareness/buzz.');
  }

  // Bound score
  score = Math.max(0, Math.min(100, score));

  // Determine Recommendation
  let recommendation: GreenlightRecommendation;

  if (score >= 80) {
    recommendation = 'Easy Greenlight';
  } else if (score >= 60) {
    recommendation = 'Viable with Conditions';
  } else if (score >= 40) {
    if (project.budgetTier === 'blockbuster' || project.budgetTier === 'high') {
      recommendation = 'Dangerous Vanity Play';
    } else {
      recommendation = 'Speculative Bet';
    }
  } else {
    if (project.budgetTier === 'blockbuster' || project.budgetTier === 'high') {
       recommendation = 'Dangerous Vanity Play';
    } else {
       recommendation = 'Do Not Greenlight Yet';
    }
  }

  return {
    score,
    recommendation,
    positives,
    negatives
  };
}
