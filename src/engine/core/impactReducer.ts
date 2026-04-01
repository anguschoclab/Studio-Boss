import { GameState, StateImpact, NewsEvent } from '@/engine/types';

/**
 * Pure function to apply a single StateImpact to the GameState.
 */
function applySingleImpact(state: GameState, impact: StateImpact): GameState {
  const payload = impact.payload || {};

  switch (impact.type) {
    case 'FUNDS_CHANGED': {
      const { amount } = payload as { amount: number };
      return {
        ...state,
        finance: {
          ...state.finance,
          cash: state.finance.cash + amount
        }
      };
    }

    case 'LEDGER_UPDATED': {
      const { report } = payload as { report: any };
      return {
        ...state,
        finance: {
          ...state.finance,
          ledger: [report, ...state.finance.ledger].slice(0, 100)
        }
      };
    }

    case 'FINANCE_SNAPSHOT_ADDED': {
      const { snapshot } = payload as { snapshot: any };
      return {
        ...state,
        finance: {
          ...state.finance,
          weeklyHistory: [snapshot, ...state.finance.weeklyHistory].slice(0, 52)
        }
      };
    }

    case 'SYNC_M_A_FUNDS': {
      const { amount } = payload as { amount: number };
      return {
        ...state,
        finance: {
          ...state.finance,
          cash: state.finance.cash + amount
        }
      };
    }

    case 'FUNDS_DEDUCTED': {
      const { amount } = payload as { amount: number };
      return {
        ...state,
        finance: {
          ...state.finance,
          cash: state.finance.cash - amount
        }
      };
    }

    case 'PROJECT_UPDATED': {
      const { projectId, update } = payload as { projectId: string; update: any };
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
      const { headline, description } = payload as { headline: string; description: string };
      const newsEvent: NewsEvent = {
        id: `ne-${crypto.randomUUID()}`,
        week: state.week,
        type: 'STUDIO_EVENT',
        headline: headline,
        description: description,
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
      const { projectId } = payload as { projectId: string };
      const projects = { ...state.studio.internal.projects };
      delete projects[projectId];
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

    case 'PRESTIGE_CHANGED': {
      const { amount } = payload as { amount: number };
      return {
        ...state,
        studio: {
          ...state.studio,
          prestige: Math.max(0, state.studio.prestige + amount)
        }
      };
    }

    case 'TALENT_UPDATED': {
      const { talentId, update } = payload as { talentId: string; update: any };
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
      const { buyerId, update } = payload as { buyerId: string; update: any };
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
      const { rivalId, update } = payload as { rivalId: string; update: any };
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
      const { opportunityId, rivalId, bid } = payload as { opportunityId: string; rivalId: string; bid: any };
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

    case 'TRENDS_UPDATED': {
      const { trends } = payload as { trends: any };
      return {
        ...state,
        market: {
          ...state.market,
          trends: trends
        }
      };
    }

    case 'SCANDAL_ADDED': {
      const { scandal } = payload as { scandal: any };
      return {
        ...state,
        industry: {
          ...state.industry,
          scandals: [...(state.industry.scandals || []), scandal]
        }
      };
    }

    case 'SCANDAL_REMOVED': {
      const { scandalId } = payload as { scandalId: string };
      return {
        ...state,
        industry: {
          ...state.industry,
          scandals: (state.industry.scandals || []).filter(s => s.id !== scandalId)
        }
      };
    }

    case 'MARKET_EVENT_UPDATED': {
      const { events, marketState } = payload as { events: any[]; marketState: any };
      return {
        ...state,
        market: {
          ...state.market,
          activeMarketEvents: events || state.market.activeMarketEvents
        },
        finance: {
          ...state.finance,
          marketState: marketState || state.finance.marketState
        }
      };
    }

    case 'SYSTEM_TICK': {
      const { week, tickCount } = payload as { week?: number; tickCount?: number };
      return {
        ...state,
        week: week ?? state.week,
        tickCount: tickCount ?? state.tickCount
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
