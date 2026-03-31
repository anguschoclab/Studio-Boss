import { Project, Contract, GameState, MarketEvent, WeeklyFinancialReport } from '@/engine/types';
import { groupContractsByProject } from '../utils';

export function calculateProjectROI(project: Project): number {
  const totalCost = project.budget + (project.marketingBudget || 0);
  if (totalCost === 0) return 0;
  return project.revenue / totalCost;
}

export function calculateStudioNetWorth(state: GameState): number {
  let netWorth = state.finance.cash;
  
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

// --- Modular Cost Calculations ---

export function calculateProductionBurn(projects: Project[], eventMult: number = 1.0): number {
  let sum = 0;
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    if (p.status === 'production') {
      let costMultiplier = 1;
      if (p.contractType === 'upfront') {
         costMultiplier = 0; 
      } else if (p.contractType === 'deficit') {
         costMultiplier = 0.5;
      }

      // The Studio Comptroller: Ruthless overhead multipliers for delayed massive sets.
      if (p.budget >= 200_000_000 && p.weeksInPhase > p.productionWeeks * 0.8) {
         costMultiplier *= 12.0; 
      } else if (p.budget >= 100_000_000 && p.weeksInPhase > p.productionWeeks * 0.8) {
         costMultiplier *= 5.5; 
      } else if (p.budget >= 50_000_000 && p.weeksInPhase > p.productionWeeks * 0.8) {
         costMultiplier *= 3.0; 
      }

      sum += (p.weeklyCost * costMultiplier * eventMult);
    }
  }
  return sum;
}

export function calculateMarketingExpenses(projects: Project[], eventMult: number = 1.0): number {
    let sum = 0;
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      if (p.status === 'marketing') {
        sum += (p.weeklyCost * eventMult);
      }
    }
    return sum;
}

export function calculateOverhead(state: GameState): number {
  // Base studio overhead
  return 500000; 
}

// --- Modular Revenue Calculations ---

function applyIronicViewingMultiplier(baseRevenue: number): number {
  return Math.max(baseRevenue * 1.5, 100000); 
}

export function calculateBoxOfficeRevenue(projects: Project[], contracts: Contract[] = [], eventMult: number = 1.0): number {
  const contractsByProject = groupContractsByProject(contracts);
  let sum = 0;
  
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    if (p.status === 'released' && p.format === 'film') {
      let revenue = p.weeklyRevenue;

      if (p.contractType === 'upfront') {
          revenue = 0;
      }

      // Subtract backend participation
      const projectContracts = contractsByProject.get(p.id) || [];
      let totalBackendPercent = 0;
      for (let j = 0; j < projectContracts.length; j++) {
        totalBackendPercent += projectContracts[j].backendPercent;
      }

      // The Studio Comptroller: Backend points hit aggressively harder when revenue is massive.
      let backendMultiplier = 1.0;
      if (revenue > 200_000_000) backendMultiplier = 6.0;
      else if (revenue > 150_000_000) backendMultiplier = 4.5;
      else if (revenue > 100_000_000) backendMultiplier = 3.0;
      else if (revenue > 50_000_000) backendMultiplier = 2.2;
      else if (revenue > 20_000_000) backendMultiplier = 1.5;

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

export function calculateDistributionRevenue(projects: Project[], eventMult: number = 1.0): number {
    let sum = 0;
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      // TV/Unscripted/Catalog revenue
      if (p.status === 'released' && p.format !== 'film') {
        sum += (p.weeklyRevenue * eventMult);
      }
    }
    return sum;
}

// --- Weekly Report Generation ---

export function generateWeeklyFinancialReport(state: GameState): WeeklyFinancialReport {
  const projects = Object.values(state.studio.internal.projects);
  const contracts = state.studio.internal.contracts;
  const activeEvents = state.market.activeMarketEvents || [];

  let costMult = 1.0;
  let revMult = 1.0;
  for (const e of activeEvents) {
    costMult *= e.costMultiplier;
    revMult *= e.revenueMultiplier;
  }

  const production = calculateProductionBurn(projects, costMult);
  const marketing = calculateMarketingExpenses(projects, costMult);
  const overhead = calculateOverhead(state);

  const boxOffice = calculateBoxOfficeRevenue(projects, contracts, revMult);
  const distribution = calculateDistributionRevenue(projects, revMult);
  const other = 0; // Future: licensing, merchandising, etc.

  const totalRevenue = boxOffice + distribution + other;
  const totalExpenses = production + marketing + overhead;
  const netProfit = totalRevenue - totalExpenses;

  return {
    week: state.week,
    year: Math.floor((state.week - 1) / 52) + 1,
    startingCash: state.finance.cash,
    revenue: { boxOffice, distribution, other },
    expenses: { production, marketing, overhead },
    endingCash: state.finance.cash + netProfit,
    netProfit,
  };
}

// Legacy wrappers to prevent breaking existing code during transition
export function calculateWeeklyCosts(projects: Project[], activeEvents: MarketEvent[] = []): number {
  let costMult = 1.0;
  for (const e of activeEvents) costMult *= e.costMultiplier;
  return calculateProductionBurn(projects, costMult) + 500000; // Static overhead for now
}

export function calculateWeeklyRevenue(projects: Project[], contracts: Contract[] = [], activeEvents: MarketEvent[] = []): number {
  let revMult = 1.0;
  for (const e of activeEvents) revMult *= e.revenueMultiplier;
  return calculateBoxOfficeRevenue(projects, contracts, revMult) + calculateDistributionRevenue(projects, revMult);
}
