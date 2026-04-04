import { Project, Buyer, Contract } from '../../types';
import { ProjectRating } from '../../types/project.types';
import { IPAsset } from '../../types/state.types';
import { calculateWeeklyIPRevenue } from '../ip/merchandisingEngine';
import { getRatingEconomics } from '../ratings';

/**
 * RevenueProcessor handles all income-related calculations for the studio.
 */
export class RevenueProcessor {
  /**
   * Calculates total active revenue and recoupment for all studio projects.
   */
  static calculateActiveRevenue(
    projects: Project[],
    state: import('../../types').GameState
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
        // 2.2: Talent Draw & Prestige Multiplier
        const talentMultiplier = this.calculateTalentRevenueMultiplier(p, state);
        let weeklyGross = 0;
        
        if (p.distributionStatus === 'theatrical') {
          weeklyGross = this.calculateTheatricalDecay(p.weeklyRevenue || 0, 0.35) * talentMultiplier; // The Studio Comptroller: Steeper base decay (0.40 -> 0.35) for front-loaded drops.
          boxOffice += weeklyGross;
        } else if (p.distributionStatus === 'streaming') {
          const platform = p.buyerId ? buyersMap.get(p.buyerId) : undefined;
          if (platform) {
            weeklyGross = this.calculateStreamingRevenue(p, platform) * talentMultiplier;
            distribution += weeklyGross;
          }
        }
        
        const franchise = p.franchiseId ? state.ip.franchises[p.franchiseId] : null;
        const weeklyMerch = this.calculateMerchRevenue(p.buzz, franchise?.relevanceScore || 0, p.rating ?? 'PG-13');
        merch += weeklyMerch;

        totalRoyalties += this.calculateNetPointsRoyalty(p, weeklyGross + weeklyMerch, state.studio.internal.contracts);
      }
    });

    return { boxOffice, distribution, merch, totalRoyalties, projectRecoupment };
  }

  /**
   * Stage 2.2: Calculates a revenue multiplier based on the collective 'Draw' and 'Prestige' 
   * of attached talent. High-value stars act as a force multiplier for box office.
   */
  static calculateTalentRevenueMultiplier(project: Project, state: import('../../types').GameState): number {
    const contracts = state.studio.internal.contracts;
    let totalBonus = 0;
    let hasContract = false;

    for (let i = 0; i < contracts.length; i++) {
      const contract = contracts[i];
      if (contract.projectId === project.id) {
        hasContract = true;
        const talent = state.industry.talentPool[contract.talentId];
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
      revenue = Math.max(revenue * 1.8, 200000); // The Studio Comptroller: Buffed cult classics (150000 -> 200000) to create dramatic financial anomalies.
    }
    return revenue;
  }

  /**
   * Calculates passive merchandise revenue based on hype, franchise strength, and rating.
   * G/PG-rated projects earn a merch bonus; R/NC-17/Unrated earn far less.
   */
  static calculateMerchRevenue(hype: number, franchiseRelevance: number, rating: ProjectRating = 'PG-13'): number {
    if (rating === 'Unrated') return 0; // Unrated releases cannot merchandise
    if (hype < 70) return 0;
    const base = 5000;
    const hypeFactor = (hype - 70) / 30;
    const relevanceFactor = franchiseRelevance / 100;
    const baseRevenue = Math.round(base + (base * 5 * hypeFactor * relevanceFactor));
    const merchMultiplier = getRatingEconomics(rating).merchMultiplier;
    return Math.round(baseRevenue * merchMultiplier);
  }

  /**
   * Calculates passive revenue generated by the archived IP vault.
   */
  static calculateVaultDividends(vault: IPAsset[]): number {
    if (vault.length === 0) return 0;
    let total = 0;
    for (let i = 0; i < vault.length; i++) {
      total += calculateWeeklyIPRevenue(vault[i]);
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
}
