import { Project } from '../types';

export function calculateWeeklyCosts(projects: Project[]): number {
  return projects
    .filter(p => p.status === 'development' || p.status === 'production')
    .reduce((sum, p) => sum + p.weeklyCost, 0);
}

export function calculateWeeklyRevenue(projects: Project[]): number {
  return projects
    .filter(p => p.status === 'released')
    .reduce((sum, p) => sum + p.weeklyRevenue, 0);
}
