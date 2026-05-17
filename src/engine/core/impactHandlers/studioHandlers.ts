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
  const payload = impact.payload || {};
  const { week, tickCount, __studioUpdate, studioIdentity, newAchievementId } = payload as unknown as {
    week?: number;
    tickCount?: number;
    __studioUpdate?: Partial<typeof state.studio>;
    studioIdentity?: Partial<typeof state.studio.identity>;
    newAchievementId?: string;
  };

  let updated: GameState = {
    ...state,
    week: week ?? state.week,
    tickCount: tickCount ?? state.tickCount
  };

  // Generic studio property patch (used by loan tick, identity tick, etc.)
  if (__studioUpdate) {
    updated = {
      ...updated,
      studio: { ...updated.studio, ...__studioUpdate }
    };
  }

  // Studio identity axes update
  if (studioIdentity) {
    updated = {
      ...updated,
      studio: {
        ...updated.studio,
        identity: { ...updated.studio.identity, ...studioIdentity }
      }
    };
  }

  // New achievement ID unlock
  if (newAchievementId) {
    const existing: string[] = updated.studio.achievements ?? [];
    if (!existing.includes(newAchievementId)) {
      updated = {
        ...updated,
        studio: {
          ...updated.studio,
          achievements: [...existing, newAchievementId]
        }
      };
    }
  }

  return updated;
}
