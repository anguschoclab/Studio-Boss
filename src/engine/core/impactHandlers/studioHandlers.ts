import { GameState, StateImpact, NewsEvent } from '@/engine/types';

/**
 * Studio-related impact handlers
 * Pure functions that apply studio-related state impacts
 */

export function handlePrestigeChanged(state: GameState, impact: StateImpact): GameState {
  const { amount } = impact.payload;
  return {
    ...state,
    studio: {
      ...state.studio,
      prestige: Math.max(0, state.studio.prestige + amount)
    }
  };
}

export function handleNewsAdded(state: GameState, impact: StateImpact): GameState {
  const { id, headline, description, publication } = impact.payload;
  const newsEvent: NewsEvent = {
    id: id,
    week: state.week,
    type: 'STUDIO_EVENT',
    headline: headline,
    description: description,
    publication: publication
  };
  return {
    ...state,
    industry: {
      ...state.industry,
      newsHistory: [newsEvent, ...state.industry.newsHistory].slice(0, 100)
    }
  };
}

export function handleSystemTick(state: GameState, impact: StateImpact): GameState {
  const { week, tickCount } = impact.payload || {};
  return {
    ...state,
    week: week ?? state.week,
    tickCount: tickCount ?? state.tickCount
  };
}
