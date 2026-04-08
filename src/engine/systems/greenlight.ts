import { Project, Talent } from '@/engine/types';
import { BardResolver } from './bardResolver';
import { RandomGenerator } from '../utils/rng';

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
  attachedTalent: Talent[],
  rng: RandomGenerator,
  currentWeek: number = 0,
  allProjects: Project[] = []
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
    negatives.push(BardResolver.resolve({
      domain: 'Greenlight',
      subDomain: 'MarketSat',
      intensity: 10, // Risky
      context: { genre: project.genre, count: recentSimilarProjectsCount },
      rng
    }));
  } else if (recentSimilarProjectsCount === 0) {
    // Trend-modifier: Calendar Gap Bonus
    // If there have been no similar projects released in the last 52 weeks, the market is starved for this genre.
    score += 15;
    positives.push(BardResolver.resolve({
      domain: 'Greenlight',
      subDomain: 'MarketSat',
      intensity: 80, // Prestige/Gap
      context: { genre: project.genre },
      rng
    }));
  }

  // 1. Budget vs Cash
  if (cash < project.budget) {
    score -= 40;
    negatives.push(BardResolver.resolve({
      domain: 'Greenlight',
      subDomain: 'Finance',
      intensity: 0,
      context: { amount: project.budget },
      rng
    }));
  } else if (cash < project.budget * 2) {
    score -= 15;
    negatives.push(BardResolver.resolve({
      domain: 'Greenlight',
      subDomain: 'Finance',
      intensity: 30,
      context: { amount: project.budget },
      rng
    }));
  } else if (cash > project.budget * 5) {
    score += 10;
    positives.push(BardResolver.resolve({
      domain: 'Greenlight',
      subDomain: 'Finance',
      intensity: 90,
      context: { amount: project.budget },
      rng
    }));
  }

  // 2. Talent Package
  if (attachedTalent.length === 0) {
    score -= 20;
    negatives.push(BardResolver.resolve({
      domain: 'Greenlight',
      subDomain: 'Talent',
      intensity: 10,
      context: {},
      rng
    }));
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
      positives.push(BardResolver.resolve({
        domain: 'Greenlight',
        subDomain: 'Talent',
        intensity: 90,
        context: {},
        rng
      }));
    } else if (avgDraw > 50) {
      score += 15;
      positives.push(BardResolver.resolve({
        domain: 'Greenlight',
        subDomain: 'Talent',
        intensity: 60,
        context: {},
        rng
      }));
    } else {
      score -= 5;
      negatives.push(BardResolver.resolve({
        domain: 'Greenlight',
        subDomain: 'Talent',
        intensity: 30,
        context: {},
        rng
      }));
    }

    if (totalPrestige > 150) {
      score += 10;
      positives.push('Strong prestige elements for awards narrative.');
    }
  }

  // 3. Project Buzz
  if (project.buzz > 80) {
    score += 20;
    positives.push(BardResolver.resolve({
      domain: 'Greenlight',
      subDomain: 'Marketing',
      intensity: 90,
      context: {},
      rng
    }));
  } else if (project.buzz > 60) {
    score += 10;
    positives.push(BardResolver.resolve({
      domain: 'Greenlight',
      subDomain: 'Marketing',
      intensity: 70,
      context: {},
      rng
    }));
  } else if (project.buzz < 30) {
    score -= 15;
    negatives.push(BardResolver.resolve({
      domain: 'Greenlight',
      subDomain: 'Marketing',
      intensity: 20,
      context: {},
      rng
    }));
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
