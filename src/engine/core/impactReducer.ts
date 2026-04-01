import { GameState, StateImpact, NewsEvent, Project, RivalStudio, Talent, Buyer } from '@/engine/types';

/**
 * Pure function to apply a single StateImpact to the GameState.
 */
function applySingleImpact(state: GameState, impact: StateImpact): GameState {
  switch (impact.type) {
    case 'FUNDS_CHANGED': {
      const { amount } = impact.payload;
      return {
        ...state,
        finance: {
          ...state.finance,
          cash: state.finance.cash + amount
        }
      };
    }

    case 'LEDGER_UPDATED': {
      const { report } = impact.payload;
      return {
        ...state,
        finance: {
          ...state.finance,
          ledger: [report, ...state.finance.ledger].slice(0, 100)
        }
      };
    }

    case 'FINANCE_SNAPSHOT_ADDED': {
      const { snapshot } = impact.payload;
      return {
        ...state,
        finance: {
          ...state.finance,
          weeklyHistory: [snapshot, ...state.finance.weeklyHistory].slice(0, 52)
        }
      };
    }

    case 'SYNC_M_A_FUNDS': {
      const { amount } = impact.payload;
      return {
        ...state,
        finance: {
          ...state.finance,
          cash: state.finance.cash + amount
        }
      };
    }

    case 'FUNDS_DEDUCTED': {
      const { amount } = impact.payload;
      return {
        ...state,
        finance: {
          ...state.finance,
          cash: state.finance.cash - amount
        }
      };
    }

    case 'PROJECT_UPDATED': {
      const { projectId, update } = impact.payload;
      const projects = { ...state.studio.internal.projects };
      const project = projects[projectId];
      if (project) {
        projects[projectId] = { ...project, ...update } as Project;
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
      const { headline, description } = impact.payload;
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
      const { projectId } = impact.payload;
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
      const { amount } = impact.payload;
      return {
        ...state,
        studio: {
          ...state.studio,
          prestige: Math.max(0, state.studio.prestige + amount)
        }
      };
    }

    case 'TALENT_UPDATED': {
      const { talentId, update } = impact.payload;
      const talentPool = { ...state.industry.talentPool };
      const talent = talentPool[talentId];
      if (talent) {
        talentPool[talentId] = { ...talent, ...update } as Talent;
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
        b.id === buyerId ? { ...b, ...update } as Buyer : b
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
        r.id === rivalId ? { ...r, ...update } as RivalStudio : r
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

    case 'TRENDS_UPDATED': {
      const { trends } = impact.payload;
      return {
        ...state,
        market: {
          ...state.market,
          trends: trends
        }
      };
    }

    case 'SCANDAL_ADDED': {
      const { scandal } = impact.payload;
      return {
        ...state,
        industry: {
          ...state.industry,
          scandals: [...(state.industry.scandals || []), scandal]
        }
      };
    }

    case 'SCANDAL_REMOVED': {
      const { scandalId } = impact.payload;
      return {
        ...state,
        industry: {
          ...state.industry,
          scandals: (state.industry.scandals || []).filter(s => s.id !== scandalId)
        }
      };
    }

    case 'MARKET_EVENT_UPDATED': {
      const { events, marketState } = impact.payload;
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

    case 'FINANCE_TRANSACTION': {
      const { amount } = impact.payload;
      return applySingleImpact(state, { type: 'FUNDS_CHANGED', payload: { amount } });
    }

    case 'SYSTEM_TICK': {
      const { week, tickCount } = impact.payload;
      return {
        ...state,
        week: week ?? state.week,
        tickCount: tickCount ?? state.tickCount
      };
    }

    default: {
      // Handle the "base" case for merged impacts (Recursive application)
      let newState = state;
      if (impact.cashChange !== undefined) {
          newState = applySingleImpact(newState, { type: 'FUNDS_CHANGED', payload: { amount: impact.cashChange } });
      }
      if (impact.prestigeChange !== undefined) {
          newState = applySingleImpact(newState, { type: 'PRESTIGE_CHANGED', payload: { amount: impact.prestigeChange } });
      }
      if (impact.projectUpdates) {
          impact.projectUpdates.forEach(u => {
              newState = applySingleImpact(newState, { type: 'PROJECT_UPDATED', payload: u });
          });
      }
      if (impact.rivalUpdates) {
          impact.rivalUpdates.forEach(u => {
              newState = applySingleImpact(newState, { type: 'RIVAL_UPDATED', payload: u });
          });
      }
      if (impact.newHeadlines) {
          impact.newHeadlines.forEach(h => {
              newState = applySingleImpact(newState, { type: 'NEWS_ADDED', payload: { headline: h.text, description: '' } });
          });
      }
      if (impact.newsEvents) {
          impact.newsEvents.forEach(e => {
              newState = applySingleImpact(newState, { type: 'NEWS_ADDED', payload: { headline: e.headline, description: e.description } });
          });
      }
      if (impact.newAwards) {
          impact.newAwards.forEach(award => {
              const projects = { ...newState.studio.internal.projects };
              const project = projects[award.projectId];
              if (project) {
                  projects[award.projectId] = { 
                      ...project, 
                      awards: [...(project.awards || []), award] 
                  } as Project;
              }
              newState = { ...newState, studio: { ...newState.studio, internal: { ...newState.studio.internal, projects } } };
          });
      }
      if (impact.cultClassicProjectIds) {
          impact.cultClassicProjectIds.forEach(id => {
              const projects = { ...newState.studio.internal.projects };
              const project = projects[id];
              if (project) {
                  projects[id] = { ...project, isCultClassic: true } as Project;
              }
              newState = { ...newState, studio: { ...newState.studio, internal: { ...newState.studio.internal, projects } } };
          });
      }
      if (impact.razzieWinnerTalents) {
          impact.razzieWinnerTalents.forEach(id => {
              const talentPool = { ...newState.industry.talentPool };
              const talent = talentPool[id];
              if (talent) {
                  talentPool[id] = { ...talent, razzieWinner: true } as Talent;
              }
              newState = { ...newState, industry: { ...newState.industry, talentPool } };
          });
      }
      return newState;
    }
  }
}

/**
 * Pure reducer that processes an array of impacts without mutating original state.
 */
export function applyImpacts(state: GameState, impacts: StateImpact[]): GameState {
  return impacts.reduce((currentState, impact) => applySingleImpact(currentState, impact), state);
}
