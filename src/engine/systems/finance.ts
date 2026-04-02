import { Project, GameState, WeeklyFinancialReport, Contract } from '@/engine/types';
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
  if (state.ip && state.ip.vault) {
    state.ip.vault.forEach(asset => {
      netWorth += asset.baseValue * asset.decayRate;
    });
  }

  // 2. Active Projects Inventory (Work in Progress value)
  // We value "Inventory" as 50% of the budget already spent
  if (state.studio && state.studio.internal && state.studio.internal.projects) {
    const projects = state.studio.internal.projects;
    for (const key in projects) {
      const p = projects[key];
      if (p.state !== 'released' && p.state !== 'archived') {
        netWorth += p.budget * 0.5;
      }
    }
  }
  
  return Math.floor(netWorth);
}

/**
 * NEW: Integrated Economic Tick using modular processors
 * Consolidates all silos (IP Dividends, Royalties, Market Rates, M&A Costs)
 */
export function generateWeeklyFinancialReport(
  state: GameState, 
  pendingImpacts: StateImpact[] = []
): { report: WeeklyFinancialReport; snapshot: FinancialSnapshot } {
  const projects = state.studio?.internal?.projects ? Object.values(state.studio.internal.projects) : [];
  const studioLevel = (state.studio as any)?.level || 1;
  const market = state.finance?.marketState || InterestRateSimulator.initialize();

  // 1. Calculate Passive Income from Vault
  const passive = state.ip?.vault ? RevenueProcessor.calculateVaultDividends(state.ip.vault) : 0;
  
  // 2. Calculate Active Revenue & Royalties
  let boxOffice = 0;
  let distribution = 0;
  let merch = 0;
  let totalRoyalties = 0;

  projects.forEach(p => {
    if (p.state === 'released') {
      let weeklyGross = 0;
      
      // Theatrical vs Streaming
      if (p.distributionStatus === 'theatrical') {
        weeklyGross = RevenueProcessor.calculateTheatricalDecay(p.weeklyRevenue || 0, 0.5);
        boxOffice += weeklyGross;
      } else if (p.distributionStatus === 'streaming') {
        const platform = state.market.buyers.find(b => b.id === p.buyerId);
        if (platform) {
          weeklyGross = RevenueProcessor.calculateStreamingRevenue(p, platform);
          distribution += weeklyGross;
        }
      }
      
      // Base Merch
      const franchise = p.franchiseId ? state.ip.franchises[p.franchiseId] : null;
      const weeklyMerch = RevenueProcessor.calculateMerchRevenue(p.buzz, franchise?.relevanceScore || 0);
      merch += weeklyMerch;

      // Deduct Talent Royalties (Net Points Logic)
      totalRoyalties += RevenueProcessor.calculateNetPointsRoyalty(p, weeklyGross + weeklyMerch, state.studio.internal.contracts);
    }
  });

  // 3. Calculate Operational Expenses
  const production = ExpenseProcessor.calculateProductionBurn(projects);
  const marketing = ExpenseProcessor.calculateMarketingBurn(projects);
  const overhead = ExpenseProcessor.calculateStudioBurn(studioLevel, projects.filter(p => p.state !== 'released').length);

  // 4. Calculate Interest (Debt or Savings)
  const isDebt = state.finance.cash < 0;
  const interest = isDebt 
    ? ExpenseProcessor.calculateDebtInterest(state.finance.cash, market.debtRate)
    : -ExpenseProcessor.calculateSavingsYield(state.finance.cash, market.savingsYield); // Negative expense = income

  // 5. Consolidated One-off Impacts (Awards, Festivals, Acquisitions)
  let otherRevenue = 0;
  let otherExpenses = 0;

  pendingImpacts.forEach(impact => {
    if (impact.type === 'FINANCE_TRANSACTION' && impact.payload) {
      const amount = (impact.payload as any).amount || 0;
      if (amount > 0) otherRevenue += amount;
      else otherExpenses += Math.abs(amount);
    } else if (impact.cashChange) {
      const change = impact.cashChange as number;
      if (change > 0) otherRevenue += change;
      else otherExpenses += Math.abs(change);
    }
  });

  const totalRevenue = boxOffice + distribution + merch + passive + otherRevenue;
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
    cash: state.finance.cash + netProfit
  };

  return { report, snapshot };
}

// Legacy wrappers updated to use new processors
export function calculateWeeklyCosts(projects: Project[]): number {
  const production = ExpenseProcessor.calculateProductionBurn(projects);
  const marketing = ExpenseProcessor.calculateMarketingBurn(projects);
  const overhead = ExpenseProcessor.calculateStudioBurn(1, projects.filter(p => p.state !== 'released').length);
  return production + marketing + overhead;
}

export function calculateWeeklyRevenue(projects: Project[], buyers: Buyer[] = []): number {
  let boxOffice = 0;
  let distribution = 0;

  projects.forEach(p => {
    if (p.state === 'released') {
      if (p.distributionStatus === 'theatrical') {
        boxOffice += RevenueProcessor.calculateTheatricalDecay(p.weeklyRevenue || 0, 0.5);
      } else if (p.distributionStatus === 'streaming') {
        const platform = buyers.find(b => b.id === p.buyerId);
        if (platform) {
          distribution += RevenueProcessor.calculateStreamingRevenue(p, platform);
        }
      }
    }
  });

  return boxOffice + distribution;
}

export function generateCashflowForecast(state: GameState, weeks: number = 12): { week: number; projected: number }[] {
  const projects = Object.values(state.studio.internal.projects);
  const weeklyCosts = calculateWeeklyCosts(projects);
  const weeklyRevenue = calculateWeeklyRevenue(projects, state.market.buyers);
  const netPerWeek = weeklyRevenue - weeklyCosts;
  
  const forecast: { week: number; projected: number }[] = [];
  let runningCash = state.finance.cash;
  for (let i = 1; i <= weeks; i++) {
    runningCash += netPerWeek;
    forecast.push({ week: state.week + i, projected: runningCash });
  }
  return forecast;
}
