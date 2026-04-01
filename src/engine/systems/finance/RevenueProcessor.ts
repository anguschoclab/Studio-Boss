import { Project, Buyer } from '../../types';

/**
 * RevenueProcessor handles all income-related calculations for the studio.
 */
export class RevenueProcessor {
  /**
   * Calculates weekly streaming revenue for a project on a specific platform.
   * Expected: Weekly Licensing Fee = $20,000 (at 100 quality, 10% market share).
   */
  static calculateStreamingRevenue(project: Project, platform: Buyer): number {
    const quality = project.reviewScore || 50;
    const marketShare = platform.marketShare || 0.10;
    
    // Base fee is $2,000 per 1% market share at 100 quality
    const baseFeePerUnit = 2000; 
    const shareUnits = marketShare * 100;
    
    const revenue = baseFeePerUnit * shareUnits * (quality / 100);
    return Math.round(revenue);
  }

  /**
   * Calculates box office decay for a project in a given week.
   */
  static calculateTheatricalDecay(currentRevenue: number, decayRate: number): number {
    return Math.round(currentRevenue * decayRate);
  }

  /**
   * Calculates passive merchandise revenue based on hype and franchise strength.
   */
  static calculateMerchRevenue(hype: number, franchiseRelevance: number): number {
    if (hype < 70) return 0;
    
    // Revenue scales with hype and franchise relevance
    const base = 5000;
    const hypeFactor = (hype - 70) / 30; // 0 to 1
    const relevanceFactor = franchiseRelevance / 100; // 0 to 1
    
    const revenue = base + (base * 5 * hypeFactor * relevanceFactor);
    return Math.round(revenue);
  }
}
