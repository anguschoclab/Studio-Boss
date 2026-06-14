import { GameState, StateImpact } from '@/engine/types';

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Industry-related impact handlers
 * Pure functions that apply industry-related state impacts
 */

export function handleIndustryUpdate(state: GameState, impact: StateImpact): GameState {
  const payload = impact.payload as Record<string, unknown>;
  if (!payload || typeof payload !== 'object') return state;
  let nextState = { ...state };

  // 1. Batch Project Updates
  if (Array.isArray(payload.projects)) {
    const nextProjects = { ...nextState.entities.projects };
    payload.projects.forEach(
      (u: {
        projectId: import("@/engine/shared.types").ProjectId;
        update: Partial<import("@/engine/types").Project>;
      }) => {
        if (nextProjects[u.projectId]) {
          nextProjects[u.projectId] = {
            ...nextProjects[u.projectId],
            ...u.update,
          } as import("@/engine/types").Project;
        }
      }
    );
    nextState = { ...nextState, entities: { ...nextState.entities, projects: nextProjects } };
  }

  // 2. Batch Rival Updates
  if (Array.isArray(payload.rivals)) {
    const nextRivals = { ...nextState.entities.rivals };
    payload.rivals.forEach(
      (u: {
        rivalId: import("@/engine/shared.types").StudioId;
        update: Partial<import("@/engine/types").RivalStudio>;
      }) => {
        if (nextRivals[u.rivalId]) {
          nextRivals[u.rivalId] = { ...nextRivals[u.rivalId], ...u.update };
        }
      }
    );
    nextState = { ...nextState, entities: { ...nextState.entities, rivals: nextRivals } };
  }

  // 3. Batch Talent Updates
  if (Array.isArray(payload.talents)) {
    const nextTalents = { ...nextState.entities.talents };
    payload.talents.forEach(
      (u: {
        talentId: import("@/engine/shared.types").TalentId;
        update: Partial<import("@/engine/types").Talent>;
      }) => {
        if (nextTalents[u.talentId]) {
          nextTalents[u.talentId] = { ...nextTalents[u.talentId], ...u.update };
        }
      }
    );
    nextState = { ...nextState, entities: { ...nextState.entities, talents: nextTalents } };
  }

  // 4. Generic Deep-Path Updates (for dynamic events)
  const update = payload.update;
  if (update && typeof update === "object" && !Array.isArray(update)) {
    const clonedRefs = new Set<unknown>([nextState]);
    for (const [path, value] of Object.entries(update)) {
      const parts = path.split('.');
      let current: Record<string, unknown> = nextState as unknown as Record<string, unknown>;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (FORBIDDEN_KEYS.has(part)) break;

        const nextTarget = current[part];
        if (!clonedRefs.has(nextTarget)) {
          if (Array.isArray(nextTarget)) {
            current[part] = [...nextTarget];
          } else if (typeof nextTarget === "object" && nextTarget !== null) {
            current[part] = { ...nextTarget };
          } else {
            current[part] = {};
          }
          clonedRefs.add(current[part]);
        }
        current = current[part];
      }

      const lastPart = parts[parts.length - 1];
      if (!FORBIDDEN_KEYS.has(lastPart)) {
        current[lastPart] = value;
      }
    }
  }

  // Merger Logic
  const { mergedRivalId, acquirerId } = payload as { mergedRivalId?: string; acquirerId?: string };
  if (mergedRivalId && acquirerId) {
    const target = state.entities.rivals[mergedRivalId];
    if (target) {
      if (acquirerId === "player") {
        const mergedVault = nextState.ip.vault.map((asset) => {
          if (asset.ownerStudioId === mergedRivalId) {
            return { ...asset, rightsOwner: "STUDIO" as const, ownerStudioId: undefined };
          }
          return asset;
        });

        nextState = {
          ...nextState,
          ip: { ...nextState.ip, vault: mergedVault },
        };
      } else {
        const rivals = { ...nextState.entities.rivals };
        if (rivals[acquirerId]) {
          const acquirer = rivals[acquirerId];
          rivals[acquirerId] = {
            ...acquirer,
            projectIds: [...(acquirer.projectIds || []), ...(target.projectIds || [])],
            ownedPlatforms: [...(acquirer.ownedPlatforms || []), ...(target.ownedPlatforms || [])],
          };
        }

        const mergedVault = nextState.ip.vault.map((asset) => {
          if (asset.ownerStudioId === mergedRivalId) {
            return {
              ...asset,
              rightsOwner: "RIVAL" as const,
              ownerStudioId: acquirerId as import("@/engine/shared.types").StudioId,
            };
          }
          return asset;
        });

        nextState = {
          ...nextState,
          entities: {
            ...nextState.entities,
            rivals,
          },
          ip: { ...nextState.ip, vault: mergedVault },
        };
      }

      const rivals = { ...nextState.entities.rivals };
      delete rivals[mergedRivalId];
      nextState = { ...nextState, entities: { ...nextState.entities, rivals } };
    }
  }

  if (payload["market.opportunities"]) {
    nextState = {
      ...nextState,
      market: { ...nextState.market, opportunities: payload["market.opportunities"] },
    };
  }

  return nextState;
}

export function handleScandalAdded(state: GameState, impact: StateImpact): GameState {
  const { scandal } = impact.payload as {
    scandal: import("@/engine/types/industry.types").Scandal;
  };
  let newPrestige = state.studio.prestige;

  const prestigeHit = Math.floor((scandal.severity / 5) * 3.0);
  newPrestige = Math.max(0, newPrestige - prestigeHit);

  const projectIds = new Set<string>();
  const contractsRaw = state.entities.contracts || {};
  const scandalTalentId = scandal.talentId;
  for (const key in contractsRaw) {
    if (Object.prototype.hasOwnProperty.call(contractsRaw, key)) {
      const c = contractsRaw[key];
      if (c.talentId === scandalTalentId) {
        projectIds.add(c.projectId);
      }
    }
  }

  let projects = state.entities.projects;

  if (projectIds.size > 0) {
    projects = { ...projects };

    for (const pid of projectIds) {
      const project = projects[pid];
      if (project) {
        const format = project.format;
        const genre = project.genre ? project.genre.toLowerCase() : "";
        if (format === "unscripted" || genre.includes("horror")) {
          projects[pid] = {
            ...project,
            buzz: Math.min(100, (project.buzz || 0) + scandal.severity * 3.0),
          };
        } else {
          projects[pid] = {
            ...project,
            buzz: Math.max(0, (project.buzz || 0) - Math.floor(scandal.severity)),
          };
        }
      }
    }
  }

  return {
    ...state,
    studio: {
      ...state.studio,
      prestige: newPrestige,
    },
    entities: {
      ...state.entities,
      projects,
    },
    industry: {
      ...state.industry,
      scandals: [...(state.industry.scandals || []), scandal],
    },
  };
}

export function handleScandalRemoved(state: GameState, impact: StateImpact): GameState {
  const { scandalId } = impact.payload as { scandalId: string };
  return {
    ...state,
    industry: {
      ...state.industry,
      scandals: (state.industry.scandals || []).filter((s) => s.id !== scandalId),
    },
  };
}

export function handleRivalUpdated(state: GameState, impact: StateImpact): GameState {
  const { rivalId, update } = impact.payload as {
    rivalId: string;
    update: Partial<import("@/engine/types").RivalStudio>;
  };
  if (!state.entities?.rivals) return state;
  const rivals = { ...state.entities.rivals };
  if (rivals[rivalId]) {
    rivals[rivalId] = { ...rivals[rivalId], ...update };
  }
  return {
    ...state,
    entities: {
      ...state.entities,
      rivals,
    },
  };
}

export function handleMergerOffered(state: GameState, impact: StateImpact): GameState {
  const merger = (
    impact.payload as { merger?: import("@/engine/types/industry.types").MergerOffer }
  ).merger;
  if (!merger) return state;
  return {
    ...state,
    industry: {
      ...state.industry,
      activeMergers: [...(state.industry.activeMergers || []), merger],
    },
  };
}

export function handleMergerResolved(state: GameState, impact: StateImpact): GameState {
  const { mergerId } = impact.payload as { mergerId: string };
  return {
    ...state,
    industry: {
      ...state.industry,
      activeMergers: (state.industry.activeMergers || []).filter((m) => m.id !== mergerId),
    },
  };
}
