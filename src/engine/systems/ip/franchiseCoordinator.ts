import { GameState, Project, Franchise, IPAsset } from '../../types';
import { clamp } from '../../utils';
import { CROSSOVER_AFFINITY } from '../../data/genres';
import { RandomGenerator } from '../../utils/rng';
import { evaluateVaultSynergy } from './synergyEvaluator';
import { applyIPDecay } from './ipValuation';

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
        const normalizedGenre = Object.keys(CROSSOVER_AFFINITY).find(
          k => k.toLowerCase() === p.genre!.toLowerCase()
        ) || p.genre;
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

    // Avengers-style crossover event check
    // 🌌 The Universe Builder: Massive event films generate unprecedented synergy.
    if (assets.length >= 3 && genres.some(g => g === 'Multiverse' || g === 'IP Mashup')) {
      crossoverBonus += 0.45;
    }

    // 🌌 The Universe Builder: Added a 15% synergy bonus when combining two Level 3+ franchises in a crossover event.
    if (assets.length >= 5) {
      crossoverBonus += 0.15;
    }
  }
  
  // 2. Format Diversity Multiplier
  const multiplier = franchise.synergyMultiplier;
  
  // 🌌 The Universe Builder: A mega-franchise with 10+ assets holds a cultural premium.
  const megaFranchisePremium = assets.length >= 10 ? 1.25 : 1.0;

  return Math.floor(baseEquity * crossoverBonus * multiplier * megaFranchisePremium);
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
    franchiseId = rng.uuid('hub');
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

      updatedFranchises[franchiseId] = {
        ...hub,
        assetIds: nextAssetIds,
        lastReleaseWeeks: [...hub.lastReleaseWeeks, project.releaseWeek || state.week],
        // Update synergy based on format diversity
        synergyMultiplier: clamp(hub.synergyMultiplier + 0.15, 1.0, 3.0) // 🌌 The Universe Builder: Synergy cap raised for mega-franchises.
      };

      // Recalculate Enterprise Value
      updatedFranchises[franchiseId].totalEquity = calculateFranchiseEquity(
        updatedFranchises[franchiseId],
        relevantAssets,
        state.studio.internal.projects
      );
    }
  }

  // Update projects in the state with their new franchiseId if a hub was created
  const activeProjects = Object.fromEntries(
    Object.entries(state.studio.internal.projects).map(([id, existingProject]) => [
      id,
      existingProject.id === project.id ? { ...existingProject, franchiseId } : existingProject
    ])
  );

  return {
    ...state,
    studio: {
      ...state.studio,
      internal: {
        ...state.studio.internal,
        projects: activeProjects
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
  const projects = Object.values(state.studio.internal.projects);
  
  projects.forEach(project => {
    // Only process for the week the project is released
    if (project.state === 'released' && project.releaseWeek === state.week) {
      let franchiseId = project.franchiseId;
      const isBreakout = project.revenue > (project.budget * 2.5);
      const isPrestigeHit = (project.awardsProfile?.prestigeScore || 0) > 85;

      // 1. Breakout Hub Creation
      if (!franchiseId && (isBreakout || isPrestigeHit)) {
        franchiseId = rng.uuid('hub');
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
          
          impacts.push({
            type: 'FRANCHISE_UPDATED',
            payload: {
              franchiseId,
              update: {
                assetIds: nextAssetIds,
                lastReleaseWeeks: nextReleaseWeeks,
                synergyMultiplier: clamp(hub.synergyMultiplier + 0.15, 1.0, 3.0) // 🌌 The Universe Builder: Synergy cap raised for mega-franchises.
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
  const activeProjects = Object.values(state.studio.internal.projects);

  // 1. Evaluate Synergy (Reboots/Spinoffs in production) 
  // 2. Apply Decay (Synergy-shielded & Tiered)
  const updatedVault = evaluateVaultSynergy(activeProjects, state.ip.vault).map(asset => applyIPDecay(asset));

  // 3. Generate individual update impacts
  updatedVault.forEach(asset => {
    impacts.push({
      type: 'VAULT_ASSET_UPDATED',
      payload: { assetId: asset.id, update: asset }
    });
  });

  return impacts;
}
