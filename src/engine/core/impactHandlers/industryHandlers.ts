import { GameState, StateImpact, Franchise } from '@/engine/types';

/**
 * Industry-related impact handlers
 * Pure functions that apply industry-related state impacts
 */

export function handleIndustryUpdate(state: GameState, impact: StateImpact): GameState {
  const payload = impact.payload;
  if (!payload || typeof payload !== 'object') return state;
  let nextState = { ...state };
  
  const update = (payload as { update?: Record<string, any> }).update;
  // Generic Deep-Path Updates
  if (update && typeof update === 'object' && !Array.isArray(update)) {
    for (const [path, value] of Object.entries(update)) {
      const parts = path.split('.');
      let current: Record<string, any> = nextState as any;

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
  const industryPayload = payload as { mergedRivalId?: string; acquirerId?: string };
  const { mergedRivalId, acquirerId } = industryPayload;
  if (mergedRivalId && acquirerId) {
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

  const marketPayload = payload as Record<string, any>;
  if (marketPayload['market.opportunities']) {
    nextState = { ...nextState, market: { ...nextState.market, opportunities: marketPayload['market.opportunities'] } };
  }

  return nextState;
}

export function handleScandalAdded(state: GameState, impact: StateImpact): GameState {
  const { scandal } = impact.payload as { scandal: import('@/engine/types/industry.types').Scandal };
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
  const { scandalId } = impact.payload as { scandalId: string };
  return {
    ...state,
    industry: {
      ...state.industry,
      scandals: (state.industry.scandals || []).filter(s => s.id !== scandalId)
    }
  };
}

export function handleRivalUpdated(state: GameState, impact: StateImpact): GameState {
  const { rivalId, update } = impact.payload as { rivalId: string, update: Partial<import('@/engine/types').RivalStudio> };
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
  const merger = (impact.payload as { merger?: import('@/engine/types/industry.types').MergerOffer }).merger;
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
  const { mergerId } = impact.payload as { mergerId: string };
  return {
    ...state,
    industry: {
      ...state.industry,
      activeMergers: (state.industry.activeMergers || []).filter(m => m.id !== mergerId)
    }
  };
}
