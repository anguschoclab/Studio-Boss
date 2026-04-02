import { GameState, Project, Franchise, IPAsset } from '../../types';
import { generateId, clamp } from '../../utils';
import { CROSSOVER_AFFINITY } from '../../data/genres';

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
    if (assets.length >= 3 && genres.some(g => g === 'Multiverse' || g === 'IP Mashup')) {
      crossoverBonus += 0.3;
    }
  }
  
  // 2. Format Diversity Multiplier
  const multiplier = franchise.synergyMultiplier;
  
  return Math.floor(baseEquity * crossoverBonus * multiplier);
}

/**
 * Evaluates a finished project and updates or creates its Franchise Hub.
 * This is the entry point for turning successful originals into persistent franchises.
 */
export function updateFranchiseHub(state: GameState, project: Project): GameState {
  let franchiseId = project.franchiseId;
  const updatedFranchises = { ...state.ip.franchises };

  // 1. Breakout Success Detection
  // If an original IP (no franchiseId) hits a high ROI or Prestige, it "Spawns" a Hub.
  const isBreakout = project.revenue > (project.budget * 2.5);
  const isPrestigeHit = (project.awardsProfile?.prestigeScore || 0) > 85;

  if (!franchiseId && (isBreakout || isPrestigeHit)) {
    franchiseId = generateId('hub');
    const newFranchise: Franchise = {
      id: franchiseId,
      name: project.title,
      description: `The ${project.title} Universe`,
      relevanceScore: 100,
      fatigueLevel: 0,
      audienceLoyalty: 50,
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
        synergyMultiplier: clamp(hub.synergyMultiplier + 0.1, 1.0, 2.5) 
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
