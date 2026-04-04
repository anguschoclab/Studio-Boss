import { GameState, StateImpact, NewsEvent, Project, RivalStudio, Talent, Buyer, Franchise } from '@/engine/types';

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
        projects[projectId] = { ...project, ...update };
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
        talentPool[talentId] = { ...talent, ...update };
      }
      return {
        ...state,
        industry: {
          ...state.industry,
          talentPool
        }
      };
    }

    case 'TALENT_ADDED': {
      const { talent } = impact.payload;
      return {
        ...state,
        industry: {
          ...state.industry,
          talentPool: { ...state.industry.talentPool, [talent.id]: talent }
        }
      };
    }

    case 'TALENT_REMOVED': {
      const { talentId } = impact.payload;
      const talentPool = { ...state.industry.talentPool };
      delete talentPool[talentId];
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
      let newPrestige = state.studio.prestige;

      // Calculate a prestige hit based on the severity
      const prestigeHit = Math.floor(scandal.severity / 10);
      newPrestige = Math.max(0, newPrestige - prestigeHit);

      // Check if there's an attached project to boost buzz for specific genres/formats
      const projects = { ...state.studio.internal.projects };
      const contracts = state.studio.internal.contracts || [];
      const projectIds = contracts.filter(c => c.talentId === scandal.talentId).map(c => c.projectId);

      for (const pid of projectIds) {
          const project = projects[pid];
          if (project) {
              const format = project.format;
              const genre = project.genre ? project.genre.toLowerCase() : '';
                // Enhance the boost for trashy reality TV or horror on scandals
              if (format === 'unscripted' || genre.includes('horror')) {
                    projects[pid] = { ...project, buzz: Math.min(100, (project.buzz || 0) + Math.floor(scandal.severity / 2)) };
              }
          }
      }

      return {
        ...state,
        studio: {
          ...state.studio,
          prestige: newPrestige,
          internal: {
              ...state.studio.internal,
              projects
          }
        },
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

    case 'SYSTEM_TICK': {
      const { week, tickCount } = impact.payload || {};
      state = {
        ...state,
        week: week ?? state.week,
        tickCount: tickCount ?? state.tickCount
      };
      break;
    }

    case 'FRANCHISE_UPDATED': {
      const { franchiseId, update } = impact.payload;
      const franchises = { ...state.ip.franchises };
      const franchise = franchises[franchiseId];
      if (franchise) {
        franchises[franchiseId] = { ...franchise, ...update };
      } else {
        // Initial creation
        franchises[franchiseId] = update as Franchise;
      }
      return {
        ...state,
        ip: {
          ...state.ip,
          franchises
        }
      };
    }

    case 'VAULT_ASSET_UPDATED': {
      const { assetId, update } = impact.payload;
      const vault = state.ip.vault.map(asset => 
        asset.id === assetId ? { ...asset, ...update } : asset
      );
      return {
        ...state,
        ip: {
          ...state.ip,
          vault
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
      const { amount, targetId } = impact.payload;
      if (targetId && targetId !== 'player') {
        const rivals = state.industry.rivals.map(r => 
          r.id === targetId ? { ...r, cash: r.cash + amount } as RivalStudio : r
        );
        return {
          ...state,
          industry: {
            ...state.industry,
            rivals
          }
        };
      }
      return applySingleImpact(state, { type: 'FUNDS_CHANGED', payload: { amount } });
    }


  }

  // --- Root-Level Field Processing (Unified for all types) ---
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
      newState = applySingleImpact(newState, { 
        type: 'NEWS_ADDED', 
        payload: { id: h.id, headline: h.text, description: '', category: h.category, publication: h.publication } 
      });
    });
  }
  if (impact.newsEvents) {
    impact.newsEvents.forEach(e => {
      newState = applySingleImpact(newState, { 
        type: 'NEWS_ADDED', 
        payload: { id: e.id, headline: e.headline, description: e.description, publication: e.publication } 
      });
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
        };
      }
      newState = { ...newState, studio: { ...newState.studio, internal: { ...newState.studio.internal, projects } } };
    });
  }
  if (impact.cultClassicProjectIds) {
    impact.cultClassicProjectIds.forEach(id => {
      const projects = { ...newState.studio.internal.projects };
      const project = projects[id];
      if (project) {
        projects[id] = { ...project, isCultClassic: true };
      }
      newState = { ...newState, studio: { ...newState.studio, internal: { ...newState.studio.internal, projects } } };
    });
  }
  if (impact.razzieWinnerTalents) {
    impact.razzieWinnerTalents.forEach(id => {
      const talentPool = { ...newState.industry.talentPool };
      const talent = talentPool[id];
      if (talent) {
        talentPool[id] = { ...talent, razzieWinner: true };
      }
      newState = { ...newState, industry: { ...newState.industry, talentPool } };
    });
  }
  if (impact.newProjects) {
    newState = {
      ...newState,
      studio: {
        ...newState.studio,
        internal: {
          ...newState.studio.internal,
          projects: { ...newState.studio.internal.projects, ...Object.fromEntries(impact.newProjects.map(p => [p.id, p])) }
        }
      }
    };
  }
  if (impact.newContracts) {
    newState = {
      ...newState,
      studio: {
        ...newState.studio,
        internal: {
          ...newState.studio.internal,
          contracts: [...newState.studio.internal.contracts, ...impact.newContracts]
        }
      }
    };
  }
  if (impact.type === 'INDUSTRY_UPDATE') {
    const payload = impact.payload as any;
    Object.entries(payload).forEach(([path, value]) => {
      if (path === 'market.opportunities') {
        newState = { ...newState, market: { ...newState.market, opportunities: value as any } };
      }
    });
  }
  if (impact.newIPAssets) {
    const newAssetIds = new Set(impact.newIPAssets.map(a => a.id));
    const vault = [...newState.ip.vault.filter(a => !newAssetIds.has(a.id)), ...impact.newIPAssets];
    newState = { ...newState, ip: { ...newState.ip, vault } };
  }
  
  return newState;
}

/**
 * Pure reducer that processes an array of impacts without mutating original state.
 */
export function applyImpacts(state: GameState, impacts: StateImpact[]): GameState {
  return impacts.reduce((currentState, impact) => applySingleImpact(currentState, impact), state);
}
