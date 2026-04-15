// This file re-exports all rating-related functions from the new modular structure
// for backward compatibility with existing imports.

// Rating Evaluation
export {
  evaluateFilmRating,
  evaluateTvRating,
  evaluateRatingForProject,
  evaluateRating
} from './ratings/ratingEvaluation';

// Rating Economics
export {
  getRatingEconomics
} from './ratings/ratingEconomics';

// Regional Ratings
export {
  evaluateRegionalRatings,
  calculateRegionalPenalties
} from './ratings/regionalRatings';

// Rating Editing
export {
  editForRating,
  requestStudioEdit
} from './ratings/ratingEditing';

// Director's Cuts
export {
  checkDirectorsCutEligibility,
  releaseDirectorsCut,
  releaseUnrated
} from './ratings/directorsCuts';

// Re-export types for backward compatibility
export type { EditRatingResult, StudioEditRequest } from './ratings/ratingEditing';
