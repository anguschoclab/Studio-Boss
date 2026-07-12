import { Project, GameState, WeeklyFinancialReport, Buyer } from '@/engine/types';
import { StateImpact, FinancialSnapshot } from '../types/state.types';
import { RevenueProcessor } from './finance/RevenueProcessor';
import { ExpenseProcessor } from './finance/ExpenseProcessor';
import { InterestRateSimulator } from './market/InterestRateSimulator';
import { formatMoney, getContractsByProjectId } from '../utils';

export function calculateProjectROI(project: Project): number {
  const totalCost = project.budget + (project.marketingBudget || 0);
  if (totalCost === 0) return 0;
  return project.revenue / totalCost;
}

export function calculateStudioNetWorth(state: GameState): number {
  let netWorth = state.finance.cash;
  
  // 1. IP Catalog Value
  state.ip.vault.forEach(asset => {
    netWorth += asset.baseValue * asset.decayRate;
  });

  // 2. Active Projects Inventory (Work in Progress value)
  // We value "Inventory" as 50% of the budget already spent
  Object.values(state.studio?.internal?.projects || {}).forEach(p => {
    if (p.state !== 'released' && p.state !== 'archived') {
      netWorth += p.budget * 0.5;
    }
  });
  
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
  const projects = Object.values(state.studio?.internal?.projects || {});
  const studioLevel = (state.studio as unknown as { level?: number }).level || 1;
  const market = state.finance.marketState || InterestRateSimulator.initialize();

  // Track causality for financial changes
  const causality: import('../types/state.types').FinancialCausalityEntry[] = [];

  // 1. Calculate Passive Income from Vault
  const passive = RevenueProcessor.calculateVaultDividends(state.ip.vault);
  
  // 2. Calculate Active Revenue & Royalties
  let boxOffice = 0;
  let distribution = 0;
  let merch = 0;
  let totalRoyalties = 0;

  // ⚡ The Framerate Fanatic: Refactored array .find() inside map to a Map lookup, improving performance from O(n^2) to O(n).
  const buyerMap = new Map<string, Buyer>();
  state.market?.buyers?.forEach(b => buyerMap.set(b.id, b));

  projects.forEach(p => {
    if (p.state === 'released') {
      let weeklyGross = 0;
      let trendMultiplier = 1.0;

      // Check for genre trend
      const genreTrend = state.market.trends?.find(t =>
        t.genre?.toLowerCase() === p.genre?.toLowerCase()
      );
      if (genreTrend) {
        trendMultiplier = genreTrend.heat >= 60 ? 1.2 : (genreTrend.heat <= 30 ? 0.8 : 1.0);
        if (trendMultiplier !== 1.0) {
          causality.push({
            factor: `Genre Trend: ${p.genre}`,
            effect: `${trendMultiplier > 1 ? '+' : ''}${Math.round((trendMultiplier - 1) * 100)}%`,
            magnitude: trendMultiplier - 1,
            description: genreTrend.heat >= 60 ? `${p.genre} is trending hot this season` : `${p.genre} has gone stale in the market`
          });
        }
      }

      // Theatrical vs Streaming
      if (p.distributionStatus === 'theatrical') {
        weeklyGross = RevenueProcessor.calculateTheatricalDecay(p.weeklyRevenue || 0, 0.35) * trendMultiplier; // The Studio Comptroller: Severely increased theatrical decay to 0.35 to accurately model modern front-loaded box office drops.
        boxOffice += weeklyGross;

        // Track theatrical decay causality
        if (p.weeksInPhase && p.weeksInPhase > 1) {
          causality.push({
            factor: `Theatrical Decay: ${p.title}`,
            effect: `-65% weekly drop`,
            magnitude: -0.65,
            description: "Front-loaded box office drops significantly after opening week"
          });
        }
      } else if (p.distributionStatus === 'streaming') {
        const platform = p.buyerId ? buyerMap.get(p.buyerId) : undefined;
        if (platform) {
          weeklyGross = RevenueProcessor.calculateStreamingRevenue(p, platform);
          distribution += weeklyGross;

          // Track platform causality
          causality.push({
            factor: `Streaming Platform: ${platform.name}`,
            effect: `${platform.archetype} revenue model`,
            magnitude: 0,
            description: `Revenue calculated based on ${platform.name}'s subscriber base and content library quality`
          });
        }
      }

      // Base Merch
      const franchise = p.franchiseId ? state.ip.franchises[p.franchiseId] : null;
      const weeklyMerch = RevenueProcessor.calculateMerchRevenue(p.buzz, franchise?.relevanceScore || 0);
      merch += weeklyMerch;

      if (franchise && franchise.relevanceScore > 50) {
        causality.push({
          factor: `Franchise Synergy: ${franchise.name}`,
          effect: `+${franchise.relevanceScore}% merch boost`,
          magnitude: franchise.relevanceScore / 100,
          description: `The ${franchise.name} franchise drives strong merchandising revenue`
        });
      }

      // Deduct Talent Royalties (Net Points Logic)
      const projectContracts = getContractsByProjectId(state.entities?.contractsByProjectId, state.entities?.contracts || {}, p.id);
      totalRoyalties += RevenueProcessor.calculateNetPointsRoyalty(p, weeklyGross + weeklyMerch, projectContracts);
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

  // Track interest causality
  if (interest !== 0) {
    causality.push({
      factor: isDebt ? 'Debt Interest' : 'Savings Yield',
      effect: isDebt ? `-${formatMoney(Math.abs(interest))}` : `+${formatMoney(Math.abs(interest))}`,
      magnitude: isDebt ? -1 : 1,
      description: isDebt
        ? `Interest on debt at ${(market.debtRate * 100).toFixed(1)}% annual rate`
        : `Yield on cash reserves at ${(market.savingsYield * 100).toFixed(1)}% annual rate`
    });
  }

  // 5. Consolidated One-off Impacts (Awards, Festivals, Acquisitions)
  let otherRevenue = 0;
  let otherExpenses = 0;

  pendingImpacts.forEach(impact => {
    if (impact.type === 'FINANCE_TRANSACTION' && impact.payload) {
      const amount = (impact.payload as { amount?: number }).amount || 0;
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
    cash: state.finance.cash + netProfit,
    causality
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateWeeklyRevenue(projects: Project[], buyers: Buyer[] = [], _legacyContext?: unknown): number {
  let boxOffice = 0;
  let distribution = 0;

  // ⚡ The Framerate Fanatic: Refactored array .find() inside map to a Map lookup, improving performance from O(n^2) to O(n).
  const buyerMap = new Map<string, Buyer>();
  buyers?.forEach(b => buyerMap.set(b.id, b));

  projects.forEach(p => {
    if (p.state === 'released') {
      if (p.distributionStatus === 'theatrical') {
        boxOffice += RevenueProcessor.calculateTheatricalDecay(p.weeklyRevenue || 0, 0.35); // The Studio Comptroller: Severely increased theatrical decay to 0.35 to accurately model modern front-loaded box office drops.
      } else if (p.distributionStatus === 'streaming') {
        const platform = p.buyerId ? buyerMap.get(p.buyerId) : undefined;
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
