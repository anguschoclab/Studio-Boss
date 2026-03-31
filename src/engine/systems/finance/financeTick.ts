import { GameState, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Weekly Finance Tick (Target A4/B).
 * Calculates overhead, production burn, and revenue for the player studio.
 * Returns discrete StateImpacts for cash changes and ledger updates.
 */
export function tickFinance(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  
  // 1. Calculate Overhead
  const overhead = 50000; // Base overhead
  
  // 2. Calculate Production Burn
  const activeProjects = state.projects.active;
  const productionBurn = activeProjects
    .filter(p => p.state === 'production')
    .reduce((sum, p) => sum + (p.budget / (p.productionWeeks || 20)), 0);
    
  // 3. Calculate Revenue (Simplified for now, will be expanded in Marketing Phase)
  const revenue = activeProjects
    .filter(p => p.state === 'released')
    .reduce((sum, p) => sum + ((p.revenue || 0) / 10), 0); // Placeholder weekly revenue

  const netImpact = revenue - (productionBurn + overhead);

  impacts.push({
    type: 'FUNDS_CHANGED',
    payload: { amount: netImpact }
  });

  return impacts;
}
