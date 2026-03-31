import { GameState, Project, IPAsset } from '../../types';
import { calculateWeeklyRating } from '../television/ratingsEvaluator';
import { evaluateRenewal } from '../television/renewalEngine';
import { calculateInitialIPValue } from '../ip/ipValuation';
import { determineSyndicationTier } from '../ip/syndicationEngine';

/**
 * TV & Unscripted Coordinator.
 * Handles episodic airing loops, ratings, and renewal mechanics.
 * Surgically updated to support Tiered Syndication and IP Upgrades for reboots.
 */
export function processTelevision(state: GameState): GameState {
  let newVaultAssets: IPAsset[] = [];
  let assetUpdates: Record<string, Partial<IPAsset>> = {};

  const updatedProjects = state.projects.active.map((project: Project) => {
    // 1. Filter: Only process Television projects
    if (project.type !== 'TELEVISION' || !project.tvDetails) return project;

    // 2. Only process shows actively airing
    if (project.tvDetails.status !== 'ON_AIR') return project;

    // 3. Calculate weekly ratings
    const newRating = calculateWeeklyRating(project, project.buzz);
    
    // 4. Update episodic counts
    const aired = (project.tvDetails.episodesAired || 0) + 1;
    let nextStatus = project.tvDetails.status as string; 
    
    // 5. Rolling average calculation
    const totalRatingSum = (project.tvDetails.averageRating * (project.tvDetails.episodesAired || 0)) + newRating;
    const nextAverageRating = Math.round((totalRatingSum / aired) * 10) / 10;
    
    // 6. Handle "IP Upgrade" logic (Reboots contributing to total library count)
    if (project.parentProjectId) {
        const parentAsset = state.ip.vault.find(a => a.originalProjectId === project.parentProjectId);
        if (parentAsset) {
            const newTotal = (parentAsset.totalEpisodes || 0) + 1;
            const newTier = determineSyndicationTier(newTotal, project.genre);
            assetUpdates[parentAsset.id] = {
                totalEpisodes: newTotal,
                syndicationTier: newTier,
                syndicationStatus: newTier !== 'NONE' ? 'SYNDICATED' : 'NONE'
            };
        }
    }
    
    // 7. Handle end-of-season logic
    if (aired >= project.tvDetails.episodesOrdered) {
        nextStatus = evaluateRenewal(project, nextAverageRating);
        
        // If Cancelled, it immediately moves to 'archived' state for Vault conversion
        if (nextStatus === 'CANCELLED') {
            const ipAsset = calculateInitialIPValue({ ...project, revenue: project.revenue || 0 });
            newVaultAssets.push(ipAsset);
        }
    }

    return { 
      ...project, 
      tvDetails: { 
        ...project.tvDetails, 
        episodesAired: aired, 
        averageRating: nextAverageRating, 
        status: nextStatus as any 
      } 
    };
  });

  // Apply Asset Updates to the Vault
  const finalVault = state.ip.vault.map(asset => {
    if (assetUpdates[asset.id]) {
        return { ...asset, ...assetUpdates[asset.id] };
    }
    return asset;
  });

  // Filter out Cancelled (Archived) TV shows from active list
  const activeProjects = updatedProjects.filter(p => !p.tvDetails || (p.tvDetails.status as string) !== 'CANCELLED');

  return { 
    ...state, 
    projects: { 
      ...state.projects, 
      active: activeProjects 
    },
    ip: {
      ...state.ip,
      vault: [...finalVault, ...newVaultAssets]
    }
  };
}
