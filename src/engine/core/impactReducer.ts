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

    case 'FUNDS_DEDUCTED':
      return {
        ...state,
        finance: {
          ...state.finance,
          cash: state.finance.cash - impact.payload.amount
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

    case 'BUYER_UPDATED': {
      const { buyerId, update } = impact.payload;
      const buyers = state.market.buyers.map(b => 
        b.id === buyerId ? { ...b, ...update } : b
      );
      return {
        ...state,
        market: {
          ...state.market,
          buyers
        }
      };
    }

    case 'RIVAL_UPDATED': {
      const { rivalId, update } = impact.payload;
      const rivals = state.industry.rivals.map(r => 
        r.id === rivalId ? { ...r, ...update } : r
      );
      return {
        ...state,
        industry: {
          ...state.industry,
          rivals
        }
      };
    }

    case 'OPPORTUNITY_UPDATED': {
      const { opportunityId, rivalId, bid } = impact.payload;
      const opportunities = state.market.opportunities.map(o => {
        if (o.id === opportunityId) {
          return {
            ...o,
            bids: {
              ...(o.bids || {}),
              [rivalId]: bid
            }
          };
        }
        return o;
      });
      return {
        ...state,
        market: {
          ...state.market,
          opportunities
        }
      };
    }

    case 'TRENDS_UPDATED':
      return {
        ...state,
        market: {
          ...state.market,
          trends: impact.payload.trends
        }
      };

    case 'SCANDAL_ADDED':
      return {
        ...state,
        industry: {
          ...state.industry,
          scandals: [...(state.industry.scandals || []), impact.payload.scandal]
        }
      };

    case 'SCANDAL_REMOVED':
      return {
        ...state,
        industry: {
          ...state.industry,
          scandals: (state.industry.scandals || []).filter(s => s.id !== impact.payload.scandalId)
        }
      };

    case 'MARKET_EVENT_UPDATED':
      return {
        ...state,
        market: {
          ...state.market,
          activeMarketEvents: impact.payload.events
        }
      };

    case 'SYSTEM_TICK':
      return {
        ...state,
        week: impact.payload.week ?? state.week,
        tickCount: impact.payload.tickCount ?? state.tickCount
      };

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
