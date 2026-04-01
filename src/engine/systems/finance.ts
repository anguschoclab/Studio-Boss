import { Project, GameState, WeeklyFinancialReport, MarketEvent, Contract, Buyer } from '@/engine/types';
import { RevenueProcessor } from './finance/RevenueProcessor';
import { ExpenseProcessor } from './finance/ExpenseProcessor';

export function calculateProjectROI(project: Project): number {
  const totalCost = project.budget + (project.marketingBudget || 0);
  if (totalCost === 0) return 0;
  return project.revenue / totalCost;
}

export function calculateStudioNetWorth(state: GameState): number {
  let netWorth = state.finance.cash;
  
  Object.values(state.studio.internal.projects).forEach(p => {
    if (p.ipRights && p.ipRights.catalogValue) {
      if (p.ipRights.rightsOwner === 'studio') {
        netWorth += p.ipRights.catalogValue;
      } else if (p.ipRights.rightsOwner === 'shared') {
        netWorth += p.ipRights.catalogValue * 0.5;
      }
    }
  });
  
  return netWorth;
}

/**
 * NEW: Integrated Economic Tick using modular processors
 */
export function generateWeeklyFinancialReport(state: GameState): WeeklyFinancialReport {
  const projects = Object.values(state.studio.internal.projects);
  const buyers = state.market.buyers;
  const activeEvents = state.market.activeMarketEvents || [];

  let costMult = 1.0;
  let revMult = 1.0;
  for (const e of activeEvents) {
    costMult *= e.costMultiplier;
    revMult *= e.revenueMultiplier;
  }

  // 1. Calculate Expenses using Processor
  const production = ExpenseProcessor.calculateProductionBurn(projects) * costMult;
  const marketing = ExpenseProcessor.calculateMarketingBurn(projects) * costMult;
  const overhead = ExpenseProcessor.calculateStudioBurn(1, projects.filter(p => p.state !== 'released').length) * costMult;

  // 2. Calculate Revenues using Processor
  let boxOffice = 0;
  let distribution = 0;
  let merch = 0;

  projects.forEach(p => {
    if (p.state === 'released') {
      if (p.distributionStatus === 'theatrical') {
        const weeklyRev = p.weeklyRevenue || 0;
        boxOffice += RevenueProcessor.calculateTheatricalDecay(weeklyRev, 0.5) * revMult;
      } else if (p.distributionStatus === 'streaming') {
        const platform = buyers.find(b => b.id === p.buyerId);
        if (platform) {
          distribution += RevenueProcessor.calculateStreamingRevenue(p, platform) * revMult;
        }
      }
      
      // Every released project has a chance for merch
      const franchise = p.franchiseId ? state.ip.franchises[p.franchiseId] : null;
      merch += RevenueProcessor.calculateMerchRevenue(p.buzz, franchise?.relevanceScore || 0) * revMult;
    }
  });

  const totalRevenue = boxOffice + distribution + merch;
  const totalExpenses = production + marketing + overhead;
  const netProfit = totalRevenue - totalExpenses;

  return {
    week: state.week,
    year: Math.floor((state.week - 1) / 52) + 1,
    startingCash: state.finance.cash,
    revenue: { boxOffice, distribution, other: merch },
    expenses: { production, marketing, overhead },
    endingCash: state.finance.cash + netProfit,
    netProfit,
  };
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
