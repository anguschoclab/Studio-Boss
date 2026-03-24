import { Project, Contract, GameState, MarketEvent } from '../types';
import { groupContractsByProject } from '../utils';

export function calculateProjectROI(project: Project): number {
  const totalCost = project.budget + (project.marketingBudget || 0);
  if (totalCost === 0) return 0;
  return project.revenue / totalCost;
}

export function calculateStudioNetWorth(state: GameState): number {
  let netWorth = state.cash;
  
  // Add catalog value from IP rights (Sprint E)
  state.studio.internal.projects.forEach(p => {
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
    // Assume revenue decays by roughly 15% per week in aggregate
    const projectedRev = currentWeeklyRevenue * Math.pow(0.85, i);
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

      // Introduce an overhead multiplier for large projects dragging on in production
      if (p.status === 'production' && p.budget >= 200_000_000 && p.weeksInPhase > p.productionWeeks * 0.8) {
         // Logistics completely break down on mega-sets; costs skyrocket late in production (increased overhead for huge risks)
         costMultiplier *= 1.75;
      } else if (p.status === 'production' && p.budget >= 100_000_000 && p.weeksInPhase > p.productionWeeks * 0.8) {
         // Logistics break down on huge sets; costs balloon late in production (increased overhead)
         costMultiplier *= 1.4;
      } else if (p.status === 'production' && p.budget >= 50_000_000 && p.weeksInPhase > p.productionWeeks * 0.8) {
         // Mid-to-high budget projects also face significant overtime/delay penalties
         costMultiplier *= 1.2;
      }

      sum += (p.weeklyCost * costMultiplier * eventMult);
    }
  }
  return sum;
}

// ⚡ Bolt: Replaced chained .reduce passes with single for-loops to eliminate intermediate closures in hot loops
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

      // Backend points hit harder when revenue is massive (e.g., simulating complex gross definitions)
      let backendMultiplier = 1.0;
      if (revenue > 100_000_000) {
        backendMultiplier = 1.6; // Increased mega-hit payouts to squeeze studio margins further
      } else if (revenue > 50_000_000) {
        backendMultiplier = 1.35; // Increased first dollar gross hits
      } else if (revenue > 20_000_000) {
        backendMultiplier = 1.15; // Agents negotiate even better escalators
      }

      const backendCut = revenue * ((totalBackendPercent * backendMultiplier) / 100);
      sum += ((revenue - backendCut) * eventMult);
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
