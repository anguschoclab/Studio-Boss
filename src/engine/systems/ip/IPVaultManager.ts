import { GameState, StateImpact } from "../../types";
import { evaluateVaultSynergy } from "./synergyEvaluator";
import { applyIPDecay } from "./ipValuation";
import { calculateFranchiseFatigue } from "./fatigueEngine";
import { determineSyndicationTier } from "./syndicationEngine";

/**
 * Weekly IP Vault Tick.
 * Orchestrates synergy evaluation and cultural decay for the entire studio vault.
 * Uses archetype properties to adjust IP behavior if archetype is provided.
 */
export function tickIPVault(
  state: GameState,
  archetype?: import("../../data/aiArchetypes").StudioArchetype
): StateImpact[] {
  const impacts: StateImpact[] = [];
  // ⚡ The Framerate Fanatic: Eliminate intermediate array allocation
  const activeProjects: import("../../types").Project[] = [];
  for (const id in state.entities.projects) {
    activeProjects.push(state.entities.projects[id]);
  }

  let decayMultiplier = 1.0;
  const genreFocusBonus: Record<string, number> = {};
  let festivalPrestigeBonus = 0;

  if (archetype) {
    if (archetype.strategy === "acquirer") {
      decayMultiplier = 0.8;
    } else if (archetype.strategy === "prestige_chaser") {
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

  const hasGenreBonus = Object.keys(genreFocusBonus).length > 0;

  const updatedVault = evaluateVaultSynergy(activeProjects, state.ip.vault).map((asset) => {
    let updatedAsset = applyIPDecay(asset);

    if (decayMultiplier !== 1.0) {
      const adjustedDecay = Math.max(0.1, updatedAsset.decayRate * decayMultiplier);
      updatedAsset = { ...updatedAsset, decayRate: adjustedDecay };
    }

    // ⚡ Bolt: Fetch source project once from map instead of O(N) array search inside map iteration
    const sourceProject =
      hasGenreBonus || updatedAsset.totalEpisodes > 0
        ? state.entities.projects[updatedAsset.originalProjectId]
        : undefined;

    if (hasGenreBonus) {
      if (sourceProject && sourceProject.genre) {
        const genreBonus = genreFocusBonus[sourceProject.genre.toLowerCase()] || 0;
        if (genreBonus > 0) {
          updatedAsset = {
            ...updatedAsset,
            baseValue: Math.floor(updatedAsset.baseValue * (1 + genreBonus)),
          };
        }
      }
    }

    if (festivalPrestigeBonus > 0) {
      updatedAsset = {
        ...updatedAsset,
        baseValue: updatedAsset.baseValue + festivalPrestigeBonus * 1000,
      };
    }

    if (updatedAsset.totalEpisodes > 0) {
      const genre = sourceProject?.genre || "DRAMA";

      const newTier = determineSyndicationTier(updatedAsset.totalEpisodes, genre);
      if (newTier !== updatedAsset.syndicationTier) {
        updatedAsset = {
          ...updatedAsset,
          syndicationTier: newTier,
          syndicationStatus: newTier !== "NONE" ? "SYNDICATED" : "NONE",
        };
      }
    }

    return updatedAsset;
  });

  updatedVault.forEach((asset) => {
    impacts.push({
      type: "VAULT_ASSET_UPDATED",
      payload: { assetId: asset.id, update: asset },
    });
  });

  const genreSaturation: Record<string, number> = {};
  // ⚡ The Framerate Fanatic: Replace Object.values with direct for...in loop
  for (const id in state.entities.projects) {
    const p = state.entities.projects[id];
    if (p.genre) {
      const g = p.genre.toUpperCase();
      genreSaturation[g] = (genreSaturation[g] || 0) + 1;
    }
  }

  const vaultMap = new Map(state.ip.vault.map((a) => [a.id, a]));

  // ⚡ The Framerate Fanatic: Replace Object.values with direct for...in loop
  for (const id in state.ip.franchises) {
    const franchise = state.ip.franchises[id];
    const firstAssetId = (franchise.assetIds || [])[0];
    const firstAsset = vaultMap.get(firstAssetId);
    const sourceProject = firstAsset?.originalProjectId
      ? state.entities.projects[firstAsset.originalProjectId]
      : undefined;

    const genre = sourceProject?.genre || "Action";
    const saturation = genreSaturation[genre.toUpperCase()] || 0;
    const newFatigue = calculateFranchiseFatigue(franchise, saturation, genre);

    if (newFatigue !== franchise.fatigueLevel) {
      impacts.push({
        type: "FRANCHISE_UPDATED",
        payload: {
          franchiseId: franchise.id,
          update: { fatigueLevel: newFatigue },
        },
      });
    }
  }

  return impacts;
}
