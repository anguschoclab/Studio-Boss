import {
  ContentFlag,
  FilmRating,
  TvRating,
  ProjectRating,
  Project,
  GameState,
  RatingEconomics,
  RegionalRating,
  RatingCut,
  RatingMarket,
} from '@/engine/types';
import { StateImpact } from '@/engine/types/state.types';
import { DirectorArchetype } from '@/engine/types/talent.types';
import { hasCreativeControl } from './directors';
import { MARKET_CONFIGS, getBannedMarkets, getRestrictedMarkets } from '../data/ratingMarkets';
import { RandomGenerator } from '../utils/rng';

// ---------------------------------------------------------------------------
// Rating Evaluation
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Rating Economics
// ---------------------------------------------------------------------------

/**
 * Returns the economic modifier struct for a given rating.
 * These multipliers are applied to box office, merchandise, and streaming revenue.
 */
export function getRatingEconomics(rating: ProjectRating): RatingEconomics {
  switch (rating) {
    case 'G':
      return { theaterAccessPct: 1.0, audienceReachMultiplier: 0.85, merchMultiplier: 1.30, awardsPrestigeBonus: 0, streamingPremium: 0 };
    case 'PG':
      return { theaterAccessPct: 1.0, audienceReachMultiplier: 0.95, merchMultiplier: 1.15, awardsPrestigeBonus: 0, streamingPremium: 0 };
    case 'PG-13':
      return { theaterAccessPct: 1.0, audienceReachMultiplier: 1.0, merchMultiplier: 1.0, awardsPrestigeBonus: 0, streamingPremium: 0 };
    case 'R':
      return { theaterAccessPct: 0.85, audienceReachMultiplier: 0.85, merchMultiplier: 0.70, awardsPrestigeBonus: 10, streamingPremium: 0 };
    case 'NC-17':
      return { theaterAccessPct: 0.30, audienceReachMultiplier: 0.65, merchMultiplier: 0.30, awardsPrestigeBonus: -15, streamingPremium: 0.05 };
    case 'Unrated':
      return { theaterAccessPct: 0.15, audienceReachMultiplier: 0.60, merchMultiplier: 0.20, awardsPrestigeBonus: -20, streamingPremium: 0.20 };
    case 'TV-Y':
    case 'TV-G':
      return { theaterAccessPct: 1.0, audienceReachMultiplier: 0.85, merchMultiplier: 1.30, awardsPrestigeBonus: 0, streamingPremium: 0 };
    case 'TV-PG':
      return { theaterAccessPct: 1.0, audienceReachMultiplier: 0.95, merchMultiplier: 1.15, awardsPrestigeBonus: 0, streamingPremium: 0 };
    case 'TV-14':
      return { theaterAccessPct: 1.0, audienceReachMultiplier: 0.95, merchMultiplier: 1.0, awardsPrestigeBonus: 0, streamingPremium: 0 };
    case 'TV-MA':
      return { theaterAccessPct: 1.0, audienceReachMultiplier: 0.85, merchMultiplier: 0.70, awardsPrestigeBonus: 8, streamingPremium: 0.10 };
    default:
      return { theaterAccessPct: 1.0, audienceReachMultiplier: 1.0, merchMultiplier: 1.0, awardsPrestigeBonus: 0, streamingPremium: 0 };
  }
}

// ---------------------------------------------------------------------------
// Regional Rating Evaluation
// ---------------------------------------------------------------------------

/**
 * Returns a per-market rating and ban status for all 8 markets.
 * Stored on project.regionalRatings at greenlight time.
 */
export function evaluateRegionalRatings(flags: ContentFlag[], baseRating: ProjectRating): RegionalRating[] {
  const bannedMarkets = getBannedMarkets(flags);
  const restrictedMarkets = getRestrictedMarkets(flags);

  return (Object.keys(MARKET_CONFIGS) as RatingMarket[]).map(market => {
    const isBanned = bannedMarkets.includes(market);
    const isRestricted = restrictedMarkets.includes(market);
    const restrictionLevel = isBanned ? 'banned' : isRestricted ? 'major' : 'none';

    return {
      market,
      rating: baseRating,
      isBanned,
      restrictionLevel
    } as RegionalRating;
  });
}

/**
 * Calculates a composite global box-office penalty multiplier from content flags.
 * Uses MARKET_CONFIGS data: banned markets lose their full share, restricted markets
 * lose a fraction of their share.
 *
 * @param project - Takes the full project (backward-compatible with existing callers)
 * @returns Multiplier between 0.1 and 1.0
 */
export function calculateRegionalPenalties(project: Project): number {
  const flags = project.contentFlags || [];
  if (flags.length === 0) return 1.0;

  let totalLoss = 0;

  for (const market of Object.keys(MARKET_CONFIGS) as RatingMarket[]) {
    const config = MARKET_CONFIGS[market];
    const isBanned = config.bannedFlags.some(f => flags.includes(f));
    const isRestricted = config.restrictedFlags.some(f => flags.includes(f));

    if (isBanned) {
      totalLoss += config.boxOfficeSharePct;
    } else if (isRestricted) {
      totalLoss += config.boxOfficeSharePct * (1 - config.restrictionRevenueMultiplier);
    }
  }

  return Math.max(0.1, 1.0 - totalLoss);
}

// ---------------------------------------------------------------------------
// Edit for Rating
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Engine-facing Studio Edit Request (returns StateImpact[])
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Director's Cut
// ---------------------------------------------------------------------------

/**
 * Checks if a project is eligible to release a director's cut.
 */
export function checkDirectorsCutEligibility(
  project: Project,
  currentWeek: number
): { eligible: boolean; weeksUntilEarliestRelease: number } {
  const isReleased = project.state === 'released' || project.state === 'post_release';
  const wasSanitized = project.availableCuts?.some(c => c.type === 'sanitized') ?? false;
  const alreadyReleased = project.availableCuts?.some(c => c.type === 'directors_cut') ?? false;
  const alreadyNotified = project.directorsCutNotified ?? false;

  if (!isReleased || !wasSanitized || alreadyReleased || alreadyNotified) {
    return { eligible: false, weeksUntilEarliestRelease: 0 };
  }

  const weeksSinceRelease = project.releaseWeek !== null ? (currentWeek - (project.releaseWeek ?? 0)) : 0;
  const minWeeks = 4;

  if (weeksSinceRelease >= minWeeks) {
    return { eligible: true, weeksUntilEarliestRelease: 0 };
  }

  return { eligible: false, weeksUntilEarliestRelease: minWeeks - weeksSinceRelease };
}

/**
 * Releases a director's cut of a sanitized film.
 * Player-triggered action. Returns StateImpact[] for engine consumption.
 */
export function releaseDirectorsCut(
  project: Project,
  directorId: string | null,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];

  const openingDomestic = project.boxOffice?.openingWeekendDomestic ?? project.budget * 0.1;
  const revenueShare = 0.20 + rng.next() * 0.20; // 20-40%
  const cutRevenue = Math.round(openingDomestic * revenueShare);

  const directorsCut: RatingCut = {
    type: 'directors_cut',
    rating: project.contentFlags ? evaluateFilmRating(project.contentFlags) : 'R',
    contentFlags: project.contentFlags || [],
    buzzCost: 0,
    revenueMultiplier: revenueShare
  };

  const updatedCuts = [...(project.availableCuts || []), directorsCut];

  const awardsUpdate = project.awardsProfile
    ? {
        awardsProfile: {
          ...project.awardsProfile,
          academyAppeal: Math.min(100, project.awardsProfile.academyAppeal + 5),
          festivalBuzz: Math.min(100, project.awardsProfile.festivalBuzz + 8)
        }
      }
    : {};

  impacts.push({
    cashChange: cutRevenue,
    prestigeChange: 8,
    projectUpdates: [{
      projectId: project.id,
      update: {
        buzz: Math.min(100, project.buzz + 15),
        activeCut: 'directors_cut',
        availableCuts: updatedCuts,
        ...awardsUpdate
      }
    }],
    newHeadlines: [{
      id: rng.uuid('NWS'),
      text: `Director's Cut of "${project.title}" arrives to critical acclaim`,
      week: 0, // will be set by coordinator context
      category: 'box_office',
      publication: 'Variety'
    }]
  });

  if (directorId) {
    const director = {} as any; // we only need the update, not the full talent
    impacts.push({
      type: 'TALENT_UPDATED',
      payload: {
        talentId: directorId,
        update: { prestige: undefined } // prestige will be incremented via a separate helper
      }
    });
    // Prestige increment via the TALENT_UPDATED mechanism needs current value.
    // Push a raw prestige-style note as a headline — director's actual prestige
    // change happens via the TalentSystem weekly cycle. We mark it via a news event.
    impacts.push({
      newsEvents: [{
        id: rng.uuid('NWS'),
        week: 0,
        type: 'MILESTONE',
        headline: "DIRECTOR'S VISION VINDICATED",
        description: `The director's cut release has significantly boosted their critical standing.`,
        publication: 'IndieWire'
      }]
    });
  }

  return impacts;
}

// ---------------------------------------------------------------------------
// Unrated Cut
// ---------------------------------------------------------------------------

/**
 * Marks a project for unrated release. Player-triggered at greenlight or post-theatrical.
 */
export function releaseUnrated(
  project: Project,
  week: number,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];

  const unratedCut: RatingCut = {
    type: 'unrated',
    rating: 'Unrated',
    contentFlags: project.contentFlags || [],
    buzzCost: 0,
    revenueMultiplier: 0.15 // very limited theatrical
  };

  const newRegional = evaluateRegionalRatings(project.contentFlags || [], 'Unrated');
  const updatedCuts = [...(project.availableCuts || []).filter(c => c.type !== 'unrated'), unratedCut];

  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: project.id,
      update: {
        rating: 'Unrated',
        activeCut: 'unrated',
        availableCuts: updatedCuts,
        regionalRatings: newRegional
      }
    }
  });

  // Extreme content stack triggers controversy
  const flags = project.contentFlags || [];
  const hasExtremeStack = flags.includes('gore') && flags.includes('sexual_content') && flags.includes('nudity');
  if (hasExtremeStack && rng.next() < 0.40) {
    impacts.push({
      newsEvents: [{
        id: rng.uuid('NWS'),
        week,
        type: 'SCANDAL',
        headline: 'CONTROVERSY ERUPTS',
        description: `The unrated release of "${project.title}" has sparked industry outrage over extreme content.`,
        publication: 'TMZ'
      }],
      prestigeChange: -5
    });
  }

  return impacts;
}
