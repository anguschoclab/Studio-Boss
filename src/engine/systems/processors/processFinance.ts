import { GameState } from '@/engine/types';
import { generateWeeklyFinancialReport } from '../finance';

export function processFinance(state: GameState): GameState {
    const report = generateWeeklyFinancialReport(state);

    return {
        ...state,
        finance: {
            ...state.finance,
            cash: report.endingCash,
            ledger: [...state.finance.ledger, report].slice(-100), // Keep last 100 weeks
        }
    };
}

