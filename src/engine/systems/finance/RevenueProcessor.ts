import { Project, Buyer, Contract, GameState } from '../../types';
import { ProjectRating } from '../../types/project.types';
import { IPAsset } from '../../types/state.types';
import { calculateWeeklyIPRevenue } from '../ip/merchandisingEngine';
import { getRatingEconomics } from '../ratings';
import { calculateAudienceIndex } from '../demographics';
import { StreamingViewershipTracker } from '../production/StreamingViewershipTracker';
import { RandomGenerator } from '../../utils/rng';

/**
 * RevenueProcessor handles all income-related calculations for the studio.
 */
export class RevenueProcessor {
  /**
   * Calculates total active revenue and recoupment for all studio projects.
   */
  static calculateActiveRevenue(
    projects: Project[],
    state: GameState,
    contracts: Contract[],
    vault: IPAsset[],
    studioId: string
  ): {
    boxOffice: number;
    distribution: number;
    merch: number;
    totalRoyalties: number;
    projectRecoupment: Record<string, number>;
  } {
    let boxOffice = 0;
    let distribution = 0;
    let merch = 0;
    let totalRoyalties = 0;
    const projectRecoupment: Record<string, number> = {};

    // ⚡ Bolt: Precompute buyers map to avoid O(N) lookup per project during iteration.
    const buyersMap = new Map<string, Buyer>();
    state.market.buyers.forEach(b => buyersMap.set(b.id, b));

    projects.forEach(p => {
      const totalCost = p.budget + (p.marketingBudget || 0);
      if (totalCost > 0) {
        projectRecoupment[p.id] = Math.min(100, Math.floor((p.revenue / totalCost) * 100));
      }

      if (p.state === 'released') {
        const talentMultiplier = this.calculateTalentRevenueMultiplier(p, state, contracts);
        const target = p.targetDemographic || 'four_quadrant';
        const demographicMultiplier = calculateAudienceIndex(p, target);
        let weeklyGross = 0;
        
        let banMultiplier = 1.0;
        if (p.regionalRatings) {
            const banCount = p.regionalRatings.filter(r => r.isBanned).length;
            if (banCount > 0) banMultiplier = Math.max(0.2, 1.0 - (banCount * 0.15));
        }

        if (p.distributionStatus === 'theatrical') {
          // The Studio Comptroller: Base theatrical decay rate lowered from 0.18 to 0.15 representing an incredibly ruthless front-loaded drop for modern box office.
          weeklyGross = this.calculateTheatricalDecay(p.weeklyRevenue || 0, 0.15, p.isCultClassic) * talentMultiplier * banMultiplier * demographicMultiplier;
          boxOffice += weeklyGross;
        } else if (p.distributionStatus === 'streaming') {
          const platform = p.buyerId ? buyersMap.get(p.buyerId) : undefined;
          if (platform) {
            weeklyGross = this.calculateStreamingRevenue(p, platform) * talentMultiplier * banMultiplier * demographicMultiplier;
            distribution += weeklyGross;
          }
        }
        
        const franchiseId = p.franchiseId;
        const franchise = franchiseId ? state.ip.franchises[franchiseId] : null;
        const weeklyMerch = this.calculateMerchRevenue(p.buzz, franchise?.relevanceScore || 0, p.rating ?? 'PG-13');
        merch += weeklyMerch;

        if (p.backendPoints && p.backendPoints > 0 && weeklyGross > 0) {
          distribution += Math.round(weeklyGross * (p.backendPoints / 100));
        }

        totalRoyalties += this.calculateNetPointsRoyalty(p, weeklyGross + weeklyMerch, contracts);
      }
    });

    // 🌌 PHASE 2: Backend Streaming (Royalties from Rival Projects)
    const allProjectList = Object.values(state.entities.projects);
    const rivalsList = Object.values(state.entities.rivals || {});
    
    rivalsList.forEach(rival => {
      const rivalProjects = allProjectList.filter(p => p.ownerId === rival.id);
      rivalProjects.forEach((rp) => {
        if (rp.state === 'released') {
          const weeklyGross = (rp.weeklyRevenue || 0);
          if (weeklyGross <= 0) return;

          // Check if any player contract is on this project
          contracts.forEach(c => {
            if (c.projectId === rp.id && c.backendPercent > 0) {
              const royalty = Math.round(weeklyGross * (c.backendPercent / 100));
              distribution += royalty; // Streaming into player's distribution bucket
            }
          });
        }
      });
    });

    return { boxOffice, distribution, merch, totalRoyalties, projectRecoupment };
  }

  /**
   * Stage 2.2: Calculates a revenue multiplier based on the collective 'Draw' and 'Prestige' 
   * of attached talent. High-value stars act as a force multiplier for box office.
   */
  static calculateTalentRevenueMultiplier(project: Project, state: GameState, contracts: Contract[]): number {
    let totalBonus = 0;
    let hasContract = false;

    for (let i = 0; i < contracts.length; i++) {
      const contract = contracts[i];
      if (contract.projectId === project.id) {
        hasContract = true;
        const talent = state.entities.talents[contract.talentId];
        if (talent) {
          // Draw contribution: 100 draw = +0.25 bonus
          const drawBonus = (talent.draw - 50) * 0.005;
          // Prestige contribution: 100 prestige = +0.10 bonus
          const prestigeBonus = (talent.prestige - 50) * 0.002;
          totalBonus += (drawBonus + prestigeBonus);
        }
      }
    }

    if (!hasContract) return 1.0;

    // Clamp multiplier between 0.5x and 2.5x
    return Math.min(2.5, Math.max(0.5, 1.0 + totalBonus));
  }

  /**
   * Calculates weekly streaming revenue for a project on a specific platform.
   * Applies a streaming premium for adult/specialty ratings (TV-MA, NC-17, Unrated).
   */
  static calculateStreamingRevenue(project: Project, platform: Buyer): number {
    const quality = project.reviewScore || 50;
    const marketShare = platform.marketShare || 0.10;
    const baseFeePerUnit = 2000;
    const shareUnits = marketShare * 100;
    const baseRevenue = Math.round(baseFeePerUnit * shareUnits * (quality / 100));
    const streamingPremium = getRatingEconomics(project.rating ?? 'PG-13').streamingPremium;
    return Math.round(baseRevenue * (1 + streamingPremium));
  }

  /**
   * Calculates box office decay for a project in a given week.
   */
  static calculateTheatricalDecay(currentRevenue: number, decayRate: number, isCultClassic: boolean = false): number {
    let revenue = Math.round(currentRevenue * decayRate);
    if (isCultClassic) {
      // The Studio Comptroller: Modified cult classic bump to prevent flat minimums and enforce long-tail decay instead
      revenue = Math.max(revenue * 2.0, 100000);
    }
    return revenue;
  }

  /**
   * Calculates passive merchandise revenue based on hype, franchise strength, and rating.
   * G/PG-rated projects earn a merch bonus; R/NC-17/Unrated earn far less.
   */
  static calculateMerchRevenue(hype: number, franchiseRelevance: number, rating: ProjectRating = 'PG-13'): number {
    if (rating === 'Unrated') return 0; // Unrated releases cannot merchandise
    const h = hype || 0;
    const f = franchiseRelevance || 0;
    if (h < 70) return 0;
    const base = 5000;
    const hypeFactor = (h - 70) / 30;
    const relevanceFactor = f / 100;
    const baseRevenue = Math.round(base + (base * 5 * hypeFactor * relevanceFactor));
    const merchMultiplier = getRatingEconomics(rating).merchMultiplier;
    return Math.round(baseRevenue * merchMultiplier);
  }

  /**
   * Calculates passive revenue generated by the archived IP vault.
   */
  static calculateVaultDividends(vault: IPAsset[], studioId?: string): number {
    if (!vault || vault.length === 0) return 0;
    let total = 0;
    for (let i = 0; i < vault.length; i++) {
      const asset = vault[i];
      // Filter by owner if provided (Phase 5 hardening)
      if (studioId && asset.ownerStudioId !== studioId && asset.rightsOwner !== 'STUDIO') continue;
      
      total += calculateWeeklyIPRevenue(asset);
    }
    return total;
  }

  /**
   * Calculates talent royalties (Net Points) for a project.
   */
  static calculateNetPointsRoyalty(project: Project, weeklyRevenue: number, contracts: Contract[]): number {
    const totalCost = project.budget + (project.marketingBudget || 0);
    const totalRevenue = project.revenue || 0;

    if (totalRevenue < totalCost) return 0;

    let totalRoyalty = 0;
    for (let i = 0; i < contracts.length; i++) {
      const contract = contracts[i];
      if (contract.projectId === project.id && contract.backendPercent > 0) {
        let percent = contract.backendPercent / 100;
        if (contract.backendEscalator && totalRevenue > totalCost * 2) {
          percent += 0.05;
        }
        totalRoyalty += weeklyRevenue * percent;
      }
    }

    return Math.round(totalRoyalty);
  }

  /**
   * Calculates streaming revenue from viewership data.
   * Real-world: ~$0.015 per hour watched (varies by platform).
   */
  static calculateStreamingRevenueFromViewership(history: import('../../types/project.types').StreamingViewershipHistory): number {
    const latestEntry = history.entries[history.entries.length - 1];
    const revenuePerHour = 0.015;
    return Math.round(latestEntry.hoursWatched * revenuePerHour);
  }
}
