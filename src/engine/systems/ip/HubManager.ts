import { GameState, Project, Franchise, StateImpact } from '../../types';
import { RandomGenerator } from '../../utils/rng';
import { calculateFranchiseEquity } from './EquityCalculator';
import { clamp } from '../../utils';

/**
 * Evaluates a finished project and updates or creates its Franchise Hub.
 * This is the entry point for turning successful originals into persistent franchises.
 */
export function updateFranchiseHub(state: GameState, project: Project, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  let franchiseId = project.franchiseId;

  // 1. Breakout Success Detection
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
      audienceLoyalty: isBreakout ? 65 : 50,
      totalEquity: Math.floor(project.revenue * 0.2),
      synergyMultiplier: 1.0,
      assetIds: [`ip-${project.id}`],
      activeProjectIds: [],
      lastReleaseWeeks: [project.releaseWeek || state.week],
      creationWeek: state.week
    };
    
    impacts.push({
      type: 'FRANCHISE_UPDATED',
      payload: { franchiseId, update: newFranchise }
    });
    
    impacts.push({
      type: 'PROJECT_UPDATED',
      payload: { projectId: project.id, update: { franchiseId } }
    });
  } 
  
  // 2. Existing Franchise Maintenance
  else if (franchiseId && state.ip.franchises[franchiseId]) {
    const hub = state.ip.franchises[franchiseId];
    const newAssetId = `ip-${project.id}`;
    
    if (!hub.assetIds.includes(newAssetId)) {
      const nextAssetIds = [...hub.assetIds, newAssetId];
      const relevantAssets = state.ip.vault.filter(a => a.id && nextAssetIds.includes(a.id));

      let updatedLoyalty = hub.audienceLoyalty;
      let updatedSynergy = clamp(hub.synergyMultiplier + 0.15, 1.0, 3.0);
      if (hub.activeProjectIds.length >= 3) {
        updatedLoyalty = clamp(updatedLoyalty - 5, 0, 100);
      }

      const lastRelease = hub.lastReleaseWeeks.length > 0 ? Math.max(...hub.lastReleaseWeeks) : state.week;
      const yearsSince = (state.week - lastRelease) / 52;

      if (yearsSince >= 12 && (isBreakout || isPrestigeHit)) {
        updatedLoyalty = clamp(updatedLoyalty + 30, 0, 100);
        updatedSynergy = clamp(updatedSynergy + 0.85, 1.0, 3.5);
      } else if (yearsSince >= 12 && !isBreakout && !isPrestigeHit) {
        updatedLoyalty = clamp(updatedLoyalty - 25, 0, 100);
      } else if (yearsSince >= 7 && (isBreakout || isPrestigeHit)) {
        updatedLoyalty = clamp(updatedLoyalty + 20, 0, 100);
        updatedSynergy = clamp(updatedSynergy + 0.5, 1.0, 3.5);
      } else if (yearsSince >= 7 && !isBreakout && !isPrestigeHit) {
        updatedLoyalty = clamp(updatedLoyalty - 15, 0, 100);
      }

      if (yearsSince >= 15 && (isBreakout || isPrestigeHit)) {
        updatedSynergy = clamp(updatedSynergy + 0.75, 1.0, 3.5);
      }

      if (yearsSince >= 5 && !isBreakout && !isPrestigeHit && project.revenue < project.budget) {
        updatedLoyalty = clamp(updatedLoyalty - 25, 0, 100);
      }

      let updatedRelevance = hub.relevanceScore;
      if (!isBreakout && !isPrestigeHit && project.revenue < project.budget) {
        updatedRelevance = clamp(updatedRelevance - 10, 0, 100);
      } else if (isBreakout || isPrestigeHit) {
        updatedRelevance = clamp(updatedRelevance + 10, 0, 100);
      }

      if (hub.activeProjectIds.length >= 5) {
        updatedRelevance = clamp(updatedRelevance - 15, 0, 100);
      }

      const updatedTotalEquity = calculateFranchiseEquity(
        { ...hub, synergyMultiplier: updatedSynergy, relevanceScore: updatedRelevance },
        relevantAssets,
        state.entities.projects
      );

      impacts.push({
        type: 'FRANCHISE_UPDATED',
        payload: {
          franchiseId,
          update: {
            assetIds: nextAssetIds,
            lastReleaseWeeks: [...hub.lastReleaseWeeks, project.releaseWeek || state.week],
            audienceLoyalty: updatedLoyalty,
            synergyMultiplier: updatedSynergy,
            relevanceScore: updatedRelevance,
            totalEquity: updatedTotalEquity
          }
        }
      });
    }
  }

  return impacts;
}
