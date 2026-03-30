import { ContentFlag, ProjectRating, Project, GameState } from '@/engine/types';
import { hasCreativeControl } from './directors';

/**
 * Determines a project's rating based on its explicit content flags.
 */
export function evaluateRating(flags?: ContentFlag[]): ProjectRating {
  if (!flags || flags.length === 0) return 'G';
  if (flags.includes('gore') || flags.includes('nudity')) {
    return 'NC-17';
  }
  if (flags.includes('violence') || flags.includes('political') || flags.includes('profanity')) {
    if (flags.includes('violence') && flags.includes('profanity') && flags.includes('political')) {
      return 'R';
    }
    return 'NC-17';
  }
  return 'PG-13';
}

export interface EditRatingResult {
  success: boolean;
  data?: Project;
  error?: string;
}

/**
 * Strips aggressive flags from a project to lower its rating, 
 * but slightly alienates prestige and angers actors/directors.
 */
export function editForRating(project: Project, state: GameState, targetRemoval: ContentFlag): EditRatingResult {
  if (!project.contentFlags || !project.contentFlags.includes(targetRemoval)) {
    return { success: true, data: project };
  }
  
  // Actually check if the director has creative control (Sprint J integration)
  if (hasCreativeControl(project.id, state)) {
     return {
       success: false,
       error: "Director has final cut. You cannot edit for rating without breaching contract."
     };
  }
  
  const newFlags = project.contentFlags.filter(f => f !== targetRemoval);
  
  return {
    success: true,
    data: {
      ...project,
      contentFlags: newFlags,
      rating: evaluateRating(newFlags),
      buzz: Math.max(0, project.buzz - 5), // Buzz drops because fans hear the movie was censored
      flavor: `${project.flavor} (Sanitized)`
    }
  };
}

/**
 * Regional bans severely limit box office potential if a movie contains certain flags.
 */
export function calculateRegionalPenalties(project: Project): number {
  let multiplier = 1.0;
  const flags = project.contentFlags || [];
  
  // Severe global markets might drop a movie for political themes
  if (flags.includes('political')) {
    multiplier -= 0.3; // Loses 30% of global box office
  }
  
  if (flags.includes('gore') || flags.includes('nudity')) {
    multiplier -= 0.15; // Restricted markets
  }
  
  return Math.max(0.1, multiplier);
}
