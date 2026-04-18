import { GameState, StateImpact, Franchise } from '@/engine/types';

/**
 * Industry-related impact handlers
 * Pure functions that apply industry-related state impacts
 */

export function handleIndustryUpdate(state: GameState, impact: StateImpact): GameState {
  const payload = impact.payload as any;
  let nextState = { ...state };
  
  // Generic Deep-Path Updates
  if (payload.update && typeof payload.update === 'object' && !Array.isArray(payload.update)) {
    for (const [path, value] of Object.entries(payload.update)) {
      const parts = (path as string).split('.');
      let current: any = nextState;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        
        if (part === '__proto__' || part === 'constructor' || part === 'prototype') break;

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

  // Merger Logic
  const { mergedRivalId, acquirerId } = payload;
  if (mergedRivalId) {
    const target = state.entities.rivals[mergedRivalId];
    if (target) {
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

  if (payload['market.opportunities']) {
    nextState = { ...nextState, market: { ...nextState.market, opportunities: payload['market.opportunities'] } };
  }

  return nextState;
}

export function handleScandalAdded(state: GameState, impact: StateImpact): GameState {
  const { scandal } = impact.payload;
  let newPrestige = state.studio.prestige;

  const prestigeHit = Math.floor((scandal.severity / 5) * 3.0);
  newPrestige = Math.max(0, newPrestige - prestigeHit);

  const projects = { ...state.entities.projects };

  const projectIds: string[] = [];
  const contractsRaw = state.entities.contracts;
  for (const key in contractsRaw) {
    if (Object.prototype.hasOwnProperty.call(contractsRaw, key)) {
      const c = contractsRaw[key];
      if (c.talentId === scandal.talentId) {
        projectIds.push(c.projectId);
      }
    }
  }

  for (const pid of projectIds) {
      const project = projects[pid];
      if (project) {
          const format = project.format;
          const genre = project.genre ? project.genre.toLowerCase() : '';
          if (format === 'unscripted' || genre.includes('horror')) {
                projects[pid] = { ...project, buzz: Math.min(100, (project.buzz || 0) + scandal.severity * 3.0) };
          } else {
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

export function handleScandalRemoved(state: GameState, impact: StateImpact): GameState {
  const { scandalId } = impact.payload;
  return {
    ...state,
    industry: {
      ...state.industry,
      scandals: (state.industry.scandals || []).filter(s => s.id !== scandalId)
    }
  };
}

export function handleRivalUpdated(state: GameState, impact: StateImpact): GameState {
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

export function handleMergerOffered(state: GameState, impact: StateImpact): GameState {
  const merger = impact.payload.merger;
  if (!merger) return state;
  return {
    ...state,
    industry: {
      ...state.industry,
      activeMergers: [...(state.industry.activeMergers || []), merger]
    }
  };
}

export function handleMergerResolved(state: GameState, impact: StateImpact): GameState {
  const { mergerId } = impact.payload;
  return {
    ...state,
    industry: {
      ...state.industry,
      activeMergers: (state.industry.activeMergers || []).filter(m => m.id !== mergerId)
    }
  };
}
