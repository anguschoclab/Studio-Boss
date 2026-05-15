import { GameState, StateImpact, NewsEvent } from "@/engine/types";

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
      prestige: Math.max(0, state.studio.prestige + amount),
    },
  };
}

export function handleNewsAdded(state: GameState, impact: StateImpact): GameState {
  const { id, headline, description, publication } = impact.payload;
  const newsEvent: NewsEvent = {
    id: id,
    week: state.week,
    type: "STUDIO_EVENT",
    headline: headline,
    description: description,
    publication: publication,
  };
  return {
    ...state,
    industry: {
      ...state.industry,
      newsHistory: [newsEvent, ...state.industry.newsHistory].slice(0, 100),
    },
  };
}

export function handleSystemTick(state: GameState, impact: StateImpact): GameState {
  const payload = impact.payload || {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { week, tickCount, __studioUpdate, studioIdentity } = payload as any;

  let updated: GameState = {
    ...state,
    week: week ?? state.week,
    tickCount: tickCount ?? state.tickCount,
  };

  // Generic studio property patch (used by loan tick, identity tick, etc.)
  if (__studioUpdate) {
    updated = {
      ...updated,
      studio: { ...updated.studio, ...__studioUpdate },
    };
  }

  // Studio identity axes update
  if (studioIdentity) {
    updated = {
      ...updated,
      studio: {
        ...updated.studio,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        identity: { ...(updated.studio as any).identity, ...studioIdentity },
      },
    };
  }

  // New achievement ID unlock
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { newAchievementId } = payload as any;
  if (newAchievementId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing: string[] = (updated.studio as any).achievements ?? [];
    if (!existing.includes(newAchievementId)) {
      updated = {
        ...updated,
        studio: {
          ...updated.studio,
          achievements: [...existing, newAchievementId],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      };
    }
  }

  return updated;
}
