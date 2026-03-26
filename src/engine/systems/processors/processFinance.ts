import { GameState, FinanceRecord } from '@/engine/types';
import { calculateWeeklyCosts, calculateWeeklyRevenue } from '../finance';

export interface WeeklyChanges {
    projectUpdates: string[];
    events: string[];
    newHeadlines: any[];
    costs: number;
    revenue: number;
    newsEvents: any[];
}

export const processFinance = (
    state: GameState,
    weeklyChanges: WeeklyChanges
): GameState => {
    const nextWeek = state.week + 1;
    const costs = calculateWeeklyCosts(state.studio.internal.projects, state.market.activeMarketEvents || []);
    const revenue = calculateWeeklyRevenue(state.studio.internal.projects, state.studio.internal.contracts, state.market.activeMarketEvents || []);
    const newCash = state.cash - costs + revenue;

    let financeHistory = state.studio.internal.financeHistory;
    if (financeHistory.length >= 52) {
        financeHistory = financeHistory.slice(1);
    }
    const newHistory: FinanceRecord[] = new Array(financeHistory.length + 1);
    for (let i = 0; i < financeHistory.length; i++) newHistory[i] = financeHistory[i];
    newHistory[financeHistory.length] = { week: nextWeek, cash: newCash, revenue, costs };
    
    weeklyChanges.costs += costs;
    weeklyChanges.revenue += revenue;

    return { 
        ...state, 
        cash: newCash, 
        studio: { 
            ...state.studio, 
            internal: { 
                ...state.studio.internal, 
                financeHistory: newHistory 
            } 
        } 
    };
};
