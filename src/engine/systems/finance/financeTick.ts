import { GameState, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { generateWeeklyFinancialReport } from '../finance';

/**
 * Weekly Finance Tick (Target A4/B).
 * Calculates overhead, production burn, and revenue for the player studio.
 * Returns discrete StateImpacts for cash changes and ledger updates.
 */
export function tickFinance(state: GameState, rng: RandomGenerator, pendingImpacts: StateImpact[] = []): StateImpact[] {
  const impacts: StateImpact[] = [];
  
  const contractsList = Object.values(state.entities.contracts || {});

  // 1. Player Finance Tick
  const { report, snapshot } = generateWeeklyFinancialReport(
      state, 
      state.studio.id, // 🌌 Standardized ID
      state.entities.projects, 
      state.finance.cash, 
      state.studio.archetype, 
      state.studio.prestige, 
      contractsList, 
      state.studio.internal.firstLookDeals || [], 
      rng, 
      pendingImpacts
  );
  
  impacts.push({
    type: 'FUNDS_CHANGED',
    payload: { amount: report.netProfit }
  });

  impacts.push({
    type: 'LEDGER_UPDATED',
    payload: { report }
  });

  impacts.push({
    type: 'FINANCE_SNAPSHOT_ADDED',
    payload: { snapshot }
  });

  // 2. Rival Finance Tick (Phase 5: Industry Symmetry)
  const rivalsList = Object.values(state.entities.rivals || {});

  for (const rival of rivalsList) {
      const { report: rivalReport } = generateWeeklyFinancialReport(
          state,
          rival.id,
          rival.projects || {},
          rival.cash,
          rival.archetype,
          rival.prestige,
          [], // Rivals don't use player contracts (simplified for now)
          [], // Rivals don't have pacts yet
          rng,
          pendingImpacts
      );

      impacts.push({
          type: 'RIVAL_UPDATED',
          payload: {
              rivalId: rival.id,
              update: { cash: rival.cash + rivalReport.netProfit }
          }
      });
  }
  
  return impacts;
}
