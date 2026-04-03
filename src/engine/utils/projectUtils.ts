import { Project, FilmProject, SeriesProject, UnscriptedProject, BudgetTierKey } from '../types/project.types';
import { Talent } from '../types/talent.types';

/**
 * Project Type Guards for Strict Type Safety
 */

export function isFilmProject(project: Project): project is FilmProject {
  return project.type === 'FILM' && project.format === 'film';
}

export function isSeriesProject(project: Project): project is SeriesProject {
  return project.type === 'SERIES' && project.format === 'tv';
}

export function isUnscriptedProject(project: Project): project is UnscriptedProject & { type: 'SERIES' } {
  return project.type === 'SERIES' && project.format === 'unscripted';
}

/**
 * Returns the season display string for a project if applicable.
 */
export function getProjectSeasonDisplay(project: Project): string {
  if (isSeriesProject(project)) {
    return `S${project.tvDetails.currentSeason || 1}`;
  }
  if (isUnscriptedProject(project)) {
    return 'SERIES';
  }
  return project.format.toUpperCase();
}

/**
 * Calculates a match score (0-100) between a talent and a project.
 * Uses deterministic logic for scoring based on genre, tier, role fit, and power.
 */
export function calculateTalentFitScore(talent: Talent, project: Project, targetRole?: string): number {
  let score = 50; 

  // Genre Alignment
  if (talent.preferredGenres?.includes(project.genre)) {
    score += 20;
  } else {
    score -= 10;
  }

  // Tier Alignment
  const tierMap: Record<BudgetTierKey, number> = { 'low': 1, 'mid': 2, 'high': 3, 'blockbuster': 4 };
  const tierValue = tierMap[project.budgetTier] || 1;
  const talentTier = talent.prestige > 80 ? 4 : talent.prestige > 60 ? 3 : talent.prestige > 30 ? 2 : 1;

  if (talentTier === tierValue) score += 20;
  else if (Math.abs(talentTier - tierValue) === 1) score += 5;
  else score -= 15;

  // Specific Role Buffs
  if (targetRole && talent.roles.includes(targetRole as any)) {
    score += 10;
  }

  // Draw vs Budget Requirements
  if (project.budgetTier === 'blockbuster' && (talent.draw || 0) < 50) score -= 20;
  if (project.budgetTier === 'low' && talent.prestige > 90) score -= 10;

  // Synergy Afficinities (Phase 2)
  if (talent.psychology?.synergyAffinities?.length) {
     // TODO: Implement synergy scoring if other talent are already attached
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Returns a list of talent with fit scores and recommendation tags.
 */
export function getRecommendedTalentForProject(talentPool: Talent[], project: Project, targetRole?: string) {
  return talentPool.map(t => {
    const score = calculateTalentFitScore(t, project, targetRole);
    const tags: string[] = [];
    
    if (t.preferredGenres?.includes(project.genre)) tags.push("Genre Specialist");
    const tierMap: Record<BudgetTierKey, number> = { 'low': 1, 'mid': 2, 'high': 3, 'blockbuster': 4 };
    const tierValue = tierMap[project.budgetTier] || 1;
    const talentTier = t.prestige > 80 ? 4 : t.prestige > 60 ? 3 : t.prestige > 30 ? 2 : 1;
    if (talentTier === tierValue) tags.push("Perfect Tier Match");
    if (t.draw > 70 && project.budgetTier === 'blockbuster') tags.push("Box Office Draw");

    return {
      talent: t,
      score,
      tags
    };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Estimates the duration (in weeks) required for a project production phase.
 */
export function getProjectEstimatedWindow(project: Project): number {
  let baseWeeks = 12;

  if (project.format === 'film') {
    switch (project.budgetTier) {
      case 'mid': baseWeeks = 20; break;
      case 'high': baseWeeks = 30; break;
      case 'blockbuster': baseWeeks = 45; break;
      default: baseWeeks = 12; // low
    }
  } else {
    // Correctly accessing episodesOrdered from tvDetails
    const episodes = isSeriesProject(project) ? project.tvDetails.episodesOrdered : 10;
    baseWeeks = 8 + (episodes * 2);
    if (project.budgetTier === 'blockbuster') baseWeeks += 12;
    else if (project.budgetTier === 'high') baseWeeks += 6;
  }

  return baseWeeks;
}
