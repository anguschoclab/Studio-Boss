import { Project, Contract } from '../types';


export function calculateWeeklyCosts(projects: Project[]): number {
  return projects
    .filter(p => p.status === 'development' || p.status === 'production')
    .reduce((sum, p) => {
      let costMultiplier = 1;
      if (p.status === 'production' && p.contractType === 'upfront') {
         costMultiplier = 0; // The network/streamer is paying for the production entirely
      } else if (p.status === 'production' && p.contractType === 'deficit') {
         costMultiplier = 0.3; // Studio pays 30% to retain backend rights
      }
      return sum + (p.weeklyCost * costMultiplier);
    }, 0);
}

export function calculateWeeklyRevenue(projects: Project[], contracts: Contract[] = []): number {
  // Group contracts by projectId for O(1) lookup
  const contractsByProject = new Map<string, Contract[]>();
  for (const contract of contracts) {
    if (!contractsByProject.has(contract.projectId)) {
      contractsByProject.set(contract.projectId, []);
    }
    contractsByProject.get(contract.projectId)!.push(contract);
  }

  return projects
    .filter(p => p.status === 'released')
    .reduce((sum, p) => {
      let revenue = p.weeklyRevenue;

      if (p.contractType === 'upfront') {
          revenue = 0; // Studio traded all backend revenue for an upfront production fee
      } else if (p.contractType === 'deficit') {
          // Keep 100% of the calculated revenue for the syndication run
      }

      // Subtract backend participation
      const projectContracts = contractsByProject.get(p.id) || [];
      const totalBackendPercent = projectContracts.reduce((total, c) => total + c.backendPercent, 0);
      const backendCut = revenue * (totalBackendPercent / 100);
      return sum + (revenue - backendCut);
    }, 0);
}
