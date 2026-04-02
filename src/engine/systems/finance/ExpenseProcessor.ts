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
    const baseRent = 750000; // $750k base weekly overhead (500k base + 250k level-1 fixed)
    
    // Non-linear scaling: Base * (1.25 ^ (Level-1))
    const levelScale = Math.pow(1.25, Math.max(0, level - 1));
    const projectPenalty = 50000; // $50k penalty per active project
    
    const burn = (baseRent * levelScale) + (activeProjectsCount * projectPenalty);
    return Math.round(burn);
  }

  /**
   * Calculates the 'Credit Spread' (risk premium) based on studio prestige.
   * Prestige 100 = 0% spread (Prime). Prestige 0 = 10% spread (Subprime).
   */
  static calculateCreditSpread(prestige: number): number {
    return (100 - Math.min(100, Math.max(0, prestige))) / 1000; // 0 to 0.10
  }

  /**
   * Calculates weekly interest penalty for negative cash balances.
   * Includes a risk premium based on the studio's reputation.
   */
  static calculateDebtInterest(cash: number, debtRate: number, prestige: number = 70): number {
    if (cash >= 0) return 0;
    
    const riskPremium = this.calculateCreditSpread(prestige);
    const effectiveAnnualRate = debtRate + riskPremium;
    
    // Weekly interest = (Balance * EffectiveRate) / 52
    const weeklyRate = effectiveAnnualRate / 52;
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

  /**
   * Calculates total consolidated expenses for the studio.
   */
  static calculateConsolidatedExpenses(
    projects: Project[],
    state: import('../../types').GameState,
    market: import('../../types/state.types').MarketState
  ): {
    production: number;
    marketing: number;
    overhead: number;
    interest: number;
  } {
    const studioLevel = 1;
    const production = this.calculateProductionBurn(projects);
    const marketing = this.calculateMarketingBurn(projects);
    const overhead = this.calculateStudioBurn(studioLevel, projects.filter(p => p.state !== 'released').length);

    const isDebt = state.finance.cash < 0;
    const interest = isDebt 
      ? this.calculateDebtInterest(state.finance.cash, market.debtRate, state.studio.prestige)
      : -this.calculateSavingsYield(state.finance.cash, market.savingsYield);

    return { production, marketing, overhead, interest };
  }
}
