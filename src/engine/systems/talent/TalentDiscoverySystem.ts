import { GameState, StateImpact, Talent, Project } from '../../types';
import { RandomGenerator } from '../../utils/rng';
import {
  BreakoutStar,
  BreakoutTrigger,
  GuestStarBooking,
  HiddenTalent,
  DiscoveryEvent,
} from '../../types/discovery.types';
import { getTalentRelationships, areFriends } from './RelationshipSystem';

/**
 * Talent Discovery System
 * Manages breakout stars, guest star appearances, and discovery of hidden talent.
 * Creates unexpected career trajectories and TV crossovers.
 */

// Base breakout chances
const INDIE_HIT_CHANCE = 0.05;
const VIRAL_SCENE_CHANCE = 0.08;
const CAMEO_STEAL_CHANCE = 0.03;
const TV_PERFORMANCE_CHANCE = 0.06;

// Guest star thresholds
const MIN_STARMETER_FOR_GUEST = 60; // Must be somewhat famous
const GUEST_STAR_CHANCE = 0.1; // 10% per series per week

// Hidden talent generation
const HIDDEN_TALENT_POOL_SIZE = 20;
const DISCOVERY_CHANCE = 0.05; // 5% per week per studio

/**
 * Check for breakout star potential
 */
function checkForBreakout(
  talent: Talent,
  project: Project,
  state: GameState,
  rng: RandomGenerator
): BreakoutStar | null {
  // Skip if already a breakout or top tier
  if ((talent as any).isBreakout) return null;
  if (talent.tier === 1) return null;

  const currentStarMeter = talent.starMeter || 50;

  // Indie film breakout
  if (project.type === 'FILM' && project.budget < 5000000 && rng.next() < INDIE_HIT_CHANCE) {
    const starMeterJump = rng.rangeInt(25, 45);
    return createBreakoutStar(talent, project, 'indie_hit', starMeterJump, state.week, rng);
  }

  // Viral scene breakout
  if (rng.next() < VIRAL_SCENE_CHANCE && currentStarMeter < 70) {
    const starMeterJump = rng.rangeInt(20, 35);
    return createBreakoutStar(talent, project, 'viral_scene', starMeterJump, state.week, rng);
  }

  // Cameo steal breakout (small role, big impact)
  if (project.type === 'FILM' && rng.next() < CAMEO_STEAL_CHANCE) {
    const starMeterJump = rng.rangeInt(15, 30);
    return createBreakoutStar(talent, project, 'cameo_steal', starMeterJump, state.week, rng);
  }

  // TV performance breakout
  if (project.type === 'SERIES' && rng.next() < TV_PERFORMANCE_CHANCE) {
    const starMeterJump = rng.rangeInt(15, 25);
    return createBreakoutStar(talent, project, 'tv_performance', starMeterJump, state.week, rng);
  }

  return null;
}

/**
 * Create a breakout star record
 */
function createBreakoutStar(
  talent: Talent,
  project: Project,
  trigger: BreakoutTrigger,
  starMeterJump: number,
  week: number,
  rng: RandomGenerator
): BreakoutStar {
  const previousStarMeter = talent.starMeter || 50;
  const newStarMeter = Math.min(100, previousStarMeter + starMeterJump);

  // Calculate new tier based on star meter
  let newTier = talent.tier;
  if (newStarMeter > 80) newTier = 1;
  else if (newStarMeter > 60) newTier = 2;
  else if (newStarMeter > 40) newTier = 3;

  // Fee multiplier based on jump size
  const feeMultiplier = 1 + (starMeterJump / 20);

  // Hype duration (longer for bigger jumps)
  const hypeWeeksRemaining = rng.rangeInt(12, 52);

  // 70% chance of sustained success (not one-hit-wonder)
  const sustainedSuccess = rng.next() < 0.7;
  const oneHitWonder = !sustainedSuccess;

  return {
    id: rng.uuid('BRK'),
    talentId: talent.id,
    trigger,
    projectId: project.id,
    week,
    previousStarMeter,
    previousTier: talent.tier,
    starMeterJump,
    newTier,
    feeMultiplier,
    hypeWeeksRemaining,
    biddingWarActive: true,
    sustainedSuccess,
    oneHitWonder,
  };
}

/**
 * Generate guest star booking for a TV series
 */
function generateGuestStarBooking(
  series: Project,
  guestTalent: Talent,
  state: GameState,
  rng: RandomGenerator
): GuestStarBooking | null {
  // Check if series has regular cast
  const seriesContracts = Object.values(state.entities.contracts || {})
    .filter(c => c.projectId === series.id);

  if (seriesContracts.length === 0) return null;

  // Determine role type
  const roleTypes: Array<'cameo' | 'recurring_guest' | 'special_guest' | 'crossover'> = [
    'cameo', 'cameo', 'recurring_guest', 'special_guest'
  ];
  const roleType = rng.pick(roleTypes);

  // Calculate impact on ratings
  const baseImpact = (guestTalent.starMeter || 50) / 10;
  const chemistryBonus = rng.rangeInt(-5, 15); // Chemistry with cast
  const impact = Math.max(1, Math.min(20, baseImpact + chemistryBonus));

  // Cost based on talent tier and role
  const baseCost = guestTalent.tier === 1 ? 500000 :
                   guestTalent.tier === 2 ? 200000 :
                   guestTalent.tier === 3 ? 100000 : 50000;
  const cost = baseCost * (roleType === 'cameo' ? 0.3 : 1);

  // Fan reaction prediction
  const fanReactionRoll = rng.next();
  let fanReaction: GuestStarBooking['fanReaction'] = 'positive';
  if (fanReactionRoll < 0.05) fanReaction = 'negative';
  else if (fanReactionRoll < 0.15) fanReaction = 'mixed';
  else if (fanReactionRoll > 0.85 && guestTalent.starMeter && guestTalent.starMeter > 80) {
    fanReaction = 'viral';
  }

  // Get series details
  const seriesDetails = (series as any).tvSeasonDetails;
  const seasonNumber = seriesDetails?.currentSeason || 1;
  const episodeNumber = seriesDetails?.episodesOrdered || rng.rangeInt(1, 10);

  return {
    id: rng.uuid('GST'),
    talentId: guestTalent.id,
    seriesId: series.id,
    episodeNumber,
    seasonNumber,
    roleType,
    impact,
    cost,
    chemistryWithCast: Math.max(0, Math.min(100, 50 + chemistryBonus * 3)),
    fanReaction,
  };
}

/**
 * Generate hidden talent for the pool
 */
function generateHiddenTalent(rng: RandomGenerator): HiddenTalent {
  const potential = rng.rangeInt(60, 100);
  const currentSkill = rng.rangeInt(30, potential);
  const age = rng.rangeInt(18, 35);

  return {
    id: rng.uuid('HTL'),
    name: generateHiddenTalentName(rng),
    age,
    potential,
    currentSkill,
    discoveryMethod: rng.pick(['audition', 'recommendation', 'scouting', 'viral_discovery']),
    askingPrice: rng.rangeInt(50000, 200000),
    charisma: rng.rangeInt(40, 95),
    prestige: rng.rangeInt(20, 60),
    draw: rng.rangeInt(30, 70),
    viralChance: rng.next() < 0.1 ? rng.rangeInt(30, 80) : 0,
  };
}

/**
 * Generate a name for hidden talent
 */
function generateHiddenTalentName(rng: RandomGenerator): string {
  const firstNames = ['Maya', 'River', 'Zion', 'Sage', 'Phoenix', 'Indigo', 'Orion', 'Nova',
                      'Luna', 'Stella', 'Axel', 'Jett', 'Cruz', 'Knox', 'Blake', 'Quinn'];
  const lastNames = ['Chen', 'Patel', 'Kim', 'Sato', 'Okafor', 'Baptiste', 'Andersson',
                     'Leroy', 'Rossi', 'Kowalski', 'Yilmaz', 'Santos', 'Reyes', 'Khan'];

  return `${rng.pick(firstNames)} ${rng.pick(lastNames)}`;
}

/**
 * Discover a hidden talent
 */
function discoverHiddenTalent(
  hiddenTalent: HiddenTalent,
  studioId: string,
  week: number,
  state: GameState,
  rng: RandomGenerator
): { talent: Talent; event: DiscoveryEvent } {
  // Convert hidden talent to full talent
  const newTalent: Talent = {
    id: hiddenTalent.id,
    name: hiddenTalent.name,
    role: 'actor',
    roles: ['actor'],
    tier: 4, // Start as unknown
    demographics: {
      age: hiddenTalent.age,
      gender: rng.next() < 0.5 ? 'MALE' : 'FEMALE',
      country: rng.pick(['USA', 'UK', 'Canada', 'Australia', 'Other']),
      ethnicity: 'varied',
    },
    accessLevel: 'outsider',
    momentum: 50,
    skills: {
      acting: hiddenTalent.currentSkill,
      directing: rng.rangeInt(20, 50),
      writing: rng.rangeInt(20, 50),
      stardom: hiddenTalent.charisma,
    },
    prestige: hiddenTalent.prestige,
    starMeter: rng.rangeInt(15, 35), // Unknown
    draw: hiddenTalent.draw,
    fee: hiddenTalent.askingPrice,
    commitments: [],
    fatigue: 0,
    preferredGenres: [],
    psychology: {
      ego: rng.rangeInt(30, 70),
      mood: rng.rangeInt(40, 80),
      scandalRisk: rng.rangeInt(20, 60),
      synergyAffinities: [],
      synergyConflicts: [],
    },
    personality: rng.pick(['charismatic', 'collaborative', 'difficult', 'perfectionist']),
    actorArchetype: rng.pick(['movie_star', 'prestige_actor', 'tv_star', 'character_actor']),
  };

  const event: DiscoveryEvent = {
    week,
    talentId: newTalent.id,
    method: hiddenTalent.discoveryMethod,
    studioId,
  };

  return { talent: newTalent, event };
}

/**
 * Main talent discovery tick
 */
export function tickTalentDiscoverySystem(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];

  // 1. Check for breakout stars from recent releases
  const recentProjects = Object.values(state.entities.projects || {})
    .filter(p => {
      const releaseWeek = (p as any).releaseWeek;
      return releaseWeek && state.week - releaseWeek >= 0 && state.week - releaseWeek <= 4;
    });

  for (const project of recentProjects) {
    // Get cast
    const projectContracts = Object.values(state.entities.contracts || {})
      .filter(c => c.projectId === project.id);
    const talents = projectContracts
      .map(c => state.entities.talents?.[c.talentId])
      .filter((t): t is Talent => !!t);

    for (const talent of talents) {
      const breakout = checkForBreakout(talent, project, state, rng);

      if (breakout) {
        // Create breakout record
        impacts.push({
          type: 'BREAKOUT_STAR_CREATED',
          payload: {
            breakout,
            notification: `${talent.name} is breaking out from "${project.title}"!`,
          },
        } as any);

        // Update talent stats
        impacts.push({
          type: 'TALENT_UPDATED',
          payload: {
            talentId: talent.id,
            update: {
              starMeter: Math.min(100, (talent.starMeter || 50) + breakout.starMeterJump),
              tier: breakout.newTier,
              fee: Math.floor(talent.fee * breakout.feeMultiplier),
              isBreakout: true,
            },
          },
        });

        // News announcement
        const triggerDescriptions: Record<BreakoutTrigger, string> = {
          'indie_hit': 'breakout performance in an indie hit',
          'viral_scene': 'viral scene taking over social media',
          'cameo_steal': 'scene-stealing cameo',
          'tv_performance': 'standout TV performance',
          'award_nomination': 'surprise award nomination',
          'critical_praise': 'unanimous critical praise',
        };

        impacts.push({
          type: 'NEWS_ADDED',
          payload: {
            id: rng.uuid('NWS'),
            headline: `Breakout Star Alert: ${talent.name}`,
            description: `${talent.name} is Hollywood's newest breakout sensation thanks to their ${triggerDescriptions[breakout.trigger]}. Studios are scrambling to sign them.`,
            category: 'talent',
            publication: 'Variety',
          },
        });

        // Create bidding war notification for player
        impacts.push({
          type: 'MODAL_TRIGGERED',
          payload: {
            modalType: 'BREAKOUT_BIDDING_WAR',
            talentId: talent.id,
            currentFee: Math.floor(talent.fee * breakout.feeMultiplier),
            competingStudios: Object.keys(state.entities.rivals || {}).slice(0, 3),
          },
        });
      }
    }
  }

  // 2. Check for guest star opportunities on TV series
  const activeSeries = Object.values(state.entities.projects || {})
    .filter(p => p.type === 'SERIES' && (p as any).status === 'ON_AIR');

  // Get guest star candidates (famous but not lead cast)
  const guestCandidates = Object.values(state.entities.talents || {})
    .filter(t => (t.starMeter || 50) >= MIN_STARMETER_FOR_GUEST && t.tier <= 2);

  for (const series of activeSeries) {
    if (rng.next() < GUEST_STAR_CHANCE && guestCandidates.length > 0) {
      const guest = rng.pick(guestCandidates);

      // Check if already booked
      const existingBookings = Object.values((state as any).relationships?.discovery?.guestStarBookings || {})
        .filter((b: any) => b.talentId === guest.id && b.seriesId === series.id);

      if (existingBookings.length === 0) {
        const booking = generateGuestStarBooking(series, guest, state, rng);

        if (booking) {
          impacts.push({
            type: 'GUEST_STAR_OPPORTUNITY',
            payload: {
              booking,
              notification: `${guest.name} available for guest appearance on "${series.title}"`,
            },
          } as any);

          // News about exciting casting
          impacts.push({
            type: 'NEWS_ADDED',
            payload: {
              id: rng.uuid('NWS'),
              headline: `${guest.name} to Appear on "${series.title}"`,
              description: `The ${booking.roleType} appearance is expected to boost ratings significantly.`,
              category: 'talent',
              publication: 'The Hollywood Reporter',
            },
          });
        }
      }
    }
  }

  // 3. Maintain hidden talent pool
  const discoveryState = (state as any).relationships?.discovery || {};
  let hiddenPool = discoveryState.hiddenTalentPool || {};

  // Replenish pool if low
  const hiddenCount = Object.keys(hiddenPool).length;
  if (hiddenCount < HIDDEN_TALENT_POOL_SIZE) {
    const toAdd = HIDDEN_TALENT_POOL_SIZE - hiddenCount;
    for (let i = 0; i < toAdd; i++) {
      const hidden = generateHiddenTalent(rng);
      hiddenPool = { ...hiddenPool, [hidden.id]: hidden };
    }

    impacts.push({
      type: 'DISCOVERY_STATE_UPDATED',
      payload: {
        discovery: {
          ...discoveryState,
          hiddenTalentPool: hiddenPool,
        },
      },
    } as any);
  }

  // 4. Hidden talent discovery
  // Studios can discover hidden talent
  if (rng.next() < DISCOVERY_CHANCE) {
    const undiscovered = (Object.values(hiddenPool) as HiddenTalent[])
      .filter(h => !h.discoveredBy);

    if (undiscovered.length > 0) {
      const toDiscover = rng.pick(undiscovered);
      const { talent, event } = discoverHiddenTalent(
        { ...toDiscover, discoveredBy: 'player', discoveryWeek: state.week },
        'player',
        state.week,
        state,
        rng
      );

      // Add talent to pool
      impacts.push({
        type: 'TALENT_ADDED',
        payload: { talent },
      });

      // Remove from hidden pool
      const updatedPool = { ...hiddenPool };
      delete updatedPool[toDiscover.id];

      impacts.push({
        type: 'DISCOVERY_STATE_UPDATED',
        payload: {
          discovery: {
            ...discoveryState,
            hiddenTalentPool: updatedPool,
            discoveryLog: [...(discoveryState.discoveryLog || []), toDiscover.id],
          },
        },
      } as any);

      // Discovery news
      const methodDescriptions: Record<string, string> = {
        'audition': 'a stunning audition tape',
        'recommendation': 'an industry insider recommendation',
        'scouting': 'talent scouts at a local theater',
        'viral_discovery': 'a viral social media clip',
      };

      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          id: rng.uuid('NWS'),
          headline: `Hidden Gem Discovered: ${talent.name}`,
          description: `Your scouts found ${talent.name} through ${methodDescriptions[toDiscover.discoveryMethod]}. They show incredible potential.`,
          category: 'talent',
          publication: 'Deadline',
        },
      });
    }
  }

  // 5. Update existing breakout stars
  const existingBreakouts = Object.values(discoveryState.breakoutStars || {}) as BreakoutStar[];
  for (const breakout of existingBreakouts) {
    if (breakout.hypeWeeksRemaining > 0) {
      const updatedBreakout: BreakoutStar = {
        ...breakout,
        hypeWeeksRemaining: breakout.hypeWeeksRemaining - 1,
      };

      // End bidding war after 4 weeks
      if (updatedBreakout.hypeWeeksRemaining <= breakout.hypeWeeksRemaining - 4) {
        updatedBreakout.biddingWarActive = false;
      }

      impacts.push({
        type: 'BREAKOUT_STAR_UPDATED',
        payload: {
          breakoutId: breakout.id,
          breakout: updatedBreakout,
        },
      } as any);
    }
  }

  return impacts;
}

/**
 * Accept a guest star booking
 */
export function acceptGuestStarBooking(
  bookingId: string,
  state: GameState,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const discovery = (state as any).relationships?.discovery || {};
  const booking = discovery.guestStarBookings?.[bookingId] as GuestStarBooking | undefined;

  if (!booking) return impacts;

  // Deduct cost
  impacts.push({
    type: 'FUNDS_DEDUCTED',
    cashChange: -booking.cost,
  });

  // Update booking status
  const updatedBooking = { ...booking };

  impacts.push({
    type: 'GUEST_STAR_BOOKED',
    payload: {
      bookingId,
      booking: updatedBooking,
    },
  } as any);

  // Add contract for guest appearance
  impacts.push({
    type: 'CONTRACT_ADDED',
    payload: {
      contract: {
        id: rng.uuid('CNT'),
        projectId: booking.seriesId,
        talentId: booking.talentId,
        fee: booking.cost,
        week: state.week,
        isGuestAppearance: true,
      },
    },
  } as any);

  // News
  const series = state.entities.projects?.[booking.seriesId];
  const talent = state.entities.talents?.[booking.talentId];

  impacts.push({
    type: 'NEWS_ADDED',
    payload: {
      id: rng.uuid('NWS'),
      headline: `${talent?.name} Confirmed for "${series?.title}"`,
      description: `The guest appearance has been officially confirmed. Fans are already excited.`,
      category: 'talent',
      publication: 'Variety',
    },
  });

  return impacts;
}

/**
 * Sign a breakout star
 */
export function signBreakoutStar(
  breakoutId: string,
  studioId: string,
  offerFee: number,
  state: GameState,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const discovery = (state as any).relationships?.discovery || {};
  const breakout = discovery.breakoutStars?.[breakoutId] as BreakoutStar | undefined;

  if (!breakout || !breakout.biddingWarActive) return impacts;

  // Deduct signing fee
  impacts.push({
    type: 'FUNDS_DEDUCTED',
    cashChange: -offerFee,
  });

  // Update breakout status
  const updatedBreakout: BreakoutStar = {
    ...breakout,
    signedByStudioId: studioId,
    biddingWarActive: false,
  };

  impacts.push({
    type: 'BREAKOUT_STAR_UPDATED',
    payload: {
      breakoutId,
      breakout: updatedBreakout,
    },
  } as any);

  // Update talent contract status
  const talent = state.entities.talents?.[breakout.talentId];
  if (talent) {
    impacts.push({
      type: 'TALENT_UPDATED',
      payload: {
        talentId: talent.id,
        update: {
          contractStatus: 'SIGNED',
          fee: offerFee,
        },
      },
    });

    // News
    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        id: rng.uuid('NWS'),
        headline: `${talent.name} Signs with Studio`,
        description: `After a fierce bidding war, the breakout star has signed a lucrative deal.`,
        category: 'talent',
        publication: 'The Hollywood Reporter',
      },
    });
  }

  return impacts;
}
