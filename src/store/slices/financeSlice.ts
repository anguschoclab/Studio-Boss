import { StateCreator } from 'zustand';
<<<<<<< Updated upstream
=======
import { Project } from '@/engine/types';
>>>>>>> Stashed changes
import { handleReleasePhaseEntry } from '@/engine/systems/projects';

export interface FinanceSlice {
  launchMarketingCampaign: (projectId: string, budget: number, domesticPct: number, angle: string) => void;
  executeMarketingEvent: (eventName: 'superbowl_ad' | 'viral_campaign' | 'press_tour', cost: number, projectId: string) => void;
}

export const createFinanceSlice: StateCreator<any, [], [], FinanceSlice> = (set, get) => ({
  launchMarketingCampaign: (projectId, budget, domesticPct, angle) => {
    set((s: any) => {
      if (!s.gameState) return s;
      const state = s.gameState;
      if (budget > state.cash) return s;

      const pIndex = state.projects.findIndex((p: any) => p.id === projectId);
      if (pIndex === -1) return s;

      const originalProject = state.projects[pIndex];
      if (originalProject.status !== 'marketing') return s;

      const p = { ...originalProject };
      const newCash = state.cash - budget;

      p.marketingBudget = budget;
      p.marketingDomesticSplit = domesticPct;
      p.marketingAngle = angle;

      let buzzBonus = Math.floor(budget / 100000) * 0.1;
      if (budget >= p.budget * 0.5) buzzBonus += 10;
      if (budget >= p.budget) buzzBonus += 20;

      const genreToAngle: Record<string, string[]> = {
        'Action': ['spectacle', 'thrills'],
        'Comedy': ['humor'],
        'Drama': ['prestige', 'romance'],
        'Horror': ['thrills', 'mystery'],
        'Sci-Fi': ['spectacle', 'mystery'],
        'Romance': ['romance'],
      };

      const matched = genreToAngle[p.genre]?.includes(angle) ? 15 : -10;
      buzzBonus += matched;
      p.buzz = Math.min(100, Math.max(0, p.buzz + buzzBonus));

      const contracts = state.contracts.filter((c: any) => c.projectId === p.id);
<<<<<<< Updated upstream
      const talentMap = new Map<string, any>(state.talentPool.map((t: any) => [t.id, t]));
=======
      const talentMap = new Map(state.talentPool.map((t: any) => [t.id, t]));
>>>>>>> Stashed changes
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
