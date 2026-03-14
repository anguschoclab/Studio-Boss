import { Project, Contract } from '../types';

export function calculateWeeklyCosts(projects: Project[]): number {
  return projects
    .filter(p => p.status === 'development' || p.status === 'production')
    .reduce((sum, p) => sum + p.weeklyCost, 0);
}

export function calculateWeeklyRevenue(projects: Project[], contracts: Contract[]): number {
  return projects
    .filter(p => p.status === 'released')
    .reduce((sum, p) => {
      const revenue = p.weeklyRevenue;
      // Subtract backend participation
      const projectContracts = contracts.filter(c => c.projectId === p.id);
      const totalBackendPercent = projectContracts.reduce((total, c) => total + c.backendPercent, 0);
      const backendCut = revenue * (totalBackendPercent / 100);
      return sum + (revenue - backendCut);
    }, 0);
}
