import { GameState, StateImpact, Talent, Project } from "../../types";
import { RandomGenerator } from "../../utils/rng";
import { getContractsByProjectId } from "../../utils";
import { BreakoutStar, BreakoutTrigger, HiddenTalent } from "../../types/discovery.types";
import { checkForBreakout } from "./discovery/BreakoutStarEngine";
import { generateGuestStarBooking } from "./discovery/GuestStarEngine";
import { generateHiddenTalent, discoverHiddenTalent } from "./discovery/HiddenTalentPool";

/**
 * Talent Discovery System
 * Orchestrates breakout stars, guest star appearances, and discovery of hidden talent.
 * Creates unexpected career trajectories and TV crossovers.
 */

// Guest star thresholds
const MIN_STARMETER_FOR_GUEST = 60; // Must be somewhat famous
const GUEST_STAR_CHANCE = 0.1; // 10% per series per week

// Hidden talent generation
const HIDDEN_TALENT_POOL_SIZE = 20;
const DISCOVERY_CHANCE = 0.05; // 5% per week per studio

/**
 * Main talent discovery tick
 */
export function tickTalentDiscoverySystem(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];

  const projectsDict = state.entities.projects || {};
  for (const pId in projectsDict) {
    const project = projectsDict[pId];
    const releaseWeek = project.releaseWeek;
    if (!(releaseWeek && state.week - releaseWeek >= 0 && state.week - releaseWeek <= 4)) {
      continue;
    }

    const projectContracts = getContractsByProjectId(
      state.entities.contractsByProjectId,
      state.entities.contracts,
      project.id
    );
    const talentIds = projectContracts.map((c) => c.talentId);

    for (const tId of talentIds) {
      const talent = state.entities.talents?.[tId];
      if (!talent) continue;
      const breakout = checkForBreakout(talent, project, state, rng);

      if (breakout) {
        // Create breakout record
        impacts.push({
          type: "BREAKOUT_STAR_CREATED",
          payload: {
            breakout,
            notification: `${talent.name} is breaking out from "${project.title}"!`,
          },
        });

        // Update talent stats
        impacts.push({
          type: "TALENT_UPDATED",
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
          indie_hit: "breakout performance in an indie hit",
          viral_scene: "viral scene taking over social media",
          cameo_steal: "scene-stealing cameo",
          tv_performance: "standout TV performance",
          award_nomination: "surprise award nomination",
          critical_praise: "unanimous critical praise",
        };

        impacts.push({
          type: "NEWS_ADDED",
          payload: {
            id: rng.uuid("NWS"),
            headline: `Breakout Star Alert: ${talent.name}`,
            description: `${talent.name} is Hollywood's newest breakout sensation thanks to their ${triggerDescriptions[breakout.trigger]}. Studios are scrambling to sign them.`,
            category: "talent",
            publication: "Variety",
          },
        });

        // Create bidding war notification for player
        impacts.push({
          type: "MODAL_TRIGGERED",
          payload: {
            modalType: "BREAKOUT_BIDDING_WAR",
            talentId: talent.id,
            currentFee: Math.floor(talent.fee * breakout.feeMultiplier),
            competingStudios: Object.keys(state.entities.rivals || {}).slice(0, 3),
          },
        } as unknown as StateImpact);
      }
    }
  }

  // 2. Check for guest star opportunities on TV series
  const activeSeries: Project[] = [];
  for (const pId in projectsDict) {
    const p = projectsDict[pId];
    if (p.type === "SERIES" && p.state === "released") {
      activeSeries.push(p);
    }
  }

  // Get guest star candidates (famous but not lead cast)
  const guestCandidates: Talent[] = [];
  const talentsDict = state.entities.talents || {};
  for (const tId in talentsDict) {
    const t = talentsDict[tId];
    if (
      (t.starMeter || 50) >= MIN_STARMETER_FOR_GUEST &&
      (t.tier === "A_LIST" || t.tier === "B_LIST")
    ) {
      guestCandidates.push(t);
    }
  }

  for (const series of activeSeries) {
    if (rng.next() < GUEST_STAR_CHANCE && guestCandidates.length > 0) {
      const guest = rng.pick(guestCandidates);

      // Check if already booked
      let alreadyBooked = false;
      const bookingsDict = state.relationships?.discovery?.guestStarBookings || {};
      for (const bId in bookingsDict) {
        const b = bookingsDict[bId];
        if (b && b.talentId === guest.id && b.seriesId === series.id) {
          alreadyBooked = true;
          break;
        }
      }

      if (!alreadyBooked) {
        const booking = generateGuestStarBooking(series, guest, state, rng);

        if (booking) {
          impacts.push({
            type: "GUEST_STAR_OPPORTUNITY",
            payload: {
              booking,
              notification: `${guest.name} available for guest appearance on "${series.title}"`,
            },
          } as unknown as StateImpact);

          // News about exciting casting
          impacts.push({
            type: "NEWS_ADDED",
            payload: {
              id: rng.uuid("NWS"),
              headline: `${guest.name} to Appear on "${series.title}"`,
              description: `The ${booking.roleType} appearance is expected to boost ratings significantly.`,
              category: "talent",
              publication: "The Hollywood Reporter",
            },
          });
        }
      }
    }
  }

  // 3. Maintain hidden talent pool
  const discoveryState = state.relationships?.discovery || {};
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
      type: "DISCOVERY_STATE_UPDATED",
      payload: {
        discovery: {
          ...discoveryState,
          hiddenTalentPool: hiddenPool,
        },
      },
    });
  }

  // 4. Hidden talent discovery
  // Studios can discover hidden talent
  if (rng.next() < DISCOVERY_CHANCE) {
    const undiscovered: HiddenTalent[] = [];
    for (const hId in hiddenPool) {
      if (!hiddenPool[hId].discoveredBy) {
        undiscovered.push(hiddenPool[hId]);
      }
    }

    if (undiscovered.length > 0) {
      const toDiscover = rng.pick(undiscovered);
      const { talent } = discoverHiddenTalent(
        { ...toDiscover, discoveredBy: "player", discoveryWeek: state.week },
        "player",
        state.week,
        state,
        rng
      );

      // Add talent to pool
      impacts.push({
        type: "TALENT_ADDED",
        payload: { talent },
      });

      // Remove from hidden pool
      const updatedPool = { ...hiddenPool };
      delete updatedPool[toDiscover.id];

      impacts.push({
        type: "DISCOVERY_STATE_UPDATED",
        payload: {
          discovery: {
            ...discoveryState,
            hiddenTalentPool: updatedPool,
            discoveryLog: [...(discoveryState.discoveryLog || []), toDiscover.id],
          },
        },
      });

      // Discovery news
      const methodDescriptions: Record<string, string> = {
        audition: "a stunning audition tape",
        recommendation: "an industry insider recommendation",
        scouting: "talent scouts at a local theater",
        viral_discovery: "a viral social media clip",
      };

      impacts.push({
        type: "NEWS_ADDED",
        payload: {
          id: rng.uuid("NWS"),
          headline: `Hidden Gem Discovered: ${talent.name}`,
          description: `Your scouts found ${talent.name} through ${methodDescriptions[toDiscover.discoveryMethod]}. They show incredible potential.`,
          category: "talent",
          publication: "Deadline",
        },
      });
    }
  }

  // 5. Update existing breakout stars
  const breakoutsDict = discoveryState.breakoutStars || {};
  for (const bId in breakoutsDict) {
    const breakout = breakoutsDict[bId] as BreakoutStar;
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
        type: "BREAKOUT_STAR_UPDATED",
        payload: {
          breakoutId: breakout.id,
          breakout: updatedBreakout,
        },
      });
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
  const discovery = state.relationships?.discovery || {};
  const booking = discovery.guestStarBookings?.[bookingId];

  if (!booking) return impacts;

  // Deduct cost
  impacts.push({
    type: "FUNDS_DEDUCTED",
    cashChange: -booking.cost,
  });

  // Update booking status
  const updatedBooking = { ...booking };

  impacts.push({
    type: "GUEST_STAR_BOOKED",
    payload: {
      bookingId,
      booking: updatedBooking,
    },
  });

  // Add contract for guest appearance
  impacts.push({
    type: "CONTRACT_ADDED",
    payload: {
      contract: {
        id: rng.uuid("CNT"),
        projectId: booking.seriesId,
        talentId: booking.talentId,
        fee: booking.cost,
        isGuestAppearance: true,
      } as unknown as import("../../types").Contract,
    },
  } as unknown as StateImpact);

  // News
  const series = state.entities.projects?.[booking.seriesId];
  const talent = state.entities.talents?.[booking.talentId];

  impacts.push({
    type: "NEWS_ADDED",
    payload: {
      id: rng.uuid("NWS"),
      headline: `${talent?.name} Confirmed for "${series?.title}"`,
      description: `The guest appearance has been officially confirmed. Fans are already excited.`,
      category: "talent",
      publication: "Variety",
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
  const discovery = state.relationships?.discovery || {};
  const breakout = discovery.breakoutStars?.[breakoutId];

  if (!breakout || !breakout.biddingWarActive) return impacts;

  // Deduct signing fee
  impacts.push({
    type: "FUNDS_DEDUCTED",
    cashChange: -offerFee,
  });

  // Update breakout status
  const updatedBreakout: BreakoutStar = {
    ...breakout,
    signedByStudioId: studioId,
    biddingWarActive: false,
  };

  impacts.push({
    type: "BREAKOUT_STAR_UPDATED",
    payload: {
      breakoutId,
      breakout: updatedBreakout,
    },
  });

  // Update talent contract status
  const talent = state.entities.talents?.[breakout.talentId];
  if (talent) {
    impacts.push({
      type: "TALENT_UPDATED",
      payload: {
        talentId: talent.id,
        update: {
          fee: offerFee,
        } as unknown as Partial<Talent>,
      },
    } as unknown as StateImpact);

    // News
    impacts.push({
      type: "NEWS_ADDED",
      payload: {
        id: rng.uuid("NWS"),
        headline: `${talent.name} Signs with Studio`,
        description: `After a fierce bidding war, the breakout star has signed a lucrative deal.`,
        category: "talent",
        publication: "The Hollywood Reporter",
      },
    });
  }

  return impacts;
}
