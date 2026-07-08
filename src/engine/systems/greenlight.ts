import { Project, Talent, Contract } from '@/engine/types';

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
  roleCompleteness: number; // 0-100: director + lead actor + writer filled
  scheduleCertainty: number; // 0-100: budget vs production weeks risk
}

/**
 * Role Completeness Score (Design Bible §35.13).
 * Evaluates whether the three mandatory creative leadership slots — director,
 * lead actor, writer — are filled. Returns 0–100.
 */
export function roleCompletenessScore(
  projectId: string,
  contracts: Record<string, Contract> | Contract[],
  talents: Record<string, Talent>,
): number {
  const list = Array.isArray(contracts) ? contracts : Object.values(contracts);
  const projectContracts = list.filter((c) => c.projectId === projectId);
  const attachedRoles = new Set(
    projectContracts
      .map((c) => (talents[c.talentId]?.role ?? (talents[c.talentId] as any)?.roles?.[0] ?? '').toLowerCase())
      .filter(Boolean),
  );

  let filled = 0;
  if (attachedRoles.has('director')) filled += 1;
  if (attachedRoles.has('actor') || attachedRoles.has('lead_actor')) filled += 1;
  if (attachedRoles.has('writer')) filled += 1;

  return Math.round((filled / 3) * 100);
}

/**
 * Schedule Certainty (Design Bible §35.13).
 * Low budget relative to production weeks = high risk = low certainty.
 * Returns 0–100.
 */
export function scheduleCertainty(project: Project): number {
  const weeks = project.productionWeeks || 1;
  return Math.min(100, (project.budget / (weeks * 1_000_000)) * 50);
}

export function evaluateGreenlight(
  project: Project,
  cash: number,
  attachedTalent: Talent[],
  currentWeek: number = 0,
  allProjects: Project[] = [],
  contracts: Record<string, Contract> | Contract[] = [],
  talents: Record<string, Talent> = {}
): GreenlightReport {
  let score = 50;
  const positives: string[] = [];
  const negatives: string[] = [];

  // Market Saturation Penalty
  let recentSimilarProjectsCount = 0;
  for (const p of allProjects) {
    if (
      p.state === 'released' &&
      p.genre === project.genre &&
      p.releaseWeek !== null &&
      (currentWeek - p.releaseWeek) <= 52 &&
      p.id !== project.id
    ) {
      recentSimilarProjectsCount++;
    }
  }

  // The Festival Buyer: Base penalty is 5 points per recent similar project.
  let saturationPenalty = recentSimilarProjectsCount * 5;

  // If there are 5 or more, add a flat 20 point penalty.
  if (recentSimilarProjectsCount >= 5) {
    saturationPenalty += 20;

    // Heavily penalize oversaturated tentpole genres (like Superhero) by multiplying the penalty by 3 and adding 75.
    if (project.genre && project.genre.toLowerCase().includes('superhero')) {
      saturationPenalty = (saturationPenalty * 3) + 75;
    }
  }

  if (saturationPenalty > 0) {
    score -= saturationPenalty;
    negatives.push(`Market saturation: -${saturationPenalty} points due to ${recentSimilarProjectsCount} recent ${project.genre} release(s).`);
  } else if (recentSimilarProjectsCount === 0) {
    // Trend-modifier: Calendar Gap Bonus
    // If there have been no similar projects released in the last 52 weeks, the market is starved for this genre.
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
    for (const t of attachedTalent) {
      totalDraw += t.draw;
      totalPrestige += t.prestige;
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

  // 4. Role Completeness (Design Bible §35.13)
  const roleCompleteness = roleCompletenessScore(project.id, contracts, talents);
  if (roleCompleteness < 100) {
    const penalty = (100 - roleCompleteness) * 0.15;
    score -= penalty;
    if (roleCompleteness === 0) {
      negatives.push('No creative leadership attached (director / lead / writer).');
    } else {
      negatives.push(`Incomplete creative package: ${roleCompleteness}% of key roles filled.`);
    }
  } else {
    positives.push('Fully staffed creative package (director, lead, writer).');
  }

  // 5. Schedule Certainty (Design Bible §35.13)
  const scheduleCertaintyScore = scheduleCertainty(project);
  if (scheduleCertaintyScore > 70) {
    score += 5;
    positives.push('Schedule on solid footing — low production-risk profile.');
  } else if (scheduleCertaintyScore < 40) {
    score -= 10;
    negatives.push('High schedule risk: thin budget relative to production weeks.');
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
    negatives,
    roleCompleteness,
    scheduleCertainty: scheduleCertaintyScore
  };
}
