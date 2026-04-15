import {
  Project,
  RatingCut,
} from '@/engine/types';
import { StateImpact } from '@/engine/types/state.types';
import { evaluateFilmRating } from './ratingEvaluation';
import { evaluateRegionalRatings } from './regionalRatings';
import { RandomGenerator } from '../../utils/rng';

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
