import { Project, TVSeasonDetails } from '../../types';

/**
 * Pure helper for TV renewal decisions.
 * Evaluates a show's performance against its budget expectations.
 */
export function evaluateRenewal(project: Project, finalSeasonRating: number): 'RENEWED' | 'CANCELLED' {
  if (project.type !== 'TELEVISION' || !project.tvDetails) return 'CANCELLED';

  // Standard network logic: 
  // Ratings > 7.0 (on 10.0 scale) = Renewal
  // Ratings < 4.0 = Cancellation
  // In between = "On the Bubble" logic
  
  if (finalSeasonRating >= 70) return 'RENEWED';
  if (finalSeasonRating < 40) return 'CANCELLED';
  
  // 1. Budget impact: High-cost shows need higher ratings to stay alive
  if (project.budgetTier === 'blockbuster' || project.budgetTier === 'high') {
    if (finalSeasonRating < 60) return 'CANCELLED';
  }

  // 2. Prestige/Awards impact (future-proofing): 
  // If it's a prestige show, it might survive lower ratings
  if (project.tvFormat === 'prestige_drama' && finalSeasonRating > 50) return 'RENEWED';

  // 3. Random element for "The Bubble"
  return Math.random() > 0.4 ? 'RENEWED' : 'CANCELLED';
}
