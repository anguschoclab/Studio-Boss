import { GameState, Project, Franchise, IPAsset } from '../../types';
import { generateId, clamp } from '../../utils';

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
  assets: IPAsset[]
): number {
  const baseEquity = assets.reduce((sum, a) => sum + (a.baseValue * a.decayRate), 0);
  
  // 1. Shared Universe Premium
  // Releasing multiple entries creates a compounding brand effect.
  const crossoverBonus = assets.length >= 3 ? 1.20 : 1.05; // 20% premium for 3+ assets
  
  // 2. Format Diversity Multiplier
  // High synergy (Film + TV presence) boosts total value.
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
      updatedFranchises[franchiseId] = {
        ...hub,
        assetIds: [...hub.assetIds, newAssetId],
        lastReleaseWeeks: [...hub.lastReleaseWeeks, project.releaseWeek || state.week],
        // Update synergy based on format diversity
        synergyMultiplier: clamp(hub.synergyMultiplier + 0.1, 1.0, 2.5) 
      };
    }
  }

  // Update projects in the state with their new franchiseId if a hub was created
  const activeProjects = state.projects.active.map(p => 
    p.id === project.id ? { ...p, franchiseId } : p
  );

  return {
    ...state,
    projects: { ...state.projects, active: activeProjects },
    ip: {
      ...state.ip,
      franchises: updatedFranchises
    }
  };
}
