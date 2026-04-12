import { GameState, StateImpact, Project } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { generateWeeklyFinancialReport } from '../finance';
import { StreamingViewershipTracker } from '../production/StreamingViewershipTracker';

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
      state.deals?.activeDeals || [], 
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

  // Update streaming viewership for player projects with streaming distribution
  const playerProjects = Object.values(state.entities.projects || {});
  playerProjects.forEach(project => {
    if (project.state === 'released' && project.distributionStatus === 'streaming' && project.streamingViewership && project.streamingViewership.length > 0) {
      // Find the viewership history for this project's platform
      const platformId = project.buyerId || '';
      const historyIndex = project.streamingViewership.findIndex(v => v.platform === platformId);
      
      if (historyIndex >= 0) {
        const updatedViewership = StreamingViewershipTracker.updateViewership(
          project.streamingViewership[historyIndex],
          state.week,
          project,
          rng
        );
        
        // Update the specific history in the array
        const updatedArray = [...project.streamingViewership];
        updatedArray[historyIndex] = updatedViewership;
        
        impacts.push({
          type: 'PROJECT_UPDATED',
          payload: {
            projectId: project.id,
            update: { streamingViewership: updatedArray }
          }
        });
      }
    }
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
