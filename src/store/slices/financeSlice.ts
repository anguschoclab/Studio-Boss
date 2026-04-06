import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { handleReleasePhaseEntry, executeMarketing } from '@/engine/systems/projects';
import { WeeklyFinancialReport, FinanceState, Contract, Project, Buyer, RivalStudio, Talent } from '@/engine/types';
import { FinancialSnapshot, MarketState } from '@/engine/types/state.types';
import { InterestRateSimulator } from '@/engine/systems/market/InterestRateSimulator';
import { RandomGenerator } from '@/engine/utils/rng';

export interface FinanceSlice {
  finance: FinanceState;
  addLedgerEntry: (report: WeeklyFinancialReport) => void;
  launchMarketingCampaign: (projectId: string, budget: number, domesticPct: number, angle: string) => void;
  executeMarketingEvent: (eventName: 'superbowl_ad' | 'viral_campaign' | 'press_tour', cost: number, projectId: string) => void;
  addFunds: (amount: number) => void;
}

export const createFinanceSlice: StateCreator<GameStore, [], [], FinanceSlice> = (set, get) => ({
  finance: {
    cash: 0,
    ledger: [],
    weeklyHistory: [],
    marketState: InterestRateSimulator.initialize(),
  },

  addLedgerEntry: (report: WeeklyFinancialReport) =>
    set((state) => {
      const gs = state.gameState;
      if (!gs) return state;
      const snapshot: FinancialSnapshot = {
        week: report.week,
        revenue: {
          theatrical: report.revenue.boxOffice,
          streaming: report.revenue.distribution,
          merch: report.revenue.other,
          passive: 0,
        },
        expenses: {
          production: report.expenses.production,
          burn: report.expenses.overhead,
          marketing: report.expenses.marketing,
          pacts: 0,
          royalties: 0,
          interest: 0,
        },
        net: report.netProfit,
        cash: report.endingCash
      };

      return {
        finance: {
          ...state.finance,
          cash: report.endingCash,
          ledger: [report, ...state.finance.ledger].slice(0, 100),
          weeklyHistory: [snapshot, ...state.finance.weeklyHistory].slice(0, 52),
        },
        gameState: {
          ...gs,
          finance: {
            ...gs.finance,
            cash: report.endingCash,
            ledger: [report, ...gs.finance.ledger].slice(0, 100),
            weeklyHistory: [snapshot, ...gs.finance.weeklyHistory].slice(0, 52),
          },
        },
      };
    }),

  launchMarketingCampaign: (projectId, budget, domesticPct, angle) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;
      if (budget > state.finance.cash) return s;

      const originalProject = state.entities.projects[projectId];
      if (!originalProject || originalProject.state !== 'marketing') return s;

      const newCash = state.finance.cash - budget;
      const { project: p } = executeMarketing(originalProject, {
        domesticBudget: budget * (domesticPct / 100),
        foreignBudget: budget * (1 - domesticPct / 100),
        primaryAngle: angle as any,
      });

      const projectContracts: Contract[] = Object.values(state.entities.contracts).filter(c => c.projectId === p.id);

      const talentPool = state.entities.talents;
      const talentMap = new Map<string, Talent>();
      Object.keys(talentPool).forEach(id => {
        talentMap.set(id, talentPool[id]);
      });

      const rng = new RandomGenerator(state.rngState);

      const result = handleReleasePhaseEntry(
        p, 
        state.week, 
        state.studio.prestige, 
        projectContracts, 
        talentMap,
        rng
      );

      const headlines = [...state.news.headlines];
      if (result.update) {
        headlines.unshift({
          id: rng.uuid('news-market'),
          week: state.week,
          category: 'general' as const,
          text: result.update
        });
      }

      const updatedProjects = { ...state.entities.projects, [p.id]: p };

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
          entities: {
            ...state.entities,
            projects: updatedProjects
          },
          news: {
            ...state.news,
            headlines,
          },
          rngState: rng.getState()
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
