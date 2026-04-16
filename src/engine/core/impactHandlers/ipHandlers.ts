import { GameState, StateImpact, Franchise } from '@/engine/types';

/**
 * IP-related impact handlers
 * Pure functions that apply IP-related state impacts
 */

export function handleFranchiseUpdated(state: GameState, impact: StateImpact): GameState {
  const { franchiseId, update } = impact.payload;
  const franchises = { ...state.ip.franchises };
  const franchise = franchises[franchiseId];
  if (franchise) {
    franchises[franchiseId] = { ...franchise, ...update };
  } else {
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

export function handleVaultAssetUpdated(state: GameState, impact: StateImpact): GameState {
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

export function handleFormatLicensed(state: GameState, impact: StateImpact): GameState {
  const { asset } = impact.payload as { asset: import('@/engine/types/state.types').IPAsset };
  const existingIds = new Set(state.ip.vault.map(a => a.id));
  if (existingIds.has(asset.id)) return state;
  return {
    ...state,
    ip: { ...state.ip, vault: [...state.ip.vault, asset] }
  };
}
