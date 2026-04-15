import { GameState, StateImpact, Project } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { generateWeeklyFinancialReport } from '../finance';
import { StreamingViewershipTracker } from '../production/StreamingViewershipTracker';
import { StudioArchetype, AI_ARCHETYPES } from '../../data/aiArchetypes';

/**
 * Helper function to get the StudioArchetype for a rival studio.
 */
function getRivalArchetype(rival: any): StudioArchetype | undefined {
  const archetypeId = rival.archetypeId || ('behaviorId' in rival ? rival.behaviorId : undefined);
  if (archetypeId) {
    const archetype = AI_ARCHETYPES.find(a => a.id === archetypeId);
    if (archetype) return archetype;
  }
  return undefined;
}

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

  // Update streaming viewership for all projects with streaming distribution (player and rival)
  const allProjects = Object.values(state.entities.projects || {});
  allProjects.forEach(project => {
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

  // Pre-group all rival projects by ownerId
  const rivalProjectsMap: Record<string, Record<string, Project>> = {};
  for (const p of allProjects) {
    if (p.ownerId && p.ownerId !== state.studio.id) {
      if (!rivalProjectsMap[p.ownerId]) rivalProjectsMap[p.ownerId] = {};
      rivalProjectsMap[p.ownerId][p.id] = p;
    }
  }

  for (const rival of rivalsList) {
    // Use unified storage for rival projects
    const rivalProjectsDict = rivalProjectsMap[rival.id] || {};
    const archetype = getRivalArchetype(rival);

    const { report: rivalReport } = generateWeeklyFinancialReport(
        state,
        rival.id,
        rivalProjectsDict,
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
