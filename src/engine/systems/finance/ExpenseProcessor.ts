import { Project } from '../../types';

/**
 * ExpenseProcessor handles all loss-related calculations for the studio.
 */
export class ExpenseProcessor {
  /**
   * Calculates studio burn based on studio level and the number of active projects.
   */
  static calculateStudioBurn(level: number, activeProjectsCount: number): number {
    const baseRent = 500000; // $500k base weekly overhead
    const levelMultiplier = 250000; // $250k increase per level
    const projectPenalty = 50000; // $50k penalty per active project
    
    // Formula: BaseRent + (Level * Multiplier) + (ActiveProjects * Penalty)
    const burn = baseRent + (level * levelMultiplier) + (activeProjectsCount * projectPenalty);
    return Math.round(burn);
  }

  /**
   * Calculates weekly marketing burn from active projects in the marketing phase.
   */
  static calculateMarketingBurn(projects: Project[]): number {
    let totalBurn = 0;
    
    projects.forEach((p) => {
      if (p.state === 'marketing' && p.marketingBudget) {
        // Marketing budget is usually spent over 4-8 weeks
        // Weekly burn is a fraction of the total budget
        const weeklyMarketingBurn = p.marketingBudget / 6; 
        totalBurn += weeklyMarketingBurn;
      }
    });

    return Math.round(totalBurn);
  }

  /**
   * Calculates production costs for projects in production.
   */
  static calculateProductionBurn(projects: Project[]): number {
    let totalBurn = 0;
    
    projects.forEach((p) => {
      if (p.state === 'production') {
        totalBurn += p.weeklyCost;
      }
    });

    return Math.round(totalBurn);
  }
}
