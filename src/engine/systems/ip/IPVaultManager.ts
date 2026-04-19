import { GameState, StateImpact } from '../../types';
import { evaluateVaultSynergy } from './synergyEvaluator';
import { applyIPDecay } from './ipValuation';
import { calculateFranchiseFatigue } from './fatigueEngine';
import { determineSyndicationTier } from './syndicationEngine';

/**
 * Weekly IP Vault Tick.
 * Orchestrates synergy evaluation and cultural decay for the entire studio vault.
 * Uses archetype properties to adjust IP behavior if archetype is provided.
 */
export function tickIPVault(state: GameState, archetype?: import('../../data/aiArchetypes').StudioArchetype): StateImpact[] {
  const impacts: StateImpact[] = [];
  const activeProjects = Object.values(state.entities.projects);

  let decayMultiplier = 1.0;
  const genreFocusBonus: Record<string, number> = {};
  let festivalPrestigeBonus = 0;

  if (archetype) {
    if (archetype.strategy === 'acquirer') {
      decayMultiplier = 0.8;
    } else if (archetype.strategy === 'prestige_chaser') {
      decayMultiplier = 1.2;
    }

    if (archetype.genreFocus && archetype.genreFocus.length > 0) {
      archetype.genreFocus.forEach((genre: string) => {
        genreFocusBonus[genre.toLowerCase()] = 0.15;
      });
    }

    if (archetype.festivalParticipation && archetype.festivalParticipation > 50) {
      festivalPrestigeBonus = 10;
    }
  }

  const updatedVault = evaluateVaultSynergy(activeProjects, state.ip.vault).map(asset => {
    let updatedAsset = applyIPDecay(asset);

    if (decayMultiplier !== 1.0) {
      const adjustedDecay = Math.max(0.1, updatedAsset.decayRate * decayMultiplier);
      updatedAsset = { ...updatedAsset, decayRate: adjustedDecay };
    }

    if (Object.keys(genreFocusBonus).length > 0) {
      const sourceProject = state.studio.internal.projectHistory.find(p => p.id === updatedAsset.originalProjectId);
      if (sourceProject && sourceProject.genre) {
        const genreBonus = genreFocusBonus[sourceProject.genre.toLowerCase()] || 0;
        if (genreBonus > 0) {
          updatedAsset = {
            ...updatedAsset,
            baseValue: Math.floor(updatedAsset.baseValue * (1 + genreBonus))
          };
        }
      }
    }

    if (festivalPrestigeBonus > 0) {
      updatedAsset = {
        ...updatedAsset,
        baseValue: updatedAsset.baseValue + festivalPrestigeBonus * 1000
      };
    }

    if (updatedAsset.totalEpisodes > 0) {
      const sourceProject = state.studio.internal.projectHistory.find(p => p.id === updatedAsset.originalProjectId);
      const genre = sourceProject?.genre || 'DRAMA';
      
      const newTier = determineSyndicationTier(updatedAsset.totalEpisodes, genre);
      if (newTier !== updatedAsset.syndicationTier) {
        updatedAsset = {
          ...updatedAsset,
          syndicationTier: newTier,
          syndicationStatus: newTier !== 'NONE' ? 'SYNDICATED' : 'NONE'
        };
      }
    }

    return updatedAsset;
  });

  updatedVault.forEach(asset => {
    impacts.push({
      type: 'VAULT_ASSET_UPDATED',
      payload: { assetId: asset.id, update: asset }
    });
  });

  const genreSaturation: Record<string, number> = {};
  const projects = Object.values(state.entities.projects);
  projects.forEach((p) => {
    if (p.genre) {
      const g = p.genre.toUpperCase();
      genreSaturation[g] = (genreSaturation[g] || 0) + 1;
    }
  });

  Object.values(state.ip.franchises).forEach(franchise => {
    const firstAssetId = franchise.assetIds[0];
    const firstAsset = state.ip.vault.find(a => a.id === firstAssetId);
    const sourceProject = firstAsset?.originalProjectId ? (state.entities.projects[firstAsset.originalProjectId] || state.studio.internal.projectHistory.find(p => p.id === firstAsset.originalProjectId)) : undefined;
    
    const genre = sourceProject?.genre || 'Action';
    const saturation = genreSaturation[genre.toUpperCase()] || 0;
    const newFatigue = calculateFranchiseFatigue(franchise, saturation, genre);

    if (newFatigue !== franchise.fatigueLevel) {
      impacts.push({
        type: 'FRANCHISE_UPDATED',
        payload: {
          franchiseId: franchise.id,
          update: { fatigueLevel: newFatigue }
        }
      });
    }
  });

  return impacts;
}
