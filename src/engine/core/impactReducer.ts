import { GameState, StateImpact, NewsEvent, Buyer, Franchise } from '@/engine/types';

/**
 * Pure function to apply a single StateImpact to the GameState.
 */
function applySingleImpact(state: GameState, impact: StateImpact): GameState {
  if (impact.type === 'FUNDS_CHANGED') {
      let amount = impact.payload.amount;
      if (isNaN(amount) || amount === null) amount = 0;
      if (Math.abs(amount) > 10_000_000_000) amount = Math.sign(amount) * 10_000_000_000;
      impact.payload.amount = amount;
  }
  
  if (impact.type === 'RIVAL_UPDATED' && impact.payload.update?.cash !== undefined) {
      let val = impact.payload.update.cash;
      if (isNaN(val) || val === null) val = 0;
      if (Math.abs(val) > 1_000_000_000_000) val = Math.sign(val) * 1_000_000_000_000;
      impact.payload.update.cash = val;
  }

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
      if (!state.entities?.projects) return state;
      const projects = { ...state.entities.projects };
      const project = projects[projectId];
      if (project) {
        projects[projectId] = { ...project, ...update };
      }
      return {
        ...state,
        entities: {
          ...state.entities,
          projects
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
      if (!state.entities?.projects) return state;
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
      if (!state.entities?.talents) return state;
      const talents = { ...state.entities.talents };
      const talent = talents[talentId];
      if (talent) {
        talents[talentId] = { ...talent, ...update };
      }
      return {
        ...state,
        entities: {
          ...state.entities,
          talents
        }
      };
    }

    case 'TALENT_ADDED': {
      if (!impact.payload) return state;
      const { talent } = impact.payload;
      if (!talent || !state.entities) return state;
      return {
        ...state,
        entities: {
          ...state.entities,
          talents: { ...state.entities.talents, [talent.id]: talent }
        }
      };
    }

    case 'TALENT_REMOVED': {
      if (!impact.payload) return state;
      const { talentId } = impact.payload;
      if (!talentId || !state.entities?.talents) return state;
      const talents = { ...state.entities.talents };
      delete talents[talentId];
      return {
        ...state,
        entities: {
          ...state.entities,
          talents
        }
      };
    }

    case 'RELATIONSHIP_FORMED': {
      if (!impact.payload) return state;
      const { key, relationship } = impact.payload;
      if (!key || !relationship) return state;
      return {
        ...state,
        relationships: {
          ...state.relationships,
          relationships: {
            ...state.relationships?.relationships,
            [key]: relationship,
          },
        },
      };
    }

    case 'RELATIONSHIP_UPDATED': {
      if (!impact.payload) return state;
      const { key, relationship } = impact.payload;
      if (!key || !relationship) return state;
      return {
        ...state,
        relationships: {
          ...state.relationships,
          relationships: {
            ...state.relationships?.relationships,
            [key]: relationship,
          },
        },
      };
    }

    case 'CLIQUE_FORMED': {
      if (!impact.payload) return state;
      const { cliqueId, clique } = impact.payload;
      if (!cliqueId || !clique) return state;

      // Ensure cliques object exists
      const existingCliques = state.relationships?.cliques?.cliques || {};
      const existingMemberMap = state.relationships?.cliques?.memberCliqueMap || {};

      // Update member clique map
      const updatedMemberMap = { ...existingMemberMap };
      for (const memberId of clique.members) {
        updatedMemberMap[memberId] = [...(updatedMemberMap[memberId] || []), cliqueId];
      }

      return {
        ...state,
        relationships: {
          ...state.relationships,
          cliques: {
            cliques: {
              ...existingCliques,
              [cliqueId]: clique,
            },
            memberCliqueMap: updatedMemberMap,
          },
        },
      };
    }

    case 'CLIQUE_UPDATED': {
      if (!impact.payload) return state;
      const { cliqueId, clique } = impact.payload;
      if (!cliqueId || !clique) return state;

      const existingCliques = state.relationships?.cliques?.cliques || {};
      const existingMemberMap = state.relationships?.cliques?.memberCliqueMap || {};

      return {
        ...state,
        relationships: {
          ...state.relationships,
          cliques: {
            cliques: {
              ...existingCliques,
              [cliqueId]: clique,
            },
            memberCliqueMap: existingMemberMap,
          },
        },
      };
    }

    case 'SCREENPLAY_NOTE_CREATED': {
      if (!impact.payload) return state;
      const { note } = impact.payload;
      if (!note) return state;

      const existingNotes = state.relationships?.productionEnhancements?.screenplayNotes || {};

      return {
        ...state,
        relationships: {
          ...state.relationships,
          productionEnhancements: {
            ...state.relationships?.productionEnhancements,
            screenplayNotes: {
              ...existingNotes,
              [note.id]: note,
            },
            productionAdditions: state.relationships?.productionEnhancements?.productionAdditions || {},
            creditScenes: state.relationships?.productionEnhancements?.creditScenes || {},
          },
        },
      };
    }

    case 'SCREENPLAY_NOTE_IMPLEMENTED': {
      if (!impact.payload) return state;
      const { noteId, note } = impact.payload;
      if (!noteId || !note) return state;

      const existingNotes = state.relationships?.productionEnhancements?.screenplayNotes || {};

      return {
        ...state,
        relationships: {
          ...state.relationships,
          productionEnhancements: {
            ...state.relationships?.productionEnhancements,
            screenplayNotes: {
              ...existingNotes,
              [noteId]: note,
            },
            productionAdditions: state.relationships?.productionEnhancements?.productionAdditions || {},
            creditScenes: state.relationships?.productionEnhancements?.creditScenes || {},
          },
        },
      };
    }

    case 'PRODUCTION_ADDITION_CREATED': {
      if (!impact.payload) return state;
      const { addition } = impact.payload;
      if (!addition) return state;

      const existingAdditions = state.relationships?.productionEnhancements?.productionAdditions || {};

      return {
        ...state,
        relationships: {
          ...state.relationships,
          productionEnhancements: {
            ...state.relationships?.productionEnhancements,
            screenplayNotes: state.relationships?.productionEnhancements?.screenplayNotes || {},
            productionAdditions: {
              ...existingAdditions,
              [addition.id]: addition,
            },
            creditScenes: state.relationships?.productionEnhancements?.creditScenes || {},
          },
        },
      };
    }

    case 'CREDIT_SCENE_CREATED':
    case 'CREDIT_SCENE_UPDATED': {
      if (!impact.payload) return state;
      const { scene } = impact.payload;
      if (!scene) return state;

      const existingScenes = state.relationships?.productionEnhancements?.creditScenes || {};

      return {
        ...state,
        relationships: {
          ...state.relationships,
          productionEnhancements: {
            ...state.relationships?.productionEnhancements,
            screenplayNotes: state.relationships?.productionEnhancements?.screenplayNotes || {},
            productionAdditions: state.relationships?.productionEnhancements?.productionAdditions || {},
            creditScenes: {
              ...existingScenes,
              [scene.id]: scene,
            },
          },
        },
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
      if (!state.entities?.rivals) return state;
      const rivals = { ...state.entities.rivals };
      if (rivals[rivalId]) {
        rivals[rivalId] = { ...rivals[rivalId], ...update };
      }
      return {
        ...state,
        entities: {
          ...state.entities,
          rivals
        }
      };
    }

    case 'AWARD_WON': {
      const { projectId, award } = impact.payload;
      if (!state.entities?.projects) return state;
      const projects = { ...state.entities.projects };
      const project = projects[projectId];
      if (project) {
        projects[projectId] = { 
          ...project, 
          awards: [...(project.awards || []), award] 
        };
      }
      return {
        ...state,
        entities: {
          ...state.entities,
          projects
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

    case 'INDUSTRY_UPDATE': {
      const payload = impact.payload as any;
      // ⚡ Bolt: Robust Deep Clone for path updates to prevent reference mutation
      let nextState = { ...state };
      
      // 1. Generic Deep-Path Updates (User-Added Architecture)
      if (payload.update && typeof payload.update === 'object' && !Array.isArray(payload.update)) {
        for (const [path, value] of Object.entries(payload.update)) {
          const parts = (path as string).split('.');
          let current: any = nextState;

          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            
            // Security check
            if (part === '__proto__' || part === 'constructor' || part === 'prototype') break;

            // Deep clone the branch we are traversing to ensure true immutability
            if (Array.isArray(current[part])) {
              current[part] = [...current[part]];
            } else if (typeof current[part] === 'object' && current[part] !== null) {
              current[part] = { ...current[part] };
            } else {
              current[part] = {};
            }
            
            current = current[part];
          }

          const lastPart = parts[parts.length - 1];
          if (lastPart !== '__proto__' && lastPart !== 'constructor' && lastPart !== 'prototype') {
            current[lastPart] = value;
          }
        }
      }

      // 2. Merger Logic (Systemic Asset Transfer)
      const { mergedRivalId, acquirerId } = payload;
      if (mergedRivalId) {
        const target = state.entities.rivals[mergedRivalId];
        if (target) {
          // Transfer Projects & Platforms
          if (acquirerId === 'player') {
            const mergedProjects = { ...nextState.entities.projects };
            const mergedVault = nextState.ip.vault.map(asset => {
              if (asset.ownerStudioId === mergedRivalId) {
                return { ...asset, rightsOwner: 'STUDIO' as const, ownerStudioId: undefined };
              }
              return asset;
            });

            nextState = {
              ...nextState,
              entities: {
                ...nextState.entities,
                projects: mergedProjects
              },
              ip: { ...nextState.ip, vault: mergedVault }
            };
          } else {
            const rivals = { ...nextState.entities.rivals };
            if (rivals[acquirerId]) {
              const acquirer = rivals[acquirerId];
              rivals[acquirerId] = {
                ...acquirer,
                projectIds: [...(acquirer.projectIds || []), ...(target.projectIds || [])],
                ownedPlatforms: [...(acquirer.ownedPlatforms || []), ...(target.ownedPlatforms || [])]
              };
            }

            const mergedVault = nextState.ip.vault.map(asset => {
              if (asset.ownerStudioId === mergedRivalId) {
                return { ...asset, rightsOwner: 'RIVAL' as const, ownerStudioId: acquirerId };
              }
              return asset;
            });

            // ⚡ Single Source of Truth: Ensure merged rival projects are also mirrored in global entities
            const mergedProjects = { ...nextState.entities.projects };

            nextState = { 
                ...nextState, 
                entities: {
                  ...nextState.entities,
                  projects: mergedProjects,
                  rivals
                },
                ip: { ...nextState.ip, vault: mergedVault }
            };
          }

          // Remove merged studio from the world
          const rivals = { ...nextState.entities.rivals };
          delete rivals[mergedRivalId];
          nextState = {
            ...nextState,
            entities: {
              ...nextState.entities,
              rivals
            }
          };
        }
      }

      // 3. Fallback for Market Opportunities legacy path
      if (payload['market.opportunities']) {
        nextState = { ...nextState, market: { ...nextState.market, opportunities: payload['market.opportunities'] } };
      }

      return nextState;
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

      // Calculate a prestige hit based on the severity (Punish prestige more severely for scandals)
      // The PR Spin Doctor: Increased prestige hit multiplier from 2.0 to 3.0
      const prestigeHit = Math.floor((scandal.severity / 5) * 3.0);
      newPrestige = Math.max(0, newPrestige - prestigeHit);

      // Check if there's an attached project to boost buzz for specific genres/formats
      const projects = { ...state.entities.projects };
      const contracts = Object.values(state.entities.contracts);
      const projectIds = contracts.filter(c => c.talentId === scandal.talentId).map(c => c.projectId);

      for (const pid of projectIds) {
          const project = projects[pid];
          if (project) {
              const format = project.format;
              const genre = project.genre ? project.genre.toLowerCase() : '';
                // Enhance the boost for trashy reality TV or horror on scandals (Significant boost)
              if (format === 'unscripted' || genre.includes('horror')) {
                    // The PR Spin Doctor: Massively boost buzz for unscripted/horror genres (increased from 2.0 to 3.0)
                    projects[pid] = { ...project, buzz: Math.min(100, (project.buzz || 0) + scandal.severity * 3.0) };
              } else {
                    // The PR Spin Doctor: Apply a severe buzz penalty for regular prestige projects
                    projects[pid] = { ...project, buzz: Math.max(0, (project.buzz || 0) - Math.floor(scandal.severity)) };
              }
          }
      }

      return {
        ...state,
        studio: {
          ...state.studio,
          prestige: newPrestige
        },
        entities: {
          ...state.entities,
          projects
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
      return {
        ...state,
        week: week ?? state.week,
        tickCount: tickCount ?? state.tickCount
      };
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
        const rivals = { ...state.entities.rivals };
        if (rivals[targetId]) {
          rivals[targetId] = { ...rivals[targetId], cash: rivals[targetId].cash + amount };
        }
        return {
          ...state,
          entities: {
            ...state.entities,
            rivals
          }
        };
      }
      return applySingleImpact(state, { type: 'FUNDS_CHANGED', payload: { amount } });
    }

    case 'PILOT_GRADUATED': {
      // Moves a project out of stage='pilot' into full development/production
      const { projectId, nextState } = impact.payload as { projectId: string; nextState?: import('@/engine/types/project.types').ProjectStatus };
      const projects = { ...state.entities.projects };
      const project = projects[projectId];
      if (project) {
        const { stage: _stage, ...rest } = project as any;
        projects[projectId] = { ...rest, state: nextState ?? 'production', weeksInPhase: 0 };
      }
      return {
        ...state,
        entities: {
          ...state.entities,
          projects
        }
      };
    }

    case 'FORMAT_LICENSED': {
      // Adds a format rights IPAsset to ip.vault
      const { asset } = impact.payload as { asset: import('@/engine/types/state.types').IPAsset };
      const existingIds = new Set(state.ip.vault.map(a => a.id));
      if (existingIds.has(asset.id)) return state;
      return {
        ...state,
        ip: { ...state.ip, vault: [...state.ip.vault, asset] }
      };
    }

    case 'MEDICAL_LEAVE_TRIGGERED': {
      const { talentId, weeks } = impact.payload as { talentId: string; weeks: number };
      const talents = { ...state.entities.talents };
      const talent = talents[talentId];
      if (talent) {
        talents[talentId] = {
          ...talent,
          onMedicalLeave: true,
          medicalLeaveEndsWeek: state.week + weeks,
          fatigue: Math.max(0, talent.fatigue - 20), // partial fatigue relief on leave start
        };
      }
      return { ...state, entities: { ...state.entities, talents } };
    }

    case 'DEAL_UPDATED': {
      const { deal, action } = impact.payload as {
        deal: import('@/engine/types/talent.types').TalentPact;
        action: 'add' | 'expire' | 'terminate';
      };
      const current = state.deals;
      let activeDeals = [...current.activeDeals];
      let expiredDeals = [...current.expiredDeals];
      if (action === 'add') {
        activeDeals = [...activeDeals, deal];
      } else {
        activeDeals = activeDeals.filter(d => d.id !== deal.id);
        const status = (action === 'expire' ? 'expired' : 'terminated') as 'expired' | 'terminated';
        expiredDeals = [{ ...deal, status }, ...expiredDeals].slice(0, 50);
      }
      return { ...state, deals: { ...current, activeDeals, expiredDeals } };
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
      const projects = { ...newState.entities.projects };
      const project = projects[award.projectId];
      if (project) {
        projects[award.projectId] = { 
          ...project, 
          awards: [...(project.awards || []), award] 
        };
      }
      newState = { ...newState, entities: { ...newState.entities, projects } };
    });
  }
  if (impact.cultClassicProjectIds) {
    impact.cultClassicProjectIds.forEach(id => {
      const projects = { ...newState.entities.projects };
      const project = projects[id];
      if (project) {
        projects[id] = { ...project, isCultClassic: true };
      }
      newState = { ...newState, entities: { ...newState.entities, projects } };
    });
  }
  if (impact.razzieWinnerTalents) {
    impact.razzieWinnerTalents.forEach(id => {
      const talents = { ...newState.entities.talents };
      const talent = talents[id];
      if (talent) {
        talents[id] = { ...talent, razzieWinner: true };
      }
      newState = { ...newState, entities: { ...newState.entities, talents } };
    });
  }
  if (impact.newProjects) {
    newState = {
      ...newState,
      entities: {
        ...newState.entities,
        projects: { ...newState.entities.projects, ...Object.fromEntries(impact.newProjects.map(p => [p.id, p])) }
      }
    };
  }
  if (impact.newContracts) {
    newState = {
      ...newState,
      entities: {
        ...newState.entities,
        contracts: { ...newState.entities.contracts, ...Object.fromEntries(impact.newContracts.map(c => [c.id, c])) }
      }
    };
  }
  if (impact.newScandals) {
    impact.newScandals.forEach(scandal => {
      newState = applySingleImpact(newState, { type: 'SCANDAL_ADDED', payload: { scandal } });
    });
  }
  if (impact.newTalents) {
    const talents = { ...newState.entities.talents };
    impact.newTalents.forEach(t => {
      talents[t.id] = t;
    });
    newState = { ...newState, entities: { ...newState.entities, talents } };
  }

  
  return newState;
}

/**
 * Pure reducer that processes an array of impacts without mutating original state.
 */
export function applyImpacts(state: GameState, impacts: StateImpact[]): GameState {
  let newState = impacts.reduce((currentState, impact) => applySingleImpact(currentState, impact), state);

  // Process all new IP assets efficiently in one pass
  const allNewIPs = impacts.flatMap(i => i.newIPAssets || []);
  if (allNewIPs.length > 0) {
    // Keep only the latest version of each IP asset
    const latestNewIPsMap = new Map();
    for (const asset of allNewIPs) {
      latestNewIPsMap.set(asset.id, asset);
    }

    const newAssetIds = new Set(latestNewIPsMap.keys());
    const latestNewIPs = Array.from(latestNewIPsMap.values());

    // O(N) single-pass filter instead of using the spread operator
    const vault = [];
    const currentVault = newState.ip.vault || [];
    for (let i = 0; i < currentVault.length; i++) {
      if (!newAssetIds.has(currentVault[i].id)) {
        vault.push(currentVault[i]);
      }
    }
    for (let i = 0; i < latestNewIPs.length; i++) {
      vault.push(latestNewIPs[i]);
    }

    newState = { ...newState, ip: { ...newState.ip, vault } };
  }

  return newState;
}
