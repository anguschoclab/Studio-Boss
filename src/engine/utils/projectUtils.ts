import { Project, FilmProject, SeriesProject, UnscriptedProject } from '../types/project.types';

/**
 * Project Type Guards for Strict Type Safety
 * Deconstructs the Project union to allow safe access to format-specific fields.
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
    // Unscripted uses the same ProjectBase but we can't be 100% sure it has tvDetails without the guard
    // If it's Unscripted & type: SERIES, it might not have tvDetails in the interface yet
    return 'SERIES';
  }
  return project.format.toUpperCase();
}
