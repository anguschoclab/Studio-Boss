import { GameState } from "@/engine/types";
import type {
  TalentUpdateImpact,
  TalentAddedImpact,
  TalentRemovedImpact,
  CastingConstraintCheckedImpact,
  MedicalLeaveTriggeredImpact,
} from "@/engine/types/state.types";

/**
 * Talent-related impact handlers
 * Pure functions that apply talent-related state impacts
 */

export function handleTalentUpdated(state: GameState, impact: TalentUpdateImpact): GameState {
  const { talentId, update } = impact.payload;
  if (!state.entities?.talents) return state;
  const talents = { ...state.entities.talents };
  const talent = talents[talentId];
  if (talent) {
    talents[talentId] = { ...talent, ...update };
  }
  return {
    ...state,
    entities: {
      ...state.entities,
      talents,
    },
  };
}

export function handleTalentAdded(state: GameState, impact: TalentAddedImpact): GameState {
  if (!impact.payload) return state;
  const { talent } = impact.payload;
  if (!talent || !state.entities) return state;
  return {
    ...state,
    entities: {
      ...state.entities,
      talents: { ...state.entities.talents, [talent.id]: talent },
    },
  };
}

export function handleTalentRemoved(state: GameState, impact: TalentRemovedImpact): GameState {
  if (!impact.payload) return state;
  const { talentId } = impact.payload;
  if (!talentId || !state.entities?.talents) return state;
  const talents = { ...state.entities.talents };
  delete talents[talentId];
  return {
    ...state,
    entities: {
      ...state.entities,
      talents,
    },
  };
}

export function handleCastingConstraintChecked(state: GameState, impact: CastingConstraintCheckedImpact): GameState {
  if (!impact.payload) return state;
  const { check, comfortLevel, premiumRates } = impact.payload;
  const talentId = (check as { talentId?: string })?.talentId;
  if (!talentId) return state;

  return {
    ...state,
    entities: {
      ...state.entities,
      talents: {
        ...state.entities.talents,
        [talentId]: {
          ...state.entities.talents?.[talentId],
          comfortLevel,
          comfortPremiumRates: premiumRates,
        },
      },
    },
  };
}

export function handleMedicalLeaveTriggered(state: GameState, impact: MedicalLeaveTriggeredImpact): GameState {
  const { talentId, weeks } = impact.payload;
  const talents = { ...state.entities.talents };
  const talent = talents[talentId];
  if (talent) {
    talents[talentId] = {
      ...talent,
      onMedicalLeave: true,
      medicalLeaveEndsWeek: state.week + weeks,
      fatigue: Math.max(0, (talent.fatigue ?? 0) - 20),
    };
  }
  return { ...state, entities: { ...state.entities, talents } };
}
