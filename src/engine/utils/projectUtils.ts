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
 * Uses deterministic logic for scoring based on genre, tier, and power.
 */
export function calculateTalentFitScore(talent: Talent, project: Project): number {
  let score = 50; 

  if (talent.preferredGenres?.includes(project.genre)) {
    score += 20;
  } else {
    score -= 10;
  }

  const tierMap: Record<BudgetTierKey, number> = { 'low': 1, 'mid': 2, 'high': 3, 'blockbuster': 4 };
  const tierValue = tierMap[project.budgetTier] || 1;
  const talentTier = talent.prestige > 80 ? 4 : talent.prestige > 60 ? 3 : talent.prestige > 30 ? 2 : 1;

  if (talentTier === tierValue) score += 20;
  else if (Math.abs(talentTier - tierValue) === 1) score += 5;
  else score -= 15;

  if (project.budgetTier === 'blockbuster' && talent.draw < 50) score -= 20;
  if (project.budgetTier === 'low' && talent.prestige > 90) score -= 10;

  return Math.max(0, Math.min(100, score));
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
