import { GameState } from "@/engine/types";
import type {
  RelationshipFormedImpact,
  RelationshipUpdatedImpact,
  CliqueFormedImpact,
  CliqueUpdatedImpact,
  ScreenplayNoteCreatedImpact,
  ScreenplayNoteImplementedImpact,
  ProductionAdditionCreatedImpact,
  CreditSceneCreatedImpact,
  CreditSceneUpdatedImpact,
  TalkShowAppearanceCreatedImpact,
  PhotoshootCreatedImpact,
  PressTourCreatedImpact,
  BreakoutStarCreatedImpact,
  BreakoutStarUpdatedImpact,
  GuestStarOpportunityImpact,
  GuestStarBookedImpact,
  DiscoveryStateUpdatedImpact,
} from "@/engine/types/state.types";

/**
 * Relationship-related impact handlers
 * Pure functions that apply relationship-related state impacts
 */

export function handleRelationshipFormed(state: GameState, impact: RelationshipFormedImpact): GameState {
  if (!impact.payload) return state;
  const { key, relationship } = impact.payload;
  if (!key || !relationship) return state;
  return {
    ...state,
    relationships: {
      ...state.relationships,
      relationships: {
        ...state.relationships?.relationships,
        [key]: relationship,
      },
    },
  };
}

export function handleRelationshipUpdated(state: GameState, impact: RelationshipUpdatedImpact): GameState {
  if (!impact.payload) return state;
  const { key, relationship, relationshipId } = impact.payload;

  // Talent-agent relationship path
  if (relationshipId && relationship) {
    return {
      ...state,
      talentAgentRelationships: {
        ...(state.talentAgentRelationships || {}),
        [relationshipId]: relationship as unknown as import("../../systems/talent/talentAgentInteractions").TalentAgentRelationship,
      },
    };
  }

  // Talent-talent relationship path
  if (!key || !relationship) return state;
  return {
    ...state,
    relationships: {
      ...state.relationships,
      relationships: {
        ...state.relationships?.relationships,
        [key]: relationship,
      },
    },
  };
}

export function handleCliqueFormed(state: GameState, impact: CliqueFormedImpact): GameState {
  if (!impact.payload) return state;
  const { cliqueId, clique } = impact.payload;
  if (!cliqueId || !clique) return state;

  const existingCliques = state.relationships?.cliques?.cliques || {};
  const existingMemberMap = state.relationships?.cliques?.memberCliqueMap || {};

  const updatedMemberMap = { ...existingMemberMap };
  for (const memberId of clique.members) {
    updatedMemberMap[memberId] = [...(updatedMemberMap[memberId] || []), cliqueId];
  }

  return {
    ...state,
    relationships: {
      ...state.relationships,
      cliques: {
        cliques: {
          ...existingCliques,
          [cliqueId]: clique,
        },
        memberCliqueMap: updatedMemberMap,
      },
    },
  };
}

export function handleCliqueUpdated(state: GameState, impact: CliqueUpdatedImpact): GameState {
  if (!impact.payload) return state;
  const { cliqueId, clique } = impact.payload;
  if (!cliqueId || !clique) return state;

  const existingCliques = state.relationships?.cliques?.cliques || {};
  const existingMemberMap = state.relationships?.cliques?.memberCliqueMap || {};

  return {
    ...state,
    relationships: {
      ...state.relationships,
      cliques: {
        cliques: {
          ...existingCliques,
          [cliqueId]: clique,
        },
        memberCliqueMap: existingMemberMap,
      },
    },
  };
}

export function handleScreenplayNoteCreated(state: GameState, impact: ScreenplayNoteCreatedImpact): GameState {
  if (!impact.payload) return state;
  const { note } = impact.payload;
  if (!note) return state;

  const existingNotes = state.relationships?.productionEnhancements?.screenplayNotes || {};

  return {
    ...state,
    relationships: {
      ...state.relationships,
      productionEnhancements: {
        ...state.relationships?.productionEnhancements,
        screenplayNotes: {
          ...existingNotes,
          [note.id]: note,
        },
        productionAdditions: state.relationships?.productionEnhancements?.productionAdditions || {},
        creditScenes: state.relationships?.productionEnhancements?.creditScenes || {},
      },
    },
  };
}

export function handleScreenplayNoteImplemented(state: GameState, impact: ScreenplayNoteImplementedImpact): GameState {
  if (!impact.payload) return state;
  const { noteId, note } = impact.payload;
  if (!noteId || !note) return state;

  const existingNotes = state.relationships?.productionEnhancements?.screenplayNotes || {};

  return {
    ...state,
    relationships: {
      ...state.relationships,
      productionEnhancements: {
        ...state.relationships?.productionEnhancements,
        screenplayNotes: {
          ...existingNotes,
          [noteId]: note,
        },
        productionAdditions: state.relationships?.productionEnhancements?.productionAdditions || {},
        creditScenes: state.relationships?.productionEnhancements?.creditScenes || {},
      },
    },
  };
}

export function handleProductionAdditionCreated(state: GameState, impact: ProductionAdditionCreatedImpact): GameState {
  if (!impact.payload) return state;
  const { addition } = impact.payload;
  if (!addition) return state;

  const existingAdditions = state.relationships?.productionEnhancements?.productionAdditions || {};

  return {
    ...state,
    relationships: {
      ...state.relationships,
      productionEnhancements: {
        ...state.relationships?.productionEnhancements,
        screenplayNotes: state.relationships?.productionEnhancements?.screenplayNotes || {},
        productionAdditions: {
          ...existingAdditions,
          [addition.id]: addition,
        },
        creditScenes: state.relationships?.productionEnhancements?.creditScenes || {},
      },
    },
  };
}

export function handleCreditSceneCreatedOrUpdated(
  state: GameState,
  impact: CreditSceneCreatedImpact | CreditSceneUpdatedImpact
): GameState {
  if (!impact.payload) return state;
  const { scene } = impact.payload;
  if (!scene) return state;

  const existingScenes = state.relationships?.productionEnhancements?.creditScenes || {};

  return {
    ...state,
    relationships: {
      ...state.relationships,
      productionEnhancements: {
        ...state.relationships?.productionEnhancements,
        screenplayNotes: state.relationships?.productionEnhancements?.screenplayNotes || {},
        productionAdditions: state.relationships?.productionEnhancements?.productionAdditions || {},
        creditScenes: {
          ...existingScenes,
          [scene.id]: scene,
        },
      },
    },
  };
}

export function handleTalkShowAppearanceCreated(state: GameState, impact: TalkShowAppearanceCreatedImpact): GameState {
  if (!impact.payload) return state;
  const { appearance } = impact.payload;
  if (!appearance) return state;

  const existingAppearances = state.relationships?.marketingPromotions?.talkShowAppearances || {};

  return {
    ...state,
    relationships: {
      ...state.relationships,
      marketingPromotions: {
        ...state.relationships?.marketingPromotions,
        talkShowAppearances: {
          ...existingAppearances,
          [appearance.id]: appearance,
        },
        photoshoots: state.relationships?.marketingPromotions?.photoshoots || {},
        activePressTours: state.relationships?.marketingPromotions?.activePressTours || {},
      },
    },
  };
}

export function handlePhotoshootCreated(state: GameState, impact: PhotoshootCreatedImpact): GameState {
  if (!impact.payload) return state;
  const { photoshoot } = impact.payload;
  if (!photoshoot) return state;

  const existingPhotoshoots = state.relationships?.marketingPromotions?.photoshoots || {};

  return {
    ...state,
    relationships: {
      ...state.relationships,
      marketingPromotions: {
        ...state.relationships?.marketingPromotions,
        talkShowAppearances: state.relationships?.marketingPromotions?.talkShowAppearances || {},
        photoshoots: {
          ...existingPhotoshoots,
          [photoshoot.id]: photoshoot,
        },
        activePressTours: state.relationships?.marketingPromotions?.activePressTours || {},
      },
    },
  };
}

export function handlePressTourCreated(state: GameState, impact: PressTourCreatedImpact): GameState {
  if (!impact.payload) return state;
  const { tour } = impact.payload;
  if (!tour) return state;

  const existingTours = state.relationships?.marketingPromotions?.activePressTours || {};

  return {
    ...state,
    relationships: {
      ...state.relationships,
      marketingPromotions: {
        ...state.relationships?.marketingPromotions,
        talkShowAppearances: state.relationships?.marketingPromotions?.talkShowAppearances || {},
        photoshoots: state.relationships?.marketingPromotions?.photoshoots || {},
        activePressTours: {
          ...existingTours,
          [tour.id]: tour,
        },
      },
    },
  };
}

export function handleBreakoutStarCreatedOrUpdated(
  state: GameState,
  impact: BreakoutStarCreatedImpact | BreakoutStarUpdatedImpact
): GameState {
  if (!impact.payload) return state;
  const { breakoutId, breakout } = impact.payload;
  if (!breakout) return state;

  const existingBreakouts = state.relationships?.discovery?.breakoutStars || {};
  const id = breakoutId || breakout.id;

  return {
    ...state,
    relationships: {
      ...state.relationships,
      discovery: {
        ...state.relationships?.discovery,
        breakoutStars: {
          ...existingBreakouts,
          [id]: breakout,
        },
        guestStarBookings: state.relationships?.discovery?.guestStarBookings || {},
        hiddenTalentPool: state.relationships?.discovery?.hiddenTalentPool || {},
        discoveryLog: state.relationships?.discovery?.discoveryLog || [],
      },
    },
  };
}

export function handleGuestStarOpportunityOrBooked(
  state: GameState,
  impact: GuestStarOpportunityImpact | GuestStarBookedImpact
): GameState {
  if (!impact.payload) return state;
  const { bookingId, booking } = impact.payload;
  if (!booking) return state;

  const existingBookings = state.relationships?.discovery?.guestStarBookings || {};
  const id = bookingId || booking.id;

  return {
    ...state,
    relationships: {
      ...state.relationships,
      discovery: {
        ...state.relationships?.discovery,
        breakoutStars: state.relationships?.discovery?.breakoutStars || {},
        guestStarBookings: {
          ...existingBookings,
          [id]: booking,
        },
        hiddenTalentPool: state.relationships?.discovery?.hiddenTalentPool || {},
        discoveryLog: state.relationships?.discovery?.discoveryLog || [],
      },
    },
  };
}

export function handleDiscoveryStateUpdated(state: GameState, impact: DiscoveryStateUpdatedImpact): GameState {
  if (!impact.payload) return state;
  const { discovery } = impact.payload;
  if (!discovery) return state;

  return {
    ...state,
    relationships: {
      ...state.relationships,
      discovery: {
        ...state.relationships?.discovery,
        ...discovery,
      },
    },
  };
}
