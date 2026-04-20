import { RivalStudio, Project, GameState } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Calculates rival studio revenue using the same model as the player.
 * Ensures fair comparison in market share calculations.
 */
export class RivalRevenueCalculator {
  /**
   * Calculate weekly revenue for a rival studio.
   * Uses the same RevenueProcessor logic as the player.
   */
  static calculateWeeklyRevenue(
    rival: RivalStudio,
    currentWeek: number,
    rng: RandomGenerator,
    state?: GameState
  ): {
    boxOffice: number;
    streaming: number;
    merch: number;
    total: number;
  } {
    const projects: Project[] = [];
    if (state) {
      const allProjects = state.entities.projects;
      for (const id in allProjects) {
        if (Object.prototype.hasOwnProperty.call(allProjects, id)) {
          const p = allProjects[id];
          if (p.ownerId === rival.id && p.state === 'released') {
            projects.push(p);
          }
        }
      }
    } else {
      // Fallback for isolated tests that don't pass state
      for (const id in rival.projects || {}) {
        if (Object.prototype.hasOwnProperty.call(rival.projects, id)) {
          const p = rival.projects[id];
          if (p.state === 'released') {
            projects.push(p);
          }
        }
      }
    }

    if (projects.length === 0) {
      return { boxOffice: 0, streaming: 0, merch: 0, total: 0 };
    }

    let boxOffice = 0;
    let streaming = 0;
    let merch = 0;
    
    projects.forEach((p) => {
      if (p.distributionStatus === 'theatrical') {
        // Use same decay model as player
        const weeklyGross = this.calculateTheatricalRevenue(p, currentWeek);
        boxOffice += weeklyGross;
      } else if (p.distributionStatus === 'streaming') {
        const weeklyGross = this.calculateStreamingRevenue(p);
        streaming += weeklyGross;
      }
      
      merch += this.calculateMerchRevenue(p);
    });
    
    return {
      boxOffice,
      streaming,
      merch,
      total: boxOffice + streaming + merch
    };
  }
  
  /**
   * Calculate annual revenue totals for a rival.
   */
  static calculateAnnualRevenue(
    rival: RivalStudio,
    currentWeek: number
  ): {
    boxOfficeTotal: number;
    annualRevenue: number;
  } {
    const history = rival.revenueHistory || [];
    
    // Filter to last 52 weeks (1 year) - only include weeks in the past
    const yearHistory = history.filter(h => h.week <= currentWeek && currentWeek - h.week <= 52);
    
    const boxOfficeTotal = yearHistory.reduce((sum, h) => sum + h.boxOffice, 0);
    const annualRevenue = yearHistory.reduce((sum, h) => sum + h.revenue, 0);
    
    return { boxOfficeTotal, annualRevenue };
  }
  
  /**
   * Theatrical revenue using same decay model as RevenueProcessor.
   */
  private static calculateTheatricalRevenue(project: Project, currentWeek: number): number {
    const weeksSinceRelease = currentWeek - (project.releaseWeek || 0);
    if (weeksSinceRelease < 0) return 0;
    
    const openingWeekend = project.boxOffice?.openingWeekendDomestic || 0;
    const reviewScore = project.reception?.metaScore || project.reviewScore || 50;
    
    // Same decay logic as RevenueProcessor.calculateTheatricalDecay
    let decayFactor = 0.28; // Base decay
    if (reviewScore > 80) decayFactor = 0.35; // Leggy
    else if (reviewScore > 60) decayFactor = 0.30;
    else if (reviewScore < 40) decayFactor = 0.20; // Front-loaded
    
    const weeklyGross = openingWeekend * Math.pow(decayFactor, weeksSinceRelease);
    
    // Cult classic boost
    if (project.isCultClassic) {
      return Math.max(weeklyGross * 2.0, 100000);
    }
    
    return Math.max(0, Math.round(weeklyGross));
  }
  
  /**
   * Streaming revenue using same model as RevenueProcessor.
   */
  private static calculateStreamingRevenue(project: Project): number {
    // Use the same formula as RevenueProcessor.calculateStreamingRevenue
    // Since we don't have the Buyer object, we estimate
    const quality = project.reviewScore || 50;
    const baseFeePerUnit = 2000;
    const shareUnits = 10; // Assume 10% market share average for rivals
    const baseRevenue = Math.round(baseFeePerUnit * shareUnits * (quality / 100));
    
    // Rating premium
    const ratingPremium = this.getRatingStreamingPremium(project.rating);
    return Math.round(baseRevenue * (1 + ratingPremium));
  }
  
  private static getRatingStreamingPremium(rating?: string): number {
    if (!rating) return 0;
    const r = rating.toUpperCase();
    if (r === 'TV-MA' || r === 'NC-17' || r === 'UNRATED') return 0.15;
    if (r === 'R') return 0.10;
    return 0;
  }
  
  /**
   * Merchandise revenue using same formula as RevenueProcessor.
   */
  private static calculateMerchRevenue(project: Project): number {
    const hype = project.buzz || 0;
    if (hype < 70) return 0;
    
    const base = 5000;
    const hypeFactor = (hype - 70) / 30;
    const franchiseRelevance = project.franchiseId ? 50 : 0; // Simplified
    const relevanceFactor = franchiseRelevance / 100;
    
    const baseRevenue = Math.round(base + (base * 5 * hypeFactor * relevanceFactor));
    
    // Rating multiplier
    const rating = project.rating || 'PG-13';
    const merchMultiplier = this.getRatingMerchMultiplier(rating);
    
    return Math.round(baseRevenue * merchMultiplier);
  }
  
  private static getRatingMerchMultiplier(rating: string): number {
    const r = rating.toUpperCase();
    if (r === 'UNRATED') return 0;
    if (r === 'G' || r === 'PG') return 1.3;
    if (r === 'PG-13') return 1.0;
    if (r === 'R') return 0.7;
    if (r === 'NC-17') return 0.3;
    return 1.0;
  }
}
