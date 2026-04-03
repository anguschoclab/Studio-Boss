import { Project, GameState, WeeklyFinancialReport, Buyer } from '@/engine/types';
import { StateImpact, FinancialSnapshot } from '../types/state.types';
import { RevenueProcessor } from './finance/RevenueProcessor';
import { ExpenseProcessor } from './finance/ExpenseProcessor';
import { InterestRateSimulator } from './market/InterestRateSimulator';

export function calculateProjectROI(project: Project): number {
  const totalCost = project.budget + (project.marketingBudget || 0);
  if (totalCost === 0) return 0;
  return project.revenue / totalCost;
}

export function calculateStudioNetWorth(state: GameState): number {
  let netWorth = state.finance.cash;
  
  // 1. IP Catalog Value
  for (let i = 0; i < state.ip.vault.length; i++) {
    const asset = state.ip.vault[i];
    netWorth += asset.baseValue * asset.decayRate;
  }

  // 2. Active Projects Inventory (Work in Progress value)
  // We value "Inventory" as 40% of the budget already spent to reflect harsher sunk cost realities
  for (const key in state.studio.internal.projects) {
    const p = state.studio.internal.projects[key];
    if (p.state !== 'released' && p.state !== 'archived') {
      netWorth += p.budget * 0.3; // The Studio Comptroller: Reduced WIP valuation from 40% to 30%
    }
  }
  
  return Math.floor(netWorth);
}

/**
 * Integrated Economic Tick using modular processors.
 * Consolidates all silos (IP Dividends, Royalties, Market Rates, M&A Costs).
 */
export function generateWeeklyFinancialReport(
  state: GameState, 
  pendingImpacts: StateImpact[] = []
): { report: WeeklyFinancialReport; snapshot: FinancialSnapshot } {
  const projects: Project[] = [];
  let unreleasedCount = 0;
  for (const key in state.studio.internal.projects) {
    const p = state.studio.internal.projects[key];
    projects.push(p);
    if (p.state !== 'released') {
      unreleasedCount++;
    }
  }

  const market = state.finance.marketState || InterestRateSimulator.initialize();
  
  // Derive Studio Level from Archetype for overhead scaling
  const studioLevel = state.studio.archetype === 'major' ? 3 : (state.studio.archetype === 'mid-tier' ? 2 : 1);

  // 1. Calculate Passive Income from Vault
  const passive = RevenueProcessor.calculateVaultDividends(state.ip.vault);
  
  // 2. Calculate Active Revenue & Royalties (Consolidated)
  const { boxOffice, distribution, merch, totalRoyalties, projectRecoupment } = 
    RevenueProcessor.calculateActiveRevenue(projects, state);

  // 3. Calculate Operational Expenses
  const production = ExpenseProcessor.calculateProductionBurn(projects);
  const marketing = ExpenseProcessor.calculateMarketingBurn(projects);
  const overhead = ExpenseProcessor.calculateStudioBurn(studioLevel, unreleasedCount);

  // 4. Calculate Interest (Debt or Savings)
  const isDebt = state.finance.cash < 0;
  const interest = isDebt 
    ? ExpenseProcessor.calculateDebtInterest(state.finance.cash, market.debtRate)
    : -ExpenseProcessor.calculateSavingsYield(state.finance.cash, market.savingsYield); // Negative expense = income

  // 4. Consolidated One-off Impacts (Awards, Festivals, Acquisitions)
  let otherRevenue = 0;
  let otherExpenses = 0;

  for (let i = 0; i < pendingImpacts.length; i++) {
    const impact = pendingImpacts[i];
    if (impact.type === 'FINANCE_TRANSACTION' && impact.payload) {
      const amount = (impact.payload as { amount: number }).amount || 0;
      if (amount > 0) otherRevenue += amount;
      else otherExpenses += Math.abs(amount);
    } else if (impact.cashChange) {
      const change = impact.cashChange as number;
      if (change > 0) otherRevenue += change;
      else otherExpenses += Math.abs(change);
    }
  }

  const totalRevenue = boxOffice + distribution + merch + passive + otherRevenue + (interest < 0 ? Math.abs(interest) : 0);
  const totalExpenses = production + marketing + overhead + totalRoyalties + (interest > 0 ? interest : 0) + otherExpenses;
  const netProfit = totalRevenue - totalExpenses;

  const report: WeeklyFinancialReport = {
    week: state.week,
    year: Math.floor((state.week - 1) / 52) + 1,
    startingCash: state.finance.cash,
    revenue: { 
      boxOffice, 
      distribution, 
      other: merch + passive + otherRevenue 
    },
    expenses: { 
      production, 
      marketing, 
      overhead: overhead + (interest > 0 ? interest : 0) + otherExpenses + totalRoyalties
    },
    endingCash: state.finance.cash + netProfit,
    netProfit,
  };

  const snapshot: FinancialSnapshot = {
    week: state.week,
    revenue: {
      theatrical: boxOffice,
      streaming: distribution,
      merch: merch,
      passive: passive + otherRevenue
    },
    expenses: {
      production,
      burn: overhead,
      marketing,
      royalties: totalRoyalties,
      interest: interest
    },
    net: netProfit,
    cash: state.finance.cash + netProfit,
    projectRecoupment
  };

  return { report, snapshot };
}

// Update updated legacy wrapper
export function calculateWeeklyCosts(state: GameState): number {
  const projects: Project[] = [];
  let unreleasedCount = 0;
  for (const key in state.studio.internal.projects) {
    const p = state.studio.internal.projects[key];
    projects.push(p);
    if (p.state !== 'released') {
      unreleasedCount++;
    }
  }

  const studioLevel = state.studio.archetype === 'major' ? 3 : (state.studio.archetype === 'mid-tier' ? 2 : 1);
  const production = ExpenseProcessor.calculateProductionBurn(projects);
  const marketing = ExpenseProcessor.calculateMarketingBurn(projects);
  const overhead = ExpenseProcessor.calculateStudioBurn(studioLevel, unreleasedCount);
  return production + marketing + overhead;
}

export function calculateWeeklyRevenue(state: GameState): number {
  const projects = Object.values(state.studio?.internal?.projects || {});
  const buyers = state.market?.buyers || [];

  let boxOffice = 0;
  let distribution = 0;

  // ⚡ Bolt: Precompute buyers map to avoid O(N) lookup per project during iteration.
  const buyersMap = new Map<string, Buyer>();
  buyers.forEach(b => buyersMap.set(b.id, b));

  projects.forEach(p => {
    if (p.state === 'released') {
      if (p.distributionStatus === 'theatrical') {
        boxOffice += RevenueProcessor.calculateTheatricalDecay(p.weeklyRevenue || 0, 0.40, p.isCultClassic); // The Studio Comptroller: Reduced theatrical studio share (decay rate) from 45% to 40% to simulate modern front-loaded box office drops.
      } else if (p.distributionStatus === 'streaming') {
        const platform = p.buyerId ? buyersMap.get(p.buyerId) : undefined;
        if (platform) {
          distribution += RevenueProcessor.calculateStreamingRevenue(p, platform);
        }
      }
    }
  });

  return boxOffice + distribution;
}

export function generateCashflowForecast(state: GameState, weeks: number = 12): { week: number; projected: number }[] {
  // Forecast using the robust generators
  const { report } = generateWeeklyFinancialReport(state);
  const netProfit = report.netProfit;
  
  const forecast: { week: number; projected: number }[] = [];
  let runningCash = state.finance.cash;
  for (let i = 1; i <= weeks; i++) {
    runningCash += netProfit;
    forecast.push({ week: state.week + i, projected: runningCash });
  }
  return forecast;
}
