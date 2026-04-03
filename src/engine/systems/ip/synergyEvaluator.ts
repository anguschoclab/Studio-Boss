import { Franchise, IPAsset } from '../../types';

/**
 * Synergy Logic Engine.
 * Calculates cross-platform "Halo Effects" and Brand Momentum.
 */

export interface SynergyGains {
  buzzBonus: number;
  revenueMultiplier: number;
  ratingBonus: number;
}

/**
 * Calculates the buzz/revenue/rating bonus for a project based on its Shared Universe footprint.
 * Real-world: Marvel movies boosting Disney+ viewership, or Star Trek TV leading to blockbuster films.
 */
export function calculateSynergyGains(
  franchise: Franchise,
  projectType: 'FILM' | 'SERIES',
  relatedVaultAssets: IPAsset[] // All IPAssets belonging to this franchise
): SynergyGains {
  const gains: SynergyGains = { 
    buzzBonus: 0, 
    revenueMultiplier: 1.0, 
    ratingBonus: 0 
  };
  
  // 1. Film -> TV "The Halo Effect" (2026 Perspective)
  // Releasing a theatrical film provides a massive viewership spike to related TV catalog and active series.
  const hasActiveTheatricalRun = franchise.activeProjectIds.some(id => id.includes('film')); // Simplified check for demonstration
  
  if (projectType === 'SERIES') {
    if (hasActiveTheatricalRun) {
      gains.ratingBonus += 15; // +15 rating points for related TV shows airing alongside a movie
      gains.revenueMultiplier += 0.25; // +25% revenue multiplier for TV merch/syndication
    }
    
    // Total catalog bonus
    const filmAssetCount = relatedVaultAssets.filter(a => a.id.includes('film')).length;
    if (filmAssetCount >= 3) {
      gains.revenueMultiplier += 0.15; // Long-term "Cinematic Universe" prestige bonus for the TV show
    }
  }

  // 2. TV -> Film "The Built-in Audience"
  // Having a successful, syndicated TV show provides a guaranteed buzz floor for a Film launch.
  if (projectType === 'FILM') {
    const syndicatedTV = relatedVaultAssets.filter(a => a.syndicationStatus === 'SYNDICATED');
    
    if (syndicatedTV.length > 0) {
      // Find the best tier in the TV library
      const tiers = syndicatedTV.map(a => a.syndicationTier);
      if (tiers.includes('GOLD')) gains.buzzBonus += 30; // Global phenomenon baseline
      else if (tiers.includes('SILVER')) gains.buzzBonus += 20; // Strong fan loyalty
      else if (tiers.includes('BRONZE')) gains.buzzBonus += 10; // Niche but stable
    }
  }

  // 3. Multi-Format Bonus
  // Brands that span ALL media types receive a "Cultural Ubiquity" multiplier.
  const hasFilm = relatedVaultAssets.some(a => a.id.includes('film'));
  const hasTV = relatedVaultAssets.some(a => a.syndicationStatus === 'SYNDICATED');
  
  if (hasFilm && hasTV) {
    gains.revenueMultiplier += 0.15; // +15% total franchise equity boost
  }

  return gains;
}

/**
 * Phase 7: Vault Synergy Detection.
 * Scans active projects to identify which vault assets are currently being 'Rebooted' or 'Expanded'.
 * This sets the 'isSynergyActive' flag on IPAssets, which freezes their cultural decay.
 */
export function evaluateVaultSynergy(
  activeProjects: import('../../types').Project[],
  vault: IPAsset[]
): IPAsset[] {
  const activeOriginalProjectIds = new Set(activeProjects.map(p => p.originalProjectId).filter(Boolean));
  
  return vault.map(asset => ({
    ...asset,
    isSynergyActive: activeOriginalProjectIds.has(asset.originalProjectId)
  }));
}
