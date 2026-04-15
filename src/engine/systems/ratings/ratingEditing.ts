import {
  ContentFlag,
  Project,
  GameState,
  RatingCut,
} from '@/engine/types';
import { StateImpact } from '@/engine/types/state.types';
import { DirectorArchetype } from '@/engine/types/talent.types';
import { hasCreativeControl } from '../directors';
import { evaluateRegionalRatings } from './regionalRatings';
import { evaluateRating } from './ratingEvaluation';
import { RandomGenerator } from '../../utils/rng';

export interface EditRatingResult {
  success: boolean;
  data?: Project;
  error?: string;
}

/** Buzz penalty by flag severity when content is removed */
function getBuzzPenaltyForFlag(flag: ContentFlag): number {
  if (flag === 'gore' || flag === 'nudity' || flag === 'sexual_content') return 12;
  if (flag === 'violence') return 7;
  if (flag === 'profanity') return 5;
  return 3;
}

/** Returns true if removing this flag warrants a "Sanitized" label and enables director's cut */
function isMajorFlag(flag: ContentFlag): boolean {
  return flag === 'gore' || flag === 'nudity' || flag === 'sexual_content' || flag === 'violence';
}

/**
 * Strips a content flag from a project to lower its rating.
 * Kept backward-compatible for existing tests (returns EditRatingResult).
 * For engine-facing use with director reactions, use requestStudioEdit().
 */
export function editForRating(project: Project, state: GameState, targetRemoval: ContentFlag): EditRatingResult {
  if (!project.contentFlags || !project.contentFlags.includes(targetRemoval)) {
    return { success: true, data: project };
  }

  if (hasCreativeControl(project.id, state)) {
    return {
      success: false,
      error: 'Director has final cut. You cannot edit for rating without breaching contract.'
    };
  }

  const newFlags = project.contentFlags.filter(f => f !== targetRemoval);
  const newRating = evaluateRating(newFlags);
  const buzzPenalty = getBuzzPenaltyForFlag(targetRemoval);
  const wasMajor = isMajorFlag(targetRemoval);

  const sanitizedCut: RatingCut = {
    type: 'sanitized',
    rating: newRating,
    contentFlags: newFlags,
    buzzCost: buzzPenalty,
    revenueMultiplier: 1.0
  };

  const existingCuts = project.availableCuts || [];
  const updatedCuts = wasMajor
    ? [...existingCuts.filter(c => c.type !== 'sanitized'), sanitizedCut]
    : existingCuts;

  const updatedRegional = evaluateRegionalRatings(newFlags, newRating);

  return {
    success: true,
    data: {
      ...project,
      contentFlags: newFlags,
      rating: newRating,
      buzz: Math.max(0, project.buzz - buzzPenalty),
      flavor: wasMajor ? `${project.flavor} (Sanitized)` : project.flavor,
      availableCuts: updatedCuts,
      regionalRatings: updatedRegional,
      activeCut: 'sanitized'
    }
  };
}

export interface StudioEditRequest {
  projectId: string;
  flagToRemove: ContentFlag;
  directorId: string | null;
  directorHasFinalCut: boolean;
  directorArchetype: DirectorArchetype | null;
}

/**
 * Engine-facing studio edit request. Returns StateImpact[] for use in the
 * pipe-and-filter architecture. Handles director reactions and scandal triggers.
 */
export function requestStudioEdit(
  request: StudioEditRequest,
  project: Project,
  state: GameState,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];

  // Case 1: Director has final cut — surface a buyout modal
  if (request.directorHasFinalCut) {
    const buyoutCost = Math.round(500_000 + rng.next() * 1_500_000);
    impacts.push({
      type: 'MODAL_TRIGGERED',
      payload: {
        modalType: 'CRISIS',
        priority: 80,
        payload: {
          id: rng.uuid('CRS'),
          crisis: {
            crisisId: rng.uuid('CRS'),
            triggeredWeek: state.week,
            haltedProduction: false,
            description: `The director has final cut. You cannot edit "${project.title}" for rating without their approval.`,
            resolved: false,
            severity: 'medium',
            options: [
              {
                text: `Offer Buyout ($${buyoutCost.toLocaleString()})`,
                effectDescription: 'Pay the director to relinquish final cut on this specific edit.',
                cashPenalty: buyoutCost
              },
              {
                text: "Accept Director's Version",
                effectDescription: 'Release the film as-is with the director\'s cut intact.'
              }
            ]
          }
        }
      }
    });
    return impacts;
  }

  // Case 2: No final cut — proceed with edit
  const editResult = editForRating(project, state, request.flagToRemove);
  if (!editResult.success || !editResult.data) return impacts;

  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: { projectId: request.projectId, update: editResult.data }
  });

  // Director mood reaction
  if (request.directorId) {
    const director = state.entities.talents[request.directorId];
    if (director) {
      const moodDelta = request.directorArchetype === 'commercial_hack' ? 2
        : request.directorArchetype === 'journeyman' ? -5
        : request.directorArchetype === 'visionary' ? -10
        : request.directorArchetype === 'auteur' ? -15
        : -5;

      const newMood = Math.max(1, Math.min(100, (director.psychology?.mood || 50) + moodDelta));
      impacts.push({
        type: 'TALENT_UPDATED',
        payload: {
          talentId: request.directorId,
          update: {
            psychology: { ...director.psychology, mood: newMood }
          }
        }
      });

      // Scandal trigger for unhappy auteurs/visionaries
      const scandalChance = request.directorArchetype === 'auteur' ? 0.30
        : request.directorArchetype === 'visionary' ? 0.15
        : 0;

      if (scandalChance > 0 && rng.next() < scandalChance) {
        impacts.push({
          newScandals: [{
            id: rng.uuid('SND'),
            talentId: request.directorId,
            severity: 40 + Math.floor(rng.next() * 40),
            type: 'director_speaks_out',
            weeksRemaining: 3 + Math.floor(rng.next() * 4)
          }],
          newsEvents: [{
            id: rng.uuid('NWS'),
            week: state.week,
            type: 'SCANDAL',
            headline: 'DIRECTOR SPEAKS OUT',
            description: `${director.name} publicly condemns studio interference on "${project.title}", calling the cuts "a betrayal of the film's vision."`,
            publication: 'The Hollywood Reporter'
          }],
          prestigeChange: -8
        });
      }
    }
  }

  return impacts;
}
