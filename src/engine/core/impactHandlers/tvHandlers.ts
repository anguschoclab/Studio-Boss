import { GameState } from "@/engine/types";
import type {
  TVRecommendationCreatedImpact,
  TVRecommendationAcceptedImpact,
  TVRecommendationStateUpdatedImpact,
} from "@/engine/types/state.types";

/**
 * TV-related impact handlers
 * Pure functions that apply TV-related state impacts
 */

export function handleTVRecommendationCreated(state: GameState, impact: TVRecommendationCreatedImpact): GameState {
  if (!impact.payload) return state;
  const { recommendation } = impact.payload;
  if (!recommendation) return state;

  return {
    ...state,
    tvRecommendations: {
      ...state.tvRecommendations,
      recommendations: {
        ...state.tvRecommendations?.recommendations,
        [recommendation.id]: recommendation,
      },
    },
  };
}

export function handleTVRecommendationAccepted(state: GameState, impact: TVRecommendationAcceptedImpact): GameState {
  if (!impact.payload) return state;
  const { recommendationId } = impact.payload;
  if (!recommendationId) return state;

  const recommendations = state.tvRecommendations?.recommendations || {};
  const recommendation = recommendations[recommendationId];

  if (recommendation) {
    return {
      ...state,
      tvRecommendations: {
        ...state.tvRecommendations,
        recommendations: {
          ...recommendations,
          [recommendationId]: {
            ...recommendation,
            accepted: true,
            acceptedWeek: state.week,
          },
        },
      },
    };
  }
  return state;
}

export function handleTVRecommendationStateUpdated(
  state: GameState,
  impact: TVRecommendationStateUpdatedImpact
): GameState {
  if (!impact.payload) return state;
  const { tvRecommendations } = impact.payload;
  if (!tvRecommendations) return state;

  return {
    ...state,
    tvRecommendations: {
      ...state.tvRecommendations,
      ...tvRecommendations,
    },
  };
}
