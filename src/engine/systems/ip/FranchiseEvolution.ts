import { GameState, Project, Franchise, StateImpact } from '../../types';
import { RandomGenerator } from '../../utils/rng';
import { clamp } from '../../utils';

/**
 * Identifies projects released in the current simulation week and triggers franchise evolution.
 */
export function calculateFranchiseEvolutionImpacts(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  const projects = Object.values(state.entities.projects);
  
  projects.forEach(project => {
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
          audienceLoyalty: isBreakout ? 65 : 50,
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

        impacts.push({
          type: 'PROJECT_UPDATED',
          payload: { projectId: project.id, update: { franchiseId } }
        });

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
          
          let updatedLoyalty = hub.audienceLoyalty;
          if (hub.activeProjectIds.length >= 3) {
            updatedLoyalty = clamp(updatedLoyalty - 5, 0, 100);
          }

          let newSynergy = hub.synergyMultiplier + 0.15;
          if (!isBreakout && !isPrestigeHit && project.revenue < project.budget) {
            newSynergy = hub.synergyMultiplier - 0.10;
          }

          impacts.push({
            type: 'FRANCHISE_UPDATED',
            payload: {
              franchiseId,
              update: {
                assetIds: nextAssetIds,
                lastReleaseWeeks: nextReleaseWeeks,
                audienceLoyalty: updatedLoyalty,
                synergyMultiplier: clamp(newSynergy, 1.0, 3.0),
                relevanceScore: clamp(
                  hub.relevanceScore - (hub.activeProjectIds.length >= 5 ? 15 : 0),
                  0,
                  100
                )
              }
            }
          });

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
