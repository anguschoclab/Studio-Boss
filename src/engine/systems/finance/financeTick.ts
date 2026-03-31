import { GameState, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { generateWeeklyFinancialReport } from '../finance';

/**
 * Weekly Finance Tick (Target A4/B).
 * Calculates overhead, production burn, and revenue for the player studio.
 * Returns discrete StateImpacts for cash changes and ledger updates.
 */
export function tickFinance(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  
  // Use the robust report generator
  const report = generateWeeklyFinancialReport(state);
  
  // 1. Funds change
  impacts.push({
    type: 'FUNDS_CHANGED',
    payload: { amount: report.netProfit }
  });

  // 2. Ledger update
  impacts.push({
    type: 'LEDGER_UPDATED',
    payload: { report }
  });
  
  return impacts;
}
