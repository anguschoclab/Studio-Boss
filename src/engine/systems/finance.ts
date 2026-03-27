import { Project, Contract, GameState, MarketEvent } from '@/engine/types';
import { groupContractsByProject } from '../utils';

export function calculateProjectROI(project: Project): number {
  const totalCost = project.budget + (project.marketingBudget || 0);
  if (totalCost === 0) return 0;
  return project.revenue / totalCost;
}

export function calculateStudioNetWorth(state: GameState): number {
  let netWorth = state.cash;
  
  // Add catalog value from IP rights (Sprint E)
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

export interface CashflowForecast {
  week: number;
  projectedRevenue: number;
  projectedCosts: number;
  projectedCash: number;
}

export function generateCashflowForecast(state: GameState, weeksAhead: number = 8): CashflowForecast[] {
  const forecast: CashflowForecast[] = [];
  let currentCash = state.cash;
  
  // Short-term projection based on current weekly rates with decay.
  const currentWeeklyCosts = calculateWeeklyCosts(state.studio.internal.projects, state.market.activeMarketEvents || []);
  const currentWeeklyRevenue = calculateWeeklyRevenue(state.studio.internal.projects, state.studio.internal.contracts, state.market.activeMarketEvents || []);
  
  for (let i = 1; i <= weeksAhead; i++) {
    // The Studio Comptroller: Increased aggregate revenue decay to 45% (Math.pow(0.55, i)) to simulate modern brutal, hyper front-loaded box office drops.
    const projectedRev = currentWeeklyRevenue * Math.pow(0.55, i);
    // Costs stay flat for short-term projection
    const projectedCost = currentWeeklyCosts;
    currentCash += (projectedRev - projectedCost);
    
    forecast.push({
      week: state.week + i,
      projectedRevenue: projectedRev,
      projectedCosts: projectedCost,
      projectedCash: currentCash
    });
  }
  
  return forecast;
}


// ⚡ Bolt: Replaced chained .reduce passes with single for-loops to eliminate intermediate closures in hot loops
export function calculateWeeklyCosts(projects: Project[], activeEvents: MarketEvent[] = []): number {
  let eventMult = 1.0;
  for (let i = 0; i < activeEvents.length; i++) {
    eventMult *= activeEvents[i].costMultiplier;
  }

  let sum = 0;
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    if (p.status === 'development' || p.status === 'production') {
      let costMultiplier = 1;
      if (p.status === 'production' && p.contractType === 'upfront') {
         costMultiplier = 0; // The network/streamer is paying for the production entirely
      } else if (p.status === 'production' && p.contractType === 'deficit') {
         // Studio pays 50% to retain backend rights
         costMultiplier = 0.5;
      }

      // The Studio Comptroller: Ruthless overhead multipliers. Delays on $200M+ sets are financial catastrophes, jumping to 5.0x overhead burn.
      if (p.status === 'production' && p.budget >= 200_000_000 && p.weeksInPhase > p.productionWeeks * 0.8) {
         costMultiplier *= 5.0;
      } else if (p.status === 'production' && p.budget >= 100_000_000 && p.weeksInPhase > p.productionWeeks * 0.8) {
         // The Studio Comptroller: Aggressive scaling for massive sets spiraling out of control (to 2.5x).
         costMultiplier *= 2.5;
      } else if (p.status === 'production' && p.budget >= 50_000_000 && p.weeksInPhase > p.productionWeeks * 0.8) {
         // Mid-to-high budget projects also face significant overtime/delay penalties.
         costMultiplier *= 1.5;
      }

      sum += (p.weeklyCost * costMultiplier * eventMult);
    }
  }
  return sum;
}

// ⚡ Bolt: Replaced chained .reduce passes with single for-loops to eliminate intermediate closures in hot loops

function applyIronicViewingMultiplier(baseRevenue: number): number {
  // Cult classics flatten out and earn a steady ironic viewing revenue stream, preventing it from dropping off to 0
  return Math.max(baseRevenue * 1.5, 100000); // Guarantees at least $100k weekly or 1.5x of whatever the base is
}

export function calculateWeeklyRevenue(projects: Project[], contracts: Contract[] = [], activeEvents: MarketEvent[] = []): number {
  let eventMult = 1.0;
  for (let i = 0; i < activeEvents.length; i++) {
    eventMult *= activeEvents[i].revenueMultiplier;
  }
  const contractsByProject = groupContractsByProject(contracts);

  let sum = 0;
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    if (p.status === 'released') {
      let revenue = p.weeklyRevenue;

      if (p.contractType === 'upfront') {
          revenue = 0; // Studio traded all backend revenue for an upfront production fee
      } else if (p.contractType === 'deficit') {
          // Keep 100% of the calculated revenue for the syndication run
      }

      // Subtract backend participation
      const projectContracts = contractsByProject.get(p.id) || [];
      let totalBackendPercent = 0;
      for (let j = 0; j < projectContracts.length; j++) {
        totalBackendPercent += projectContracts[j].backendPercent;
      }

      // The Studio Comptroller: Backend points hit aggressively harder when revenue is massive. Modern agents squeeze studio margins ruthlessly on gross participation definitions.
      let backendMultiplier = 1.0;
      if (revenue > 150_000_000) {
        backendMultiplier = 3.0; // The Studio Comptroller: Mega-hit payouts aggressively squeeze margin.
      } else if (revenue > 100_000_000) {
        backendMultiplier = 2.5; // The Studio Comptroller: Mega-hit payouts aggressively squeeze studio margin (2.2x -> 2.5x).
      } else if (revenue > 50_000_000) {
        backendMultiplier = 1.9; // The Studio Comptroller: Increased backend slice for strong hits (1.7x -> 1.9x).
      } else if (revenue > 20_000_000) {
        backendMultiplier = 1.25; // Good performers trigger escalating payout tiers.
      }

      const backendCut = revenue * ((totalBackendPercent * backendMultiplier) / 100);
      let netRevenue = (revenue - backendCut);
      if (p.isCultClassic) {
         netRevenue = applyIronicViewingMultiplier(netRevenue);
      }
      sum += (netRevenue * eventMult);
    }
  }
  return sum;
}

export interface FinanceAdvanceResult {
  newCash: number;
  costs: number;
  revenue: number;
  financeHistory: { week: number; cash: number; revenue: number; costs: number }[];
}

export function advanceFinance(
  state: GameState,
  nextWeek: number
): FinanceAdvanceResult {
  const costs = calculateWeeklyCosts(state.studio.internal.projects, state.market.activeMarketEvents || []);
  const revenue = calculateWeeklyRevenue(state.studio.internal.projects, state.studio.internal.contracts, state.market.activeMarketEvents || []);
  const newCash = state.cash - costs + revenue;

  const financeHistory = [
    ...state.studio.internal.financeHistory,
    { week: nextWeek, cash: newCash, revenue, costs },
  ].slice(-52);

  return {
    newCash,
    costs,
    revenue,
    financeHistory,
  };
}
