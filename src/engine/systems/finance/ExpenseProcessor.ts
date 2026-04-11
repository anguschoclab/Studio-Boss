import { Project, GameState, TalentPact } from '../../types';

/**
 * ExpenseProcessor handles all loss-related calculations for the studio.
 */
export class ExpenseProcessor {
  /**
   * Calculates studio burn based on studio level and the number of active projects.
   */
  static calculateStudioBurn(level: number, activeProjectsCount: number): number {
    // The Studio Comptroller: Increased base rent (1.5M -> 2.0M), project penalty (400k -> 500k), and levelScale base (1.6 -> 1.8) to aggressively drain passive empires.
    const baseRent = 2000000;
    const levelScale = Math.pow(1.8, Math.max(0, level - 1));
    const projectPenalty = 500000;
    const burn = (baseRent * levelScale) + (activeProjectsCount * projectPenalty);
    return Math.round(burn);
  }

  /**
   * Calculates the 'Credit Spread'.
   */
  static calculateCreditSpread(prestige: number, awards: import('../../types').Award[] = []): number {
    let spread = (100 - Math.min(100, Math.max(0, prestige))) / 1000;
    const oscarWins = (awards || []).filter(a => a.body === 'Academy Awards' && a.category === 'Best Picture' && a.status === 'won').length;
    spread -= Math.min(0.03, oscarWins * 0.01);
    const razzieWins = (awards || []).filter(a => a.body === 'The Razzies' && a.status === 'won').length;
    spread += (razzieWins * 0.005);
    return Math.max(0, spread);
  }

  /**
   * Calculates weekly interest penalty for negative balances.
   */
  static calculateDebtInterest(cash: number, debtRate: number, prestige: number = 70, awards: import('../../types').Award[] = []): number {
    if (cash >= 0) return 0;
    const riskPremium = this.calculateCreditSpread(prestige, awards);
    const effectiveAnnualRate = debtRate + riskPremium;
    const weeklyRate = effectiveAnnualRate / 52;
    return Math.abs(Math.round(cash * weeklyRate));
  }

  /**
   * Calculates weekly interest yield for positive balances.
   */
  static calculateSavingsYield(cash: number, savingsYield: number): number {
    if (cash <= 0) return 0;
    const weeklyRate = savingsYield / 52;
    return Math.round(cash * weeklyRate);
  }

  /**
   * Calculates weekly marketing burn.
   */
  static calculateMarketingBurn(projects: Project[]): number {
    let totalBurn = 0;
    projects.forEach((p) => {
      if (p.state === 'marketing' && p.marketingBudget) {
        totalBurn += p.marketingBudget / 4;
      }
    });
    return Math.round(totalBurn);
  }

  /**
   * Calculates production costs.
   * Phase 2: TV projects use fractional burn (budget / episodes).
   */
  static calculateProductionBurn(projects: Project[]): number {
    let totalBurn = 0;
    projects.forEach((p) => {
      if (p.state === 'production') {
        if (p.type === 'SERIES' && (p as any).tvDetails) {
          const episodes = (p as any).tvDetails.episodesOrdered || 10;
          totalBurn += p.budget / episodes;
        } else {
          totalBurn += p.weeklyCost;
        }
      }
    });
    return Math.round(totalBurn);
  }

  /**
   * Calculates weekly overhead for TalentPacts.
   */
  static calculatePactOverhead(pacts: TalentPact[]): number {
    return (pacts || []).reduce((total, pact) => total + (pact.weeklyOverhead || 0), 0);
  }

  /**
   * Calculates total consolidated expenses for the studio.
   */
  static calculateConsolidatedExpenses(
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
    const studioLevel = studioArchetype === 'major' ? 3 : (studioArchetype === 'mid-tier' ? 2 : 1);
    const production = this.calculateProductionBurn(projects);
    const marketing = this.calculateMarketingBurn(projects);
    const overhead = this.calculateStudioBurn(studioLevel, projects.filter(p => p.state !== 'released' && p.state !== 'archived').length);
    const pactsBurn = this.calculatePactOverhead(pacts);

    const isDebt = studioCash < 0;
    const interest = isDebt 
      ? this.calculateDebtInterest(studioCash, market.debtRate, studioPrestige, state.industry.awards || [])
      : -this.calculateSavingsYield(studioCash, market.savingsYield);

    return { production, marketing, overhead, interest, pacts: pactsBurn };
  }
}
