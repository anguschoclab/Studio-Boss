import { RivalStudio, Project, GameState } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

const RATING_STREAMING_PREMIUMS: Record<string, number> = {
  'TV-MA': 0.15,
  'NC-17': 0.15,
  'UNRATED': 0.15,
  'R': 0.10
};

const RATING_MERCH_MULTIPLIERS: Record<string, number> = {
  'UNRATED': 0,
  'G': 1.3,
  'PG': 1.3,
  'PG-13': 1.0,
  'R': 0.7,
  'NC-17': 0.3
};

/**
 * Calculates rival studio revenue using the same model as the player.
 * Ensures fair comparison in market share calculations.
 */
export const RivalRevenueCalculator = {
  /**
   * Calculate weekly revenue for a rival studio.
   */
  calculateWeeklyRevenue(
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
    if (!state) return { boxOffice: 0, streaming: 0, merch: 0, total: 0 };

    const projects: Project[] = [];
    const allProjects = state.entities.projects;
    for (const id in allProjects) {
      if (Object.prototype.hasOwnProperty.call(allProjects, id)) {
        const p = allProjects[id];
        if (p.ownerId === rival.id && p.state === 'released') {
          projects.push(p);
        }
      }
    }

    if (projects.length === 0) return { boxOffice: 0, streaming: 0, merch: 0, total: 0 };

    let boxOffice = 0;
    let streaming = 0;
    let merch = 0;
    
    projects.forEach((p) => {
      if (p.distributionStatus === 'theatrical') {
        boxOffice += this.calculateTheatricalRevenue(p, currentWeek);
      } else if (p.distributionStatus === 'streaming') {
        streaming += this.calculateStreamingRevenue(p);
      }
      merch += this.calculateMerchRevenue(p);
    });
    
    return { boxOffice, streaming, merch, total: boxOffice + streaming + merch };
  },
  
  calculateAnnualRevenue(rival: RivalStudio, currentWeek: number) {
    const history = rival.revenueHistory || [];
    const yearHistory = history.filter(h => h.week <= currentWeek && currentWeek - h.week <= 52);
    const boxOfficeTotal = yearHistory.reduce((sum, h) => sum + h.boxOffice, 0);
    const annualRevenue = yearHistory.reduce((sum, h) => sum + h.revenue, 0);
    return { boxOfficeTotal, annualRevenue };
  },
  
  calculateTheatricalRevenue(project: Project, currentWeek: number): number {
    const weeksSinceRelease = currentWeek - (project.releaseWeek || 0);
    if (weeksSinceRelease < 0) return 0;
    
    const openingWeekend = project.boxOffice?.openingWeekendDomestic || 0;
    const reviewScore = project.reception?.metaScore || project.reviewScore || 50;
    
    let decayFactor = 0.28;
    if (reviewScore > 80) decayFactor = 0.35;
    else if (reviewScore > 60) decayFactor = 0.30;
    else if (reviewScore < 40) decayFactor = 0.20;
    
    const weeklyGross = openingWeekend * Math.pow(decayFactor, weeksSinceRelease);
    if (project.isCultClassic) return Math.max(weeklyGross * 2.0, 100000);
    return Math.max(0, Math.round(weeklyGross));
  },
  
  calculateStreamingRevenue(project: Project): number {
    const quality = project.reviewScore || 50;
    const baseFeePerUnit = 2000;
    const shareUnits = 10; 
    const baseRevenue = Math.round(baseFeePerUnit * shareUnits * (quality / 100));
    const ratingPremium = this.getRatingStreamingPremium(project.rating);
    return Math.round(baseRevenue * (1 + ratingPremium));
  },
  
  getRatingStreamingPremium(rating?: string): number {
    if (!rating) return 0;
    const r = rating.toUpperCase();
    return RATING_STREAMING_PREMIUMS[r] || 0;
  },
  
  calculateMerchRevenue(project: Project): number {
    const hype = project.buzz || 0;
    if (hype < 70) return 0;
    
    const base = 5000;
    const hypeFactor = (hype - 70) / 30;
    const franchiseRelevance = project.franchiseId ? 50 : 0;
    const relevanceFactor = franchiseRelevance / 100;
    
    const baseRevenue = Math.round(base + (base * 5 * hypeFactor * relevanceFactor));
    const rating = project.rating || 'PG-13';
    const merchMultiplier = this.getRatingMerchMultiplier(rating);
    
    return Math.round(baseRevenue * merchMultiplier);
  },
  
  getRatingMerchMultiplier(rating: string): number {
    const r = rating.toUpperCase();
    return RATING_MERCH_MULTIPLIERS[r] || 1.0;
  }
};
