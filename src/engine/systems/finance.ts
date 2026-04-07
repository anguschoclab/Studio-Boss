import { Project, GameState, WeeklyFinancialReport, Buyer, Contract, TalentPact } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';
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
  for (const key in state.entities.projects) {
    const p = state.entities.projects[key];
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
  rng: RandomGenerator, // 🌌 Added for deterministic ID generation
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

  // 5. Final P&L Calculation
  // ⚡ PHASE 6: netProfit now ONLY includes operational P&L. 
  // One-off impacts (acquisitions, awards) are tracked in report.revenue.other/otherExpenses 
  // but are excluded from netProfit because they are applied via their own StateImpacts (Double Accounting fix).
  const netProfit = (boxOffice + distribution + merch + passive + (expenses.interest < 0 ? Math.abs(expenses.interest) : 0)) 
                  - (expenses.production + expenses.marketing + expenses.overhead + expenses.pacts + totalRoyalties + (expenses.interest > 0 ? expenses.interest : 0));

  const report: WeeklyFinancialReport = {
    id: rng.uuid('fin-rep'), // 🌌 Standardized UUID
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
    id: rng.uuid('fin-snap'), // 🌌 Standardized UUID
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
  const projects = Object.values(state.entities.projects || {});

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
  const projects = Object.values(state.entities.projects || {});
  const buyers = state.market?.buyers || [];

  let boxOffice = 0;
  let distribution = 0;

  const buyersMap = new Map<string, Buyer>();
  buyers.forEach(b => buyersMap.set(b.id, b));

  projects.forEach(p => {
    if (p.state === 'released') {
      if (p.distributionStatus === 'theatrical') {
        // The Studio Comptroller: Synchronized theatrical decay rate to 0.30 to simulate ruthless modern front-loaded box office drops.
        boxOffice += RevenueProcessor.calculateTheatricalDecay(p.weeklyRevenue || 0, 0.30, p.isCultClassic);
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
      state.studio.id, // 🌌 Refactored from 'player'
      state.entities.projects, 
      state.finance.cash, 
      state.studio.archetype, 
      state.studio.prestige, 
      Object.values(state.entities.contracts || {}), 
      state.studio.internal.firstLookDeals || [],
      new RandomGenerator(state.gameSeed + state.week), // 🌌 Seeded RNG for forecast reports
      []
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
