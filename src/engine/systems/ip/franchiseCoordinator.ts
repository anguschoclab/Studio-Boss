import { GameState, Project, Franchise } from "../../types";
import { generateId, clamp } from "../../utils";
import { calculateFranchiseEquity } from "./EquityCalculator";

/**
 * Franchise Coordinator.
 * Orchestrates the Shared Universe Hub and calculates "Enterprise Value" for multi-format brands.
 */

/**
 * Evaluates a finished project and updates or creates its Franchise Hub.
 * This is the entry point for turning successful originals into persistent franchises.
 */
export function updateFranchiseHub(state: GameState, project: Project): GameState {
  return updateFranchiseHubs(state, [project]);
}

export function updateFranchiseHubs(state: GameState, projects: Project[]): GameState {
  if (projects.length === 0) return state;

  const updatedFranchises = { ...state.ip.franchises };
  const allProjects = { ...state.entities.projects };

  for (const project of projects) {
    let franchiseId = project.franchiseId;

    // 1. Breakout Success Detection
    // If an original IP (no franchiseId) hits a high ROI or Prestige, it "Spawns" a Hub.
    const isBreakout = project.revenue > project.budget * 1.6;
    const isPrestigeHit = (project.awardsProfile?.prestigeScore || 0) > 80;

    if (!franchiseId && (isBreakout || isPrestigeHit)) {
      franchiseId = generateId("hub");
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
        creationWeek: state.week,
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
        const relevantAssets = state.ip.vault.filter((a) => nextAssetIds.includes(a.id));

        updatedFranchises[franchiseId] = {
          ...hub,
          assetIds: nextAssetIds,
          lastReleaseWeeks: [...hub.lastReleaseWeeks, project.releaseWeek || state.week],
          // Update synergy based on format diversity
          synergyMultiplier: clamp(hub.synergyMultiplier + 0.1, 1.0, 2.5),
        };

        updatedFranchises[franchiseId].totalEquity = calculateFranchiseEquity(
          updatedFranchises[franchiseId],
          relevantAssets,
          state.entities.projects
        );
      }
    }

    // Update projects in the state with their new franchiseId if a hub was created
    if (allProjects[project.id]) {
      allProjects[project.id] = { ...allProjects[project.id], franchiseId };
    }
  }

  return {
    ...state,
    entities: {
      ...state.entities,
      projects: allProjects,
      rivals: state.entities.rivals, // Keep rivals as is
    },
    ip: {
      ...state.ip,
      franchises: updatedFranchises,
    },
  };
}
