import { GameState, StateImpact, NewsEvent, Project, RivalStudio, Talent, Buyer } from '@/engine/types';
import { generateId } from '../utils';

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

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
      const projects = { ...state.entities.projects };
      const project = projects[projectId];
      if (project) {
        projects[projectId] = { ...project, ...update } as Project;
      }
      return {
        ...state,
        entities: {
          ...state.entities,
          projects
        }
      };
    }

    case 'PROJECT_CREATED': {
      const { project } = impact.payload;
      const projects = { ...state.entities.projects };
      projects[project.id] = project;
      return {
        ...state,
        entities: {
          ...state.entities,
          projects
        }
      };
    }

    case 'INDUSTRY_UPDATE': {
      const { update, mergedRivalId, acquirerId, rival, bankruptRivalId } = impact.payload as any;
      let newState = { ...state };

      if (update) {
        for (const key in update) {
          // Dotted paths (e.g. "ip.vault") let DistressCascade rewrite nested arrays
          // without needing per-field impact types for every asset mutation.
          if (key.includes('.')) {
            const parts = key.split('.');
            let cur: any = newState;
            for (let i = 0; i < parts.length - 1; i++) {
              const p = parts[i];
              if (FORBIDDEN_KEYS.has(p)) { cur = null; break; }
              cur[p] = Array.isArray(cur[p]) ? [...cur[p]] : { ...(cur[p] || {}) };
              cur = cur[p];
            }
            if (cur) {
              const last = parts[parts.length - 1];
              if (!FORBIDDEN_KEYS.has(last)) {
                cur[last] = update[key];
              }
            }
          } else if (update[key] !== undefined && typeof update[key] === 'object') {
            (newState as any)[key] = { ...(newState as any)[key], ...update[key] };
          } else {
            (newState as any)[key] = update[key];
          }
        }
      }

      if (mergedRivalId && acquirerId) {
        const rivals = { ...newState.entities.rivals };
        delete rivals[mergedRivalId];
        newState = { ...newState, entities: { ...newState.entities, rivals } };
      }

      // New rival insertion (indie/disruptor spawn, divestiture spinoff)
      if (rival && rival.rivalId && rival.update) {
        const rivals = { ...newState.entities.rivals };
        rivals[rival.rivalId] = { ...(rivals[rival.rivalId] || {}), ...rival.update } as RivalStudio;
        newState = { ...newState, entities: { ...newState.entities, rivals } };
      }

      // Hard bankruptcy: remove rival from active pool entirely
      if (bankruptRivalId) {
        const rivals = { ...newState.entities.rivals };
        delete rivals[bankruptRivalId];
        newState = { ...newState, entities: { ...newState.entities, rivals } };
      }

      return newState;
    }

    case 'NEWS_ADDED': {
      const { headline, description } = impact.payload;
      const newsEvent: NewsEvent = {
        id: generateId('NWS'),
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
      const projects = { ...state.entities.projects };
      delete projects[projectId];
      return {
        ...state,
        entities: {
          ...state.entities,
          projects
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
      const talents = { ...state.entities.talents };
      const talent = talents[talentId];
      if (talent) {
        talents[talentId] = { ...talent, ...update } as Talent;
      }
      return {
        ...state,
        entities: {
          ...state.entities,
          talents
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
      const rivals = { ...state.entities.rivals };
      const rival = rivals[rivalId];
      if (rival) {
        rivals[rivalId] = { ...rival, ...update } as RivalStudio;
      }
      return {
        ...state,
        entities: {
          ...state.entities,
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

    case 'SCANDAL_UPDATED': {
      const { scandalId, update } = impact.payload;
      return {
        ...state,
        industry: {
          ...state.industry,
          scandals: (state.industry.scandals || []).map(s =>
            s.id === scandalId ? { ...s, ...update } : s
          )
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

    case 'SHINGLE_CREATED': {
      const { shingle } = impact.payload as any;
      const existing = (state.entities as any).shingles || {};
      return {
        ...state,
        entities: {
          ...state.entities,
          shingles: { ...existing, [shingle.id]: shingle }
        } as any
      };
    }

    case 'SHINGLE_UPDATED': {
      const { shingleId, update } = impact.payload as any;
      const existing = (state.entities as any).shingles || {};
      const cur = existing[shingleId];
      if (!cur) return state;
      return {
        ...state,
        entities: {
          ...state.entities,
          shingles: { ...existing, [shingleId]: { ...cur, ...update } }
        } as any
      };
    }

    case 'SHINGLE_DISSOLVED': {
      const { shingleId } = impact.payload as any;
      const existing = { ...((state.entities as any).shingles || {}) };
      delete existing[shingleId];
      return {
        ...state,
        entities: {
          ...state.entities,
          shingles: existing
        } as any
      };
    }

    case 'FRANCHISE_UPDATED': {
      const { franchiseId, update } = impact.payload as any;
      const franchises = { ...state.ip.franchises };
      const existing = franchises[franchiseId];
      if (existing) {
        franchises[franchiseId] = { ...existing, ...update };
      } else if (update && update.id) {
        franchises[franchiseId] = update;
      }
      return { ...state, ip: { ...state.ip, franchises } };
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
              const projects = { ...newState.entities.projects };
              const project = projects[award.projectId];
              if (project) {
                  projects[award.projectId] = { 
                      ...project, 
                      awards: [...(project.awards || []), award] 
                  } as Project;
              }
              newState = { ...newState, entities: { ...newState.entities, projects } };
          });
      }
      if (impact.cultClassicProjectIds) {
          impact.cultClassicProjectIds.forEach(id => {
              const projects = { ...newState.entities.projects };
              const project = projects[id];
              if (project) {
                  projects[id] = { ...project, isCultClassic: true } as Project;
              }
              newState = { ...newState, entities: { ...newState.entities, projects } };
          });
      }
      if (impact.razzieWinnerTalents) {
          impact.razzieWinnerTalents.forEach(id => {
              const talents = { ...newState.entities.talents };
              const talent = talents[id];
              if (talent) {
                  talents[id] = { ...talent, razzieWinner: true } as Talent;
              }
              newState = { ...newState, entities: { ...newState.entities, talents } };
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
