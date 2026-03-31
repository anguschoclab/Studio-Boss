import { GameState, Project, Franchise, IPAsset } from '../../types';
import { advanceProject } from '../projects';
import { calculateInitialIPValue } from '../ip/ipValuation';
import { calculateFranchiseFatigue } from '../ip/fatigueEngine';
import { calculateSynergyGains } from '../ip/synergyEvaluator';
import { updateFranchiseHub } from '../ip/franchiseCoordinator';

/**
 * FILM Orchestrator.
 * Handles the complete lifecycle for Feature Films (Development, Production, Marketing, Release).
 * Now integrates Franchise Synergy (The Halo Effect) and Brand Fatigue.
 */
export function processProduction(state: GameState): GameState {
  let updatedState = { ...state };
  let newVaultAssets: IPAsset[] = [];
  
  const updatedProjects = state.projects.active.map((project: Project) => {
    // 1. Filter out Television projects (handled by processTelevision)
    if (project.type === 'TELEVISION') return project;

    // 2. Franchise Logic Injection
    let synergyMultiplier = 1.0;
    let fatiguePenalty = 0;

    if (project.franchiseId && state.ip.franchises[project.franchiseId]) {
      const franchise = state.ip.franchises[project.franchiseId];
      const relatedAssets = state.ip.vault.filter(a => a.franchiseId === project.franchiseId);
      
      // Calculate Genre Saturation (Market competition)
      const genreSaturation = state.projects.active.filter(p => p.genre === project.genre).length;
      
      // Real-life Logic: Spectacle (Superhero/Sci-Fi) vs Comfort Food (Drama/Comedy)
      const isSpectacle = ['SCI-FI', 'SUPERHERO', 'ACTION', 'FANTASY'].includes(project.genre.toUpperCase());
      const genreType = isSpectacle ? 'spectacle' : 'comfort_food';

      fatiguePenalty = calculateFranchiseFatigue(franchise, genreSaturation, genreType);
      const synergy = calculateSynergyGains(franchise, 'FILM', relatedAssets);
      synergyMultiplier = synergy.revenueMultiplier;
    }

    // 3. Advance the project
    const result = advanceProject(
      project,
      state.game.currentWeek,
      state.studio.prestige,
      state.studio.internal.contracts,
      new Map(Object.entries(state.industry.talentPool)),
      50, // Average rival strength
      [], // No awards yet in this phase
      1.0, // Trend multiplier
      synergyMultiplier,
      fatiguePenalty
    );

    // 4. Conversion to IP Vault on Archival
    if (result.project.state === 'archived' && project.state !== 'archived') {
      const ipAsset = calculateInitialIPValue(result.project);
      newVaultAssets.push(ipAsset);
      
      // Update Franchise Hub (Linking new assets)
      updatedState = updateFranchiseHub(updatedState, result.project);
    }

    return result.project;
  });

  // Filter out archived projects from the active list
  const activeProjects = updatedProjects.filter(p => p.state !== 'archived');

  return { 
    ...updatedState, 
    projects: { 
      ...updatedState.projects, 
      active: activeProjects 
    },
    ip: {
      ...updatedState.ip,
      vault: [...updatedState.ip.vault, ...newVaultAssets]
    }
  };
}
