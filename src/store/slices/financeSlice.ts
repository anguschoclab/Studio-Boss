import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { handleReleasePhaseEntry, executeMarketing } from '@/engine/systems/projects';

export interface FinanceSlice {
  launchMarketingCampaign: (projectId: string, budget: number, domesticPct: number, angle: string) => void;
  executeMarketingEvent: (eventName: 'superbowl_ad' | 'viral_campaign' | 'press_tour', cost: number, projectId: string) => void;
}

export const createFinanceSlice: StateCreator<GameStore, [], [], FinanceSlice> = (set, get) => ({
  launchMarketingCampaign: (projectId, budget, domesticPct, angle) => {
    set((s) => {
      if (!s.gameState) return s;
      const state = s.gameState;
      if (budget > state.cash) return s;

      const pIndex = state.projects.findIndex(p => p.id === projectId);
      if (pIndex === -1) return s;

      const originalProject = state.projects[pIndex];
      if (originalProject.status !== 'marketing') return s;

      const newCash = state.cash - budget;
      const { project: p } = executeMarketing(originalProject, budget, domesticPct, angle);

      const contracts = state.contracts.filter(c => c.projectId === p.id);
      const talentMap = new Map<string, any>(state.talentPool.map(t => [t.id, t]));
      const result = handleReleasePhaseEntry(p, state.week, state.studio.prestige, contracts, talentMap);

      const newHeadlines = [...state.headlines];
      if (result.update) {
        newHeadlines.unshift({
          id: crypto.randomUUID(),
          week: state.week,
          category: 'general',
          text: result.update
        });
      }

      const updatedProjects = [...state.projects];
      updatedProjects[pIndex] = p;

      return {
        gameState: {
          ...state,
          cash: newCash,
          projects: updatedProjects,
          headlines: newHeadlines,
        }
      };
    });
  },

  executeMarketingEvent: (eventName, cost, projectId) => {
    console.log(`Executing marketing event: ${eventName} for project ${projectId} costing ${cost}`);
  },
});
