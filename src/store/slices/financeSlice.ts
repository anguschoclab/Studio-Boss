import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { handleReleasePhaseEntry, executeMarketing } from '@/engine/systems/projects';

export interface FinanceSlice {
  transactions: Record<string, { id: string, projectId: string, amount: number, type: 'revenue' | 'cost', week: number }>;
  addTransaction: (tx: Omit<{ id: string, projectId: string, amount: number, type: 'revenue' | 'cost', week: number }, 'id'>) => string;
  launchMarketingCampaign: (projectId: string, budget: number, domesticPct: number, angle: string) => void;
  executeMarketingEvent: (eventName: 'superbowl_ad' | 'viral_campaign' | 'press_tour', cost: number, projectId: string) => void;
  addFunds: (amount: number) => void;
}

export const createFinanceSlice: StateCreator<GameStore, [], [], FinanceSlice> = (set, get) => ({
  transactions: {},
  addTransaction: (tx) => {
    const id = crypto.randomUUID();
    set((state) => ({ transactions: { ...state.transactions, [id]: { ...tx, id } } }));
    return id;
  },
  launchMarketingCampaign: (projectId, budget, domesticPct, angle) => {
    set((s) => {
      if (!s.gameState) return s;
      const state = s.gameState;
      if (budget > state.cash) return s;

      const originalProject = state.studio.internal.projects[projectId];
      if (!originalProject) return s;
      if (originalProject.status !== 'marketing') return s;

      const newCash = state.cash - budget;
      const { project: p } = executeMarketing(originalProject, budget, domesticPct, angle);

      const contracts = [];
      for (let i = 0; i < state.studio.internal.contracts.length; i++) {
        const c = state.studio.internal.contracts[i];
        if (c.projectId === p.id) {
          contracts.push(c);
        }
      }

      const talentMap = new Map<string, any>();
      for (const t of Object.values(state.industry.talentPool)) {
        talentMap.set((t as any).id, t);
      }

      const result = handleReleasePhaseEntry(p, state.week, state.studio.prestige, contracts, talentMap);

      const newHeadlines = [...state.industry.headlines];
      if (result.update) {
        newHeadlines.unshift({
          id: crypto.randomUUID(),
          week: state.week,
          category: 'general' as const,
          text: result.update
        });
      }

      const updatedProjects = { ...state.studio.internal.projects, [projectId]: p };

      return {
        gameState: {
          ...state,
          cash: newCash,
          studio: {
            ...state.studio,
            internal: {
              ...state.studio.internal,
              projects: updatedProjects,
            }
          },
          industry: {
            ...state.industry,
            headlines: newHeadlines,
          }
        }
      };
    });
  },

  executeMarketingEvent: (eventName, cost, projectId) => {
    console.log(`Executing marketing event: ${eventName} for project ${projectId} costing ${cost}`);
  },

  addFunds: (amount) => {
    set((s) => {
      if (!s.gameState) return s;
      return {
        gameState: {
          ...s.gameState,
          cash: s.gameState.cash + amount
        }
      };
    });
  },
});
