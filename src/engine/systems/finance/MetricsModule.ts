import { Project, GameState } from '@/engine/types';

export function calculateProjectROI(project: Project): number {
  const totalCost = project.budget + (project.marketingBudget || 0);
  if (totalCost === 0) return 0;
  return project.revenue / totalCost;
}

export function calculateStudioNetWorth(state: GameState): number {
  let netWorth = state.finance.cash;
  
  for (let i = 0; i < state.ip.vault.length; i++) {
    const asset = state.ip.vault[i];
    netWorth += asset.baseValue * asset.decayRate;
  }

  for (const key in state.entities.projects) {
    const p = state.entities.projects[key];
    if (p.state !== 'released' && p.state !== 'archived') {
      netWorth += p.budget * 0.3;
    }
  }
  
  return Math.floor(netWorth);
}
