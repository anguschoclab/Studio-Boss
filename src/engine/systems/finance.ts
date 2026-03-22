import { Project, Contract } from '../types';
import { groupContractsByProject } from '../utils';


export function calculateWeeklyCosts(projects: Project[]): number {
  return projects.reduce((sum, p) => {
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
         // Logistics completely break down on mega-sets; costs skyrocket late in production
         costMultiplier *= 1.5;
      } else if (p.status === 'production' && p.budget >= 100_000_000 && p.weeksInPhase > p.productionWeeks * 0.8) {
         // Logistics break down on huge sets; costs balloon late in production
         costMultiplier *= 1.25;
      }

      return sum + (p.weeklyCost * costMultiplier);
    }
    return sum;
  }, 0);
}

export function calculateWeeklyRevenue(projects: Project[], contracts: Contract[] = []): number {
  const contractsByProject = groupContractsByProject(contracts);

  return projects.reduce((sum, p) => {
    if (p.status === 'released') {
      let revenue = p.weeklyRevenue;

      if (p.contractType === 'upfront') {
          revenue = 0; // Studio traded all backend revenue for an upfront production fee
      } else if (p.contractType === 'deficit') {
          // Keep 100% of the calculated revenue for the syndication run
      }

      // Subtract backend participation
      const projectContracts = contractsByProject.get(p.id) || [];
      const totalBackendPercent = projectContracts.reduce((total, c) => total + c.backendPercent, 0);

      // Backend points hit harder when revenue is massive (e.g., simulating complex gross definitions)
      let backendMultiplier = 1.0;
      if (revenue > 100_000_000) {
        backendMultiplier = 1.5; // Mega-hits trigger astronomical backend payouts for A-listers
      } else if (revenue > 50_000_000) {
        backendMultiplier = 1.25; // First dollar gross hits harder
      } else if (revenue > 20_000_000) {
        backendMultiplier = 1.1; // Agents negotiate better escalators for massive hits
      }

      const backendCut = revenue * ((totalBackendPercent * backendMultiplier) / 100);
      return sum + (revenue - backendCut);
    }
    return sum;
  }, 0);
}
