import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { handleReleasePhaseEntry, executeMarketing } from '@/engine/systems/projects';
import { WeeklyFinancialReport, FinanceState, Contract, Project } from '@/engine/types';

export interface FinanceSlice {
  finance: FinanceState;
  addLedgerEntry: (report: WeeklyFinancialReport) => void;
  launchMarketingCampaign: (projectId: string, budget: number, domesticPct: number, angle: string) => void;
  executeMarketingEvent: (eventName: 'superbowl_ad' | 'viral_campaign' | 'press_tour', cost: number, projectId: string) => void;
  addFunds: (amount: number) => void;
}

export const createFinanceSlice: StateCreator<GameStore, [], [], FinanceSlice> = (set, get) => ({
  finance: {
    cash: 500000000,
    ledger: [],
  },

  addLedgerEntry: (report: WeeklyFinancialReport) =>
    set((state) => {
      if (!state.gameState) return state;
      return {
        finance: {
          ...state.finance,
          cash: report.endingCash,
          ledger: [...state.finance.ledger, report].slice(-100),
        },
        gameState: {
          ...state.gameState,
          finance: {
            ...state.gameState.finance,
            cash: report.endingCash,
            ledger: [...state.gameState.finance.ledger, report].slice(-100),
          },
        },
      };
    }),

  launchMarketingCampaign: (projectId, budget, domesticPct, angle) => {
    set((s) => {
      if (!s.gameState) return s;
      const state = s.gameState;
      if (budget > state.finance.cash) return s;

      const pIndex = Object.values(state.studio.internal.projects).findIndex(p => p.id === projectId);
      if (pIndex === -1) return s;

      // Extract original project
      const originalProject = Object.values(state.studio.internal.projects)[pIndex];
      if (originalProject.state !== 'marketing') return s;

      const newCash = state.finance.cash - budget;
      const { project: p } = executeMarketing(originalProject, budget, domesticPct, angle);

      const contracts: Contract[] = [];
      const allContracts = state.studio.internal.contracts;
      for (let i = 0; i < allContracts.length; i++) {
        const c = allContracts[i];
        if (c.projectId === p.id) {
          contracts.push(c);
        }
      }

      const talentPool = state.industry.talentPool;
      const talentMap = new Map<string, any>();
      Object.keys(talentPool).forEach(id => {
        talentMap.set(id, talentPool[id]);
      });

      const result = handleReleasePhaseEntry(p, state.week, state.studio.prestige, contracts, talentMap);

      const headlines = [...state.news.headlines];
      if (result.update) {
        headlines.unshift({
          id: crypto.randomUUID(),
          week: state.week,
          category: 'general' as const,
          text: result.update
        });
      }

      const updatedProjects = { ...state.studio.internal.projects, [p.id]: p };

      return {
        finance: {
            ...s.finance,
            cash: newCash
        },
        gameState: {
          ...state,
          finance: {
            ...state.finance,
            cash: newCash,
          },
          studio: {
            ...state.studio,
            internal: {
              ...state.studio.internal,
              projects: updatedProjects,
            }
          },
          news: {
            ...state.news,
            headlines,
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
      const newCash = s.finance.cash + amount;
      return {
        finance: {
          ...s.finance,
          cash: newCash
        },
        gameState: {
          ...s.gameState,
          finance: {
            ...s.gameState.finance,
            cash: newCash
          }
        }
      };
    });
  },
});
