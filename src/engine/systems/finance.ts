import { Project, GameState, WeeklyFinancialReport, Buyer, Contract, TalentPact } from '@/engine/types';
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
  for (const key in state.studio.internal.projects) {
    const p = state.studio.internal.projects[key];
    if (p.state !== 'released' && p.state !== 'archived') {
      netWorth += p.budget * 0.3;
    }
  }
  
  return Math.floor(netWorth);
}

/**
 * Integrated Economic Tick using modular processors.
 * ⚡ Phase 5: Refactored to handle any studio (player or rival).
 */
export function generateWeeklyFinancialReport(
  state: GameState,
  studioId: string,
  projectsMap: Record<string, Project>,
  studioCash: number,
  studioArchetype: string,
  studioPrestige: number,
  contracts: Contract[],
  pacts: TalentPact[],
  pendingImpacts: StateImpact[] = []
): { report: WeeklyFinancialReport; snapshot: FinancialSnapshot } {
  const projects = Object.values(projectsMap || {});
  const market = state.finance.marketState || InterestRateSimulator.initialize();
  
  // 1. Calculate Passive Income from Vault (Filtered by Studio ownership in Phase 5)
  const passive = RevenueProcessor.calculateVaultDividends(state.ip.vault, studioId);
  
  // 2. Calculate Active Revenue & Royalties
  const { boxOffice, distribution, merch, totalRoyalties, projectRecoupment } = 
    RevenueProcessor.calculateActiveRevenue(projects, state, contracts, state.ip.vault, studioId);

  // 3. Calculate Operational Expenses (Consolidated)
  const expenses = ExpenseProcessor.calculateConsolidatedExpenses(
      projects, 
      state, 
      market, 
      studioArchetype, 
      studioCash, 
      studioPrestige, 
      pacts
  );

  // 4. Consolidated One-off Impacts (Awards, Festivals, Acquisitions)
  let otherRevenue = 0;
  let otherExpenses = 0;

  for (let i = 0; i < pendingImpacts.length; i++) {
    const impact = pendingImpacts[i];
    // Only apply if target matches or it is a generic player impact
    const isTarget = impact.payload && (impact.payload as any).targetId === studioId;
    const isGenericPlayer = studioId === 'player' && !impact.payload?.targetId;

    if (isTarget || isGenericPlayer) {
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
  }

  const totalRevenue = boxOffice + distribution + merch + passive + otherRevenue + (expenses.interest < 0 ? Math.abs(expenses.interest) : 0);
  const totalExpenses = expenses.production + expenses.marketing + expenses.overhead + expenses.pacts + totalRoyalties + (expenses.interest > 0 ? expenses.interest : 0) + otherExpenses;
  const netProfit = totalRevenue - totalExpenses;

  const report: WeeklyFinancialReport = {
    week: state.week,
    year: Math.floor((state.week - 1) / 52) + 1,
    startingCash: studioCash,
    revenue: { 
      boxOffice, 
      distribution, 
      other: merch + passive + otherRevenue 
    },
    expenses: { 
      production: expenses.production, 
      marketing: expenses.marketing, 
      overhead: expenses.overhead,
      pacts: expenses.pacts
    },
    endingCash: studioCash + netProfit,
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
      production: expenses.production,
      burn: expenses.overhead,
      marketing: expenses.marketing,
      royalties: totalRoyalties,
      interest: expenses.interest,
      pacts: expenses.pacts
    },
    net: netProfit,
    cash: studioCash + netProfit,
    projectRecoupment
  };

  return { report, snapshot };
}

export function calculateWeeklyCosts(state: GameState): number {
  const projects: Project[] = [];
  for (const key in state.studio.internal.projects) {
    projects.push(state.studio.internal.projects[key]);
  }

  const market = state.finance.marketState || InterestRateSimulator.initialize();
  const expenses = ExpenseProcessor.calculateConsolidatedExpenses(
      projects, 
      state, 
      market, 
      state.studio.archetype, 
      state.finance.cash, 
      state.studio.prestige, 
      state.studio.internal.firstLookDeals || []
  );
  return expenses.production + expenses.marketing + expenses.overhead + expenses.pacts;
}

export function calculateWeeklyRevenue(state: GameState): number {
  const projects = Object.values(state.studio?.internal?.projects || {});
  const buyers = state.market?.buyers || [];

  let boxOffice = 0;
  let distribution = 0;

  const buyersMap = new Map<string, Buyer>();
  buyers.forEach(b => buyersMap.set(b.id, b));

  projects.forEach(p => {
    if (p.state === 'released') {
      if (p.distributionStatus === 'theatrical') {
        // The Studio Comptroller: Aligned standalone calculation with the core 0.35 front-loaded decay rate.
        boxOffice += RevenueProcessor.calculateTheatricalDecay(p.weeklyRevenue || 0, 0.35, p.isCultClassic);
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
  const { report } = generateWeeklyFinancialReport(
      state, 
      'player', 
      state.studio.internal.projects, 
      state.finance.cash, 
      state.studio.archetype, 
      state.studio.prestige, 
      state.studio.internal.contracts, 
      state.studio.internal.firstLookDeals || []
  );
  const netProfit = report.netProfit;
  
  const forecast: { week: number; projected: number }[] = [];
  let runningCash = state.finance.cash;
  for (let i = 1; i <= weeks; i++) {
    runningCash += netProfit;
    forecast.push({ week: state.week + i, projected: runningCash });
  }
  return forecast;
}
