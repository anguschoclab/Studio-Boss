import { GameState, StateImpact, NewsEvent } from '@/engine/types';

/**
 * Pure function to apply a single StateImpact to the GameState.
 */
function applySingleImpact(state: GameState, impact: StateImpact): GameState {
  switch (impact.type) {
    case 'FUNDS_CHANGED':
      return {
        ...state,
        finance: {
          ...state.finance,
          cash: state.finance.cash + impact.payload.amount
        }
      };

    case 'PROJECT_UPDATED': {
      const { projectId, update } = impact.payload;
      const projects = { ...state.studio.internal.projects };
      if (projects[projectId]) {
        projects[projectId] = { ...projects[projectId], ...update };
      }
      return {
        ...state,
        studio: {
          ...state.studio,
          internal: {
            ...state.studio.internal,
            projects
          }
        }
      };
    }

    case 'NEWS_ADDED': {
      const newsEvent: NewsEvent = {
        id: `ne-${crypto.randomUUID()}`,
        week: state.week,
        type: 'STUDIO_EVENT',
        headline: impact.payload.headline,
        description: impact.payload.description,
      };
      return {
        ...state,
        industry: {
          ...state.industry,
          newsHistory: [newsEvent, ...state.industry.newsHistory].slice(0, 100)
        }
      };
    }

    case 'PROJECT_REMOVED': {
      const projects = { ...state.studio.internal.projects };
      delete projects[impact.payload.projectId];
      return {
        ...state,
        studio: {
          ...state.studio,
          internal: {
            ...state.studio.internal,
            projects
          }
        }
      };
    }

    case 'PRESTIGE_CHANGED':
      return {
        ...state,
        studio: {
          ...state.studio,
          prestige: Math.max(0, state.studio.prestige + impact.payload.amount)
        }
      };

    case 'TALENT_UPDATED': {
      const { talentId, update } = impact.payload;
      const talentPool = { ...state.industry.talentPool };
      if (talentPool[talentId]) {
        talentPool[talentId] = { ...talentPool[talentId], ...update };
      }
      return {
        ...state,
        industry: {
          ...state.industry,
          talentPool
        }
      };
    }

    default:
      return state;
  }
}

/**
 * Pure reducer that processes an array of impacts without mutating original state.
 */
export function applyImpacts(state: GameState, impacts: StateImpact[]): GameState {
  return impacts.reduce((currentState, impact) => applySingleImpact(currentState, impact), state);
}
