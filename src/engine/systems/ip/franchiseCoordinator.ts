import { GameState, Project, Franchise, IPAsset } from '../../types';
import { clamp } from '../../utils';
import { CROSSOVER_AFFINITY } from '../../data/genres';
import { RandomGenerator } from '../../utils/rng';
import { evaluateVaultSynergy } from './synergyEvaluator';
import { applyIPDecay } from './ipValuation';
import { calculateFranchiseFatigue } from './fatigueEngine';
import { determineSyndicationTier } from './syndicationEngine';

// ⚡ Bolt: Pre-compute lowercased keys for O(1) lookups to avoid allocating keys array repeatedly in the loop
const CROSSOVER_AFFINITY_LOWER_KEYS = Object.keys(CROSSOVER_AFFINITY).reduce((acc, key) => {
  acc[key.toLowerCase()] = key;
  return acc;
}, {} as Record<string, string>);

/**
 * Franchise Coordinator.
 * Orchestrates the Shared Universe Hub and calculates "Enterprise Value" for multi-format brands.
 */

/**
 * Calculates total equity for a franchise including the "Shared Universe Premium".
 * Real-world: A 'brand' is worth more than the sum of its individual box office takes.
 */
export function calculateFranchiseEquity(
  franchise: Franchise,
  assets: IPAsset[],
  sourceProjects?: Record<string, Project> // Pass projects to resolve genres
): number {
  const baseEquity = assets.reduce((sum, a) => sum + (a.baseValue * a.decayRate), 0);
  
  // 1. Shared Universe Premium
  let crossoverBonus = assets.length >= 3 ? 1.20 : 1.05;

  // 1b. Genre Crossover Events Hook
  if (sourceProjects && assets.length > 1) {
    const uniqueGenres = new Set<string>();
    assets.forEach(a => {
      const p = sourceProjects[a.originalProjectId];
      if (p && p.genre) {
        // Normalize to Title Case to match CROSSOVER_AFFINITY keys (e.g. 'Action', 'Sci-Fi')
        // ⚡ Bolt: Replaced O(N) Object.keys().find() with O(1) static lookup
        const lowerGenre = p.genre!.toLowerCase();
        const normalizedGenre = CROSSOVER_AFFINITY_LOWER_KEYS[lowerGenre] || p.genre;
        uniqueGenres.add(normalizedGenre);
      }
    });

    const genres = Array.from(uniqueGenres);
    let synergyHits = 0;
    for (let i = 0; i < genres.length; i++) {
      for (let j = i + 1; j < genres.length; j++) {
        const g1 = genres[i];
        const g2 = genres[j];
        if (CROSSOVER_AFFINITY[g1]?.includes(g2) || CROSSOVER_AFFINITY[g2]?.includes(g1)) {
          synergyHits++;
        }
      }
    }
    // Boost bonus significantly if diverse compatible genres cross over
    crossoverBonus += Math.min(0.5, synergyHits * 0.15);

    // 🌌 The Universe Builder: Golden Age of Crossovers. When combining extremely compatible, highly synergistic IP genres.
    if (synergyHits >= 4) {
      crossoverBonus += 0.35;
    }

    // Avengers-style crossover event check
    // 🌌 The Universe Builder: Massive event films generate unprecedented synergy.
    if (assets.length >= 3 && genres.some(g => g === 'Multiverse' || g === 'IP Mashup')) {
      crossoverBonus += 0.45;
    }

    // 🌌 The Universe Builder: Added a 15% synergy bonus when combining two Level 3+ franchises in a crossover event.
    if (assets.length >= 5) {
      crossoverBonus += 0.15;
    }

    // 🌌 The Universe Builder: Added a 25% synergy bonus for massive crossover events linking 4 or more distinct IPs via IP Mashup.
    if (assets.length >= 4 && genres.some(g => g === 'IP Mashup' || g === 'Multiverse')) {
      crossoverBonus += 0.25;
    }

    // 🌌 The Universe Builder: Legacy Character Return Massive Crossover
    if (assets.length >= 4 && genres.some(g => g === 'Legacy Sequel')) {
      crossoverBonus += 0.35;
    }

    // 🌌 The Universe Builder: Penalty for chaotic crossovers (too many genres, not enough synergy)
    if (genres.length >= 4 && synergyHits < 2) {
      crossoverBonus -= 0.20;
    }
  }
  
  // 🌌 The Universe Builder: Curated Universe Premium.
  if (assets.length >= 5 && franchise.activeProjectIds.length <= 2) {
    crossoverBonus += 0.30;
  }

  // 2. Format Diversity Multiplier
  const multiplier = franchise.synergyMultiplier;
  
  // 🌌 The Universe Builder: A mega-franchise with 10+ assets holds a cultural premium.
  const megaFranchisePremium = assets.length >= 10 ? 1.25 : 1.0;

  // 🌌 The Universe Builder: Penalty applied for diluting the franchise brand with too many concurrent projects.
  const overSaturationPenalty = franchise.activeProjectIds && franchise.activeProjectIds.length >= 4 ? 0.8 : 1.0;

  // 🌌 The Universe Builder: Massive penalty to valuation if the franchise is heavily fatigued
  const fatiguePenalty = franchise.fatigueLevel > 0.8 ? 0.5 : 1.0;

  return Math.floor(baseEquity * crossoverBonus * multiplier * megaFranchisePremium * overSaturationPenalty * fatiguePenalty);
}

/**
 * Evaluates a finished project and updates or creates its Franchise Hub.
 * This is the entry point for turning successful originals into persistent franchises.
 */
export function updateFranchiseHub(state: GameState, project: Project, rng: RandomGenerator): GameState {
  let franchiseId = project.franchiseId;
  const updatedFranchises = { ...state.ip.franchises };

  // 1. Breakout Success Detection
  // If an original IP (no franchiseId) hits a high ROI or Prestige, it "Spawns" a Hub.
  const isBreakout = project.revenue > (project.budget * 2.5);
  const isPrestigeHit = (project.awardsProfile?.prestigeScore || 0) > 85;

  if (!franchiseId && (isBreakout || isPrestigeHit)) {
    franchiseId = rng.uuid('IPH');
    const newFranchise: Franchise = {
      id: franchiseId,
      name: project.title,
      description: `The ${project.title} Universe`,
      relevanceScore: 100,
      fatigueLevel: 0,
      audienceLoyalty: isBreakout ? 65 : 50, // 🌌 The Universe Builder: Breakout hits secure higher initial loyalty.
      totalEquity: Math.floor(project.revenue * 0.2),
      synergyMultiplier: 1.0,
      assetIds: [`ip-${project.id}`],
      activeProjectIds: [],
      lastReleaseWeeks: [project.releaseWeek || state.week],
      creationWeek: state.week
    };
    updatedFranchises[franchiseId] = newFranchise;
  } 
  
  // 2. Existing Franchise Maintenance
  else if (franchiseId && updatedFranchises[franchiseId]) {
    const hub = updatedFranchises[franchiseId];
    const newAssetId = `ip-${project.id}`;
    
    // Avoid duplicate links
    if (!hub.assetIds.includes(newAssetId)) {
      const nextAssetIds = [...hub.assetIds, newAssetId];
      const relevantAssets = state.ip.vault.filter(a => nextAssetIds.includes(a.id));

      // 🌌 The Universe Builder: Audience loyalty dilution when pushing out too many active projects
      let updatedLoyalty = hub.audienceLoyalty;
      let updatedSynergy = clamp(hub.synergyMultiplier + 0.15, 1.0, 3.0);
      if (hub.activeProjectIds.length >= 3) {
        updatedLoyalty = clamp(updatedLoyalty - 5, 0, 100);
      }

      // 🌌 The Universe Builder: Reboot Renaissance. If a dead franchise gets a new hit, loyalty spikes.
      const lastRelease = hub.lastReleaseWeeks.length > 0 ? Math.max(...hub.lastReleaseWeeks) : state.week;
      const yearsSince = (state.week - lastRelease) / 52;
      const isBreakout = project.revenue > (project.budget * 2.5);
      const isPrestigeHit = (project.awardsProfile?.prestigeScore || 0) > 85;

      if (yearsSince >= 7 && (isBreakout || isPrestigeHit)) {
        updatedLoyalty = clamp(updatedLoyalty + 20, 0, 100);
        updatedSynergy = clamp(updatedSynergy + 0.5, 1.0, 3.0);
      } else if (yearsSince >= 7 && !isBreakout && !isPrestigeHit) {
        // 🌌 The Universe Builder: Failed legacy reboot damages the brand
        updatedLoyalty = clamp(updatedLoyalty - 15, 0, 100);
      }

      updatedFranchises[franchiseId] = {
        ...hub,
        assetIds: nextAssetIds,
        lastReleaseWeeks: [...hub.lastReleaseWeeks, project.releaseWeek || state.week],
        audienceLoyalty: updatedLoyalty,
        // Update synergy based on format diversity
        synergyMultiplier: updatedSynergy // 🌌 The Universe Builder: Synergy cap raised for mega-franchises.
      };

      // 🌌 The Universe Builder: Spin-off Fatigue Cascade - a bomb tanks relevance
      if (!isBreakout && !isPrestigeHit && project.revenue < project.budget) {
        updatedFranchises[franchiseId].relevanceScore = clamp(updatedFranchises[franchiseId].relevanceScore - 10, 0, 100);
      } else if (isBreakout || isPrestigeHit) {
        updatedFranchises[franchiseId].relevanceScore = clamp(updatedFranchises[franchiseId].relevanceScore + 10, 0, 100);
      }

      // 🌌 The Universe Builder: Over-saturation Relevance Penalty.
      if (updatedFranchises[franchiseId].activeProjectIds.length >= 5) {
        updatedFranchises[franchiseId].relevanceScore = clamp(updatedFranchises[franchiseId].relevanceScore - 15, 0, 100);
      }

      // Recalculate Enterprise Value
      updatedFranchises[franchiseId].totalEquity = calculateFranchiseEquity(
        updatedFranchises[franchiseId],
        relevantAssets,
        state.entities.projects
      );
    }
  }

  // Update projects in the state with their new franchiseId if a hub was created
  const historyUpdates = state.studio.internal.projectHistory.map(existingProject => 
    existingProject.id === project.id ? { ...existingProject, franchiseId } : existingProject
  );

  return {
    ...state,
    studio: {
      ...state.studio,
      internal: {
        ...state.studio.internal,
        projectHistory: historyUpdates
      }
    },
    ip: {
      ...state.ip,
      franchises: updatedFranchises
    }
  };
}

/**
 * Stage 2.3 Pipeline Hook.
 * Identifies projects released in the current simulation week and triggers franchise evolution.
 */
export function calculateFranchiseEvolutionImpacts(state: GameState, rng: RandomGenerator): import('../../types/state.types').StateImpact[] {
  const impacts: import('../../types/state.types').StateImpact[] = [];
  const projects = Object.values(state.entities.projects);
  
  projects.forEach(project => {
    // Only process for the week the project is released
    if (project.state === 'released' && project.releaseWeek === state.week) {
      let franchiseId = project.franchiseId;
      const isBreakout = project.revenue > (project.budget * 2.5);
      const isPrestigeHit = (project.awardsProfile?.prestigeScore || 0) > 85;

      // 1. Breakout Hub Creation
      if (!franchiseId && (isBreakout || isPrestigeHit)) {
        franchiseId = rng.uuid('IPH');
        const newFranchise: Franchise = {
          id: franchiseId,
          name: project.title,
          description: `The ${project.title} Universe`,
          relevanceScore: 100,
          fatigueLevel: 0,
          audienceLoyalty: isBreakout ? 65 : 50, // 🌌 The Universe Builder: Breakout hits secure higher initial loyalty.
          totalEquity: Math.floor(project.revenue * 0.2),
          synergyMultiplier: 1.0,
          assetIds: [`ip-${project.id}`],
          activeProjectIds: [],
          lastReleaseWeeks: [state.week],
          creationWeek: state.week
        };
        
        impacts.push({
          type: 'FRANCHISE_UPDATED',
          payload: { franchiseId, update: newFranchise }
        });

        // Link the project back to the hub
        impacts.push({
          type: 'PROJECT_UPDATED',
          payload: { projectId: project.id, update: { franchiseId } }
        });

        // Link the existing IP asset in the vault to the hub
        impacts.push({
          type: 'VAULT_ASSET_UPDATED',
          payload: { assetId: `ip-${project.id}`, update: { franchiseId } }
        });
      }
      
      // 2. Mainstream Hub Maintenance
      else if (franchiseId && state.ip.franchises[franchiseId]) {
        const hub = state.ip.franchises[franchiseId];
        const newAssetId = `ip-${project.id}`;
        
        if (!hub.assetIds.includes(newAssetId)) {
          const nextAssetIds = [...hub.assetIds, newAssetId];
          const nextReleaseWeeks = [...hub.lastReleaseWeeks, state.week];
          
          // 🌌 The Universe Builder: Audience loyalty dilution when pushing out too many active projects
          let updatedLoyalty = hub.audienceLoyalty;
          if (hub.activeProjectIds.length >= 3) {
            updatedLoyalty = clamp(updatedLoyalty - 5, 0, 100);
          }

          impacts.push({
            type: 'FRANCHISE_UPDATED',
            payload: {
              franchiseId,
              update: {
                assetIds: nextAssetIds,
                lastReleaseWeeks: nextReleaseWeeks,
                audienceLoyalty: updatedLoyalty,
                synergyMultiplier: clamp(hub.synergyMultiplier + 0.15, 1.0, 3.0), // 🌌 The Universe Builder: Synergy cap raised for mega-franchises.
                relevanceScore: clamp(
                  hub.relevanceScore - (hub.activeProjectIds.length >= 5 ? 15 : 0),
                  0,
                  100
                ) // 🌌 The Universe Builder: Over-saturation Relevance Penalty
              }
            }
          });

          // Link the newly created and archived IP asset to the existing hub
          impacts.push({
            type: 'VAULT_ASSET_UPDATED',
            payload: { assetId: newAssetId, update: { franchiseId } }
          });
        }
      }
    }
  });

  return impacts;
}

/**
 * Phase 7: Weekly IP Vault Tick.
 * Orchestrates synergy evaluation and cultural decay for the entire studio vault.
 */
export function tickIPVault(state: GameState): import('../../types/state.types').StateImpact[] {
  const impacts: import('../../types/state.types').StateImpact[] = [];
  const activeProjects = Object.values(state.entities.projects);

  // 1. Evaluate Synergy (Reboots/Spinoffs in production) 
  // 2. Apply Decay (Synergy-shielded & Tiered)
  const updatedVault = evaluateVaultSynergy(activeProjects, state.ip.vault).map(asset => {
    let updatedAsset = applyIPDecay(asset);

    // 📺 Phase 3: Syndication Integration
    // If it's a TV show with episodes, check for syndication milestones
    if (updatedAsset.totalEpisodes > 0) {
      // We need a genre. Try to find it from history or default to 'DRAMA'.
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

  // 3. Generate individual update impacts for assets
  updatedVault.forEach(asset => {
    impacts.push({
      type: 'VAULT_ASSET_UPDATED',
      payload: { assetId: asset.id, update: asset }
    });
  });

  // 4. Phase 3: Franchise Fatigue Integration
  // Calculate industry-wide genre saturation
  const genreSaturation: Record<string, number> = {};
  [
    ...Object.values(state.entities.projects),
    ...Object.values(state.entities.rivals).flatMap(r => Object.values(r.projects || {}))
  ].forEach((p: Project) => {
    if (p.genre) {
      const g = p.genre.toUpperCase();
      genreSaturation[g] = (genreSaturation[g] || 0) + 1;
    }
  });

  Object.values(state.ip.franchises).forEach(franchise => {
    // Find a representative genre for the franchise
    const firstAssetId = franchise.assetIds[0];
    const firstAsset = state.ip.vault.find(a => a.id === firstAssetId);
    // Search both current projects and history to find the genre
    // ⚡ The Framerate Fanatic: Refactored array .find() on Object.values() to direct O(1) dictionary lookup.
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
