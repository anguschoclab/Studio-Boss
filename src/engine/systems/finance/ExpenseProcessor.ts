import { Project } from '../../types';

/**
 * ExpenseProcessor handles all loss-related calculations for the studio.
 */
export class ExpenseProcessor {
  /**
   * Calculates studio burn based on studio level and the number of active projects.
   * Non-linear scaling for late-game challenge.
   */
  static calculateStudioBurn(level: number, activeProjectsCount: number): number {
    const baseRent = 500000; // $500k base weekly overhead
    
    // Non-linear scaling: Base * (1.25 ^ (Level-1))
    const levelScale = Math.pow(1.25, Math.max(0, level - 1));
    const projectPenalty = 75000; // $75k penalty per active project
    
    const burn = (baseRent * levelScale) + (activeProjectsCount * projectPenalty);
    return Math.round(burn);
  }

  /**
   * Calculates weekly interest penalty for negative cash balances.
   */
  static calculateDebtInterest(cash: number, debtRate: number): number {
    if (cash >= 0) return 0;
    
    // Weekly interest = (Balance * AnnualRate) / 52
    const weeklyRate = debtRate / 52;
    return Math.abs(Math.round(cash * weeklyRate));
  }

  /**
   * Calculates weekly interest yield for positive cash balances.
   */
  static calculateSavingsYield(cash: number, savingsYield: number): number {
    if (cash <= 0) return 0;
    
    // Weekly yield = (Balance * AnnualRate) / 52
    const weeklyRate = savingsYield / 52;
    return Math.round(cash * weeklyRate);
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
