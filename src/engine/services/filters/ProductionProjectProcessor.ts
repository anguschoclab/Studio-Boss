import { GameState, Project } from '../../types';
import { TickContext } from './types';

// System Imports
import { tickScriptDevelopment } from '../../systems/production/ScriptDraftingSystem';
import { checkAndTriggerCrisis } from '../../systems/crises';
import { checkDirectorsCutEligibility } from '../../systems/ratings';
import { evaluateRatingForProject, evaluateRegionalRatings } from '../../systems/ratings';
import { generateMarketBanScandal } from '../../systems/scandals';
import { resolveCrisisWithHandlers } from '../../systems/production/crisisEvaluator';
import { calculateAudienceIndex } from '../../systems/demographics';

const ACTIVE_STAGES = new Set(['prep', 'production', 'post_production', 'marketing']);

/**
 * Production Project Processor
 * Handles individual project logic during production filter
 */
export const ProductionProjectProcessor = {
  /**
   * Process a single project's weekly production logic
   */
  processProject(project: Project, state: GameState, context: TickContext): void {
    // 1. Script drafting and crisis triggering
    if (project.state === 'development') {
      const impacts = tickScriptDevelopment(project, context.rng);
      context.impacts.push(...impacts);
    } else if (!project.activeCrisis && ACTIVE_STAGES.has(project.state)) {
      const impact = checkAndTriggerCrisis(project, state, context.rng);
      if (impact) context.impacts.push(impact);

      // Wiring: Resolve Crisis with Handlers (Strategy Pattern)
      if (project.activeCrisis) {
          const crisis = project.activeCrisis as import('../../types').ActiveCrisis;
          const crisisImpacts = resolveCrisisWithHandlers(state, project.id, context.rng.rangeInt(0, crisis.options.length - 1));
         context.impacts.push(...crisisImpacts);
      }
    }

    // 2. Director's cut eligibility
    if ((project.state === 'post_release' || project.state === 'released') && !project.directorsCutNotified) {
      const { eligible } = checkDirectorsCutEligibility(project, context.week);
      if (eligible) {
        // Mark as notified to prevent re-triggering every week
        context.impacts.push({
          type: 'PROJECT_UPDATED',
          payload: { projectId: project.id, update: { directorsCutNotified: true } }
        });
        context.impacts.push({
          type: 'MODAL_TRIGGERED',
          payload: {
            modalType: 'DIRECTORS_CUT_AVAILABLE',
            priority: 20,
            payload: { projectId: project.id, projectTitle: project.title }
          }
        });
      }
    }

    // 3. Auto-evaluate rating for projects with flags but no rating yet
    if (project.contentFlags?.length && !project.rating) {
      const newRating = evaluateRatingForProject(project.contentFlags, project.type);
      const newRegional = evaluateRegionalRatings(project.contentFlags, newRating);
      context.impacts.push({
        type: 'PROJECT_UPDATED',
        payload: { projectId: project.id, update: { rating: newRating, regionalRatings: newRegional } }
      });
    }

    // 4. Shopping expiry
    if (
      project.state === 'shopping' &&
      project.shoppingExpiresWeek !== undefined &&
      context.week >= project.shoppingExpiresWeek
    ) {
      context.impacts.push({
        type: 'PROJECT_UPDATED',
        payload: {
          projectId: project.id,
          update: { state: 'archived' as const }
        }
      });
      context.impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          id: context.rng.uuid('NWS'),
          headline: `"${project.title}" shopping window closes without a deal`,
          description: `The show has been shelved after failing to find a new network home.`,
          category: 'cancellation'
        }
      });
    }

    // 5. Scan released projects for newly banned markets
    if (project.regionalRatings && (project.state === 'released' || project.state === 'post_release')) {
      const bannedMarkets: import('../../types/project.types').RatingMarket[] = [];
      for (let j = 0; j < project.regionalRatings.length; j++) {
        if (project.regionalRatings[j].isBanned) {
          bannedMarkets.push(project.regionalRatings[j].market as import('../../types/project.types').RatingMarket);
        }
      }
      if (bannedMarkets.length > 0) {
        const banImpact = generateMarketBanScandal(project, bannedMarkets, context.week, state, context.rng);
        if (banImpact) context.impacts.push(banImpact);
      }
    }

    // 6. Release Simulation - calculate demographic resonance
    if (project.state === 'released') {
       // Default to four quadrant if not set by marketing
       const target = project.targetDemographic || 'four_quadrant';
       const resonance = calculateAudienceIndex(project, target) || 1.0;
       context.impacts.push({
         type: 'PROJECT_UPDATED',
         payload: { 
           projectId: project.id, 
           update: { 
             // Store resonance for revenue calculation later
             momentum: Math.min(100, Math.round((project.momentum || 50) * resonance))
           } 
         }
       });
    }
  }
};
