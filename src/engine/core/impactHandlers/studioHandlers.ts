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
  const typedPayload = payload as Record<string, unknown>;
  const { week, tickCount, __studioUpdate, studioIdentity, newAchievementId } = typedPayload;

  let updated: GameState = {
    ...state,
    week: (week as number) ?? state.week,
    tickCount: (tickCount as number) ?? state.tickCount
  };

  // Generic studio property patch (used by loan tick, identity tick, etc.)
  if (__studioUpdate) {
    updated = {
      ...updated,
      studio: { ...updated.studio, ...(__studioUpdate as Record<string, unknown>) }
    };
  }

  // Studio identity axes update
  if (studioIdentity) {
    updated = {
      ...updated,
      studio: {
        ...updated.studio,
        identity: { ...((updated.studio as unknown as Record<string, unknown>).identity as Record<string, unknown>), ...(studioIdentity as Record<string, unknown>) }
      }
    };
  }

  // New achievement ID unlock
  if (newAchievementId) {
    const existing: string[] = ((updated.studio as unknown as Record<string, unknown>).achievements as string[]) ?? [];
    if (!existing.includes(newAchievementId as string)) {
      updated = {
        ...updated,
        studio: {
          ...updated.studio,
          achievements: [...existing, newAchievementId as string]
        } as unknown as typeof updated.studio
      };
    }
  }

  return updated;
}
