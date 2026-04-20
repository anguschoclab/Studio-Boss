import { Project, GameState, TalentPact } from '@/engine/types';

/**
 * ExpenseProcessor handles all loss-related calculations for the studio.
 */
export const ExpenseProcessor = {
  /**
   * Calculates studio burn based on studio level and the number of active projects.
   */
  calculateStudioBurn(level: number, activeProjectsCount: number): number {
    // The Studio Comptroller: Increased base rent to 2M, project penalty to 600k, and level scale to 1.8 to mathematically crush passive studio empires.
    const baseRent = 2000000;
    const levelScale = Math.pow(1.8, Math.max(0, level - 1));
    const projectPenalty = activeProjectsCount * 600000;
    return Math.round(baseRent * levelScale + projectPenalty);
  },

  /**
   * Calculates the 'Credit Spread'.
   */
  calculateCreditSpread(prestige: number, awards: import('../../types').Award[] = []): number {
    let spread = (100 - Math.min(100, Math.max(0, prestige))) / 1000;
    const oscarWins = (awards || []).filter(a => a.body === 'Academy Awards' && a.category === 'Best Picture' && a.status === 'won').length;
    spread -= Math.min(0.03, oscarWins * 0.01);
    return Math.max(0.01, spread);
  },

  /**
   * Calculates weekly interest penalty for negative balances.
   */
  calculateDebtInterest(cash: number, debtRate: number, prestige: number = 70, awards: import('../../types').Award[] = []): number {
    if (cash >= 0) return 0;
    const riskPremium = this.calculateCreditSpread(prestige, awards);
    const effectiveAnnualRate = debtRate + riskPremium;
    const weeklyRate = effectiveAnnualRate / 52;
    return Math.round(Math.abs(cash) * weeklyRate);
  },

  /**
   * Calculates weekly interest yield for positive balances.
   */
  calculateSavingsYield(cash: number, savingsYield: number): number {
    if (cash <= 0) return 0;
    const weeklyRate = savingsYield / 52;
    return Math.round(cash * weeklyRate);
  },

  /**
   * Calculates weekly marketing burn.
   */
  calculateMarketingBurn(projects: Project[]): number {
    let totalBurn = 0;
    projects.forEach((p) => {
      if (p.state === 'marketing' && p.marketingBudget) {
        totalBurn += p.marketingBudget / 4; // Marketing spans 4 weeks
      }
    });
    return Math.round(totalBurn);
  },

  /**
   * Calculates production costs.
   * Phase 2: TV projects use fractional burn (budget / episodes).
   */
  calculateProductionBurn(projects: Project[]): number {
    let totalBurn = 0;
    projects.forEach((p) => {
      if (p.state === 'production') {
        const episodeCount = (p as any).episodeCount || 1;
        totalBurn += p.budget / episodeCount;
      }
    });
    return Math.round(totalBurn);
  },

  /**
   * Calculates weekly overhead for TalentPacts.
   */
  calculatePactOverhead(pacts: TalentPact[]): number {
    return (pacts || []).reduce((total, pact) => total + (pact.weeklyOverhead || 0), 0);
  },

  /**
   * Calculates total consolidated expenses for the studio.
   */
  calculateConsolidatedExpenses(
    projects: Project[],
    state: GameState,
    market: import('../../types/state.types').MarketState,
    studioArchetype: string,
    studioCash: number,
    studioPrestige: number,
    pacts: TalentPact[]
  ): {
    production: number;
    marketing: number;
    overhead: number;
    interest: number;
    pacts: number;
  } {
    const activeProjects = projects.filter(p => p.state === 'production' || p.state === 'marketing');
    const production = this.calculateProductionBurn(activeProjects);
    const marketing = this.calculateMarketingBurn(activeProjects);
    const interest = this.calculateDebtInterest(studioCash, market.debtRate, studioPrestige);
    const overhead = this.calculateStudioBurn(state.studio.level, activeProjects.length);
    const pactsBurn = this.calculatePactOverhead(pacts);

    return { production, marketing, overhead, interest, pacts: pactsBurn };
  }
};
