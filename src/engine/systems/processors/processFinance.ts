import { GameState, FinanceRecord } from '@/engine/types';
import { StateImpact } from '../../types/state.types';
import { calculateWeeklyCosts, calculateWeeklyRevenue } from '../finance';

export const processFinance = (
    state: GameState
): StateImpact => {
    const nextWeek = state.week + 1;
    const projectsObj = state.studio.internal.projects;
    const projectsArray = [];
    for (const key in projectsObj) {
        projectsArray.push(projectsObj[key]);
    }

    const costs = calculateWeeklyCosts(projectsArray, state.market.activeMarketEvents || []);
    const revenue = calculateWeeklyRevenue(projectsArray, state.studio.internal.contracts, state.market.activeMarketEvents || []);
    const newCash = state.cash - costs + revenue;

    let financeHistory = state.studio.internal.financeHistory || [];
    if (financeHistory.length >= 52) {
        financeHistory = financeHistory.slice(1);
    }
    const newHistory: FinanceRecord[] = new Array(financeHistory.length + 1);
    for (let i = 0; i < financeHistory.length; i++) newHistory[i] = financeHistory[i];
    newHistory[financeHistory.length] = { week: nextWeek, cash: newCash, revenue, costs };

    return {
        cashChange: revenue - costs,
        newFinanceHistory: newHistory
    };
};

