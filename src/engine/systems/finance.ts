import { Project, Contract } from '../types';

export function calculateWeeklyCosts(projects: Project[]): number {
  return projects
    .filter(p => p.status === 'development' || p.status === 'production')
    .reduce((sum, p) => sum + p.weeklyCost, 0);
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
      const revenue = p.weeklyRevenue;
      // Subtract backend participation
      const projectContracts = contractsByProject.get(p.id) || [];
      const totalBackendPercent = projectContracts.reduce((total, c) => total + c.backendPercent, 0);
      const backendCut = revenue * (totalBackendPercent / 100);
      return sum + (revenue - backendCut);
    }, 0);
}
