import {
  ContentFlag,
  FilmRating,
  TvRating,
  ProjectRating,
} from '@/engine/types';

/**
 * Evaluates the MPAA-equivalent film rating from a set of content flags.
 * Returns G/PG/PG-13/R/NC-17 based on severity tiers.
 */
export function evaluateFilmRating(flags: ContentFlag[]): FilmRating {
  if (!flags || flags.length === 0) return 'G';

  // Tier 1: Explicit/adult content → NC-17
  if (flags.includes('gore') || flags.includes('nudity') || flags.includes('sexual_content')) {
    return 'NC-17';
  }

  // Tier 2: Strong mature themes → R
  const hasViolence = flags.includes('violence');
  const hasProfanity = flags.includes('profanity');
  const hasPolitical = flags.includes('political');
  const hasDrugUse = flags.includes('drug_use');

  if (hasPolitical) return 'R';
  if (hasViolence && hasProfanity) return 'R';
  if (hasViolence && hasDrugUse) return 'R';

  // Tier 3: Moderate content → PG-13
  if (hasViolence || hasProfanity || hasDrugUse || flags.includes('lgbtq_themes')) {
    return 'PG-13';
  }

  // Tier 4: Mild thematic content → PG
  if (flags.includes('supernatural') || flags.includes('gambling') || flags.includes('religious')) {
    return 'PG';
  }

  return 'G';
}

/**
 * Evaluates the TV content rating for a series.
 */
export function evaluateTvRating(flags: ContentFlag[]): TvRating {
  if (!flags || flags.length === 0) return 'TV-G';

  if (flags.includes('gore') || flags.includes('nudity') || flags.includes('sexual_content')) {
    return 'TV-MA';
  }

  if (
    flags.includes('violence') ||
    flags.includes('profanity') ||
    flags.includes('drug_use') ||
    flags.includes('lgbtq_themes') ||
    flags.includes('political')
  ) {
    return 'TV-14';
  }

  if (flags.includes('supernatural') || flags.includes('gambling') || flags.includes('religious')) {
    return 'TV-PG';
  }

  return 'TV-G';
}

/**
 * Evaluates a rating based on project type (film vs series).
 */
export function evaluateRatingForProject(flags: ContentFlag[], projectType: 'FILM' | 'SERIES'): ProjectRating {
  return projectType === 'SERIES' ? evaluateTvRating(flags) : evaluateFilmRating(flags);
}

/**
 * Backward-compatible entry point — evaluates as a film rating.
 * Existing callers (tests) use this signature.
 */
export function evaluateRating(flags?: ContentFlag[]): ProjectRating {
  return evaluateFilmRating(flags || []);
}
