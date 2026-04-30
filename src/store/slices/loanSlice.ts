import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { createLoan, Loan } from '@/engine/systems/finance/LoanSystem';

// ---------------------------------------------------------------------------
// Slice interface
// ---------------------------------------------------------------------------

export interface LoanSlice {
  addLoan: (amount: number, termWeeks: number) => void;
  repayLoanEarly: (loanId: string) => void;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export const createLoanSlice: StateCreator<GameStore, [], [], LoanSlice> = (set, get) => ({

  // -------------------------------------------------------------------------
  // addLoan: generate a Loan, add it to studio.loans, credit cash
  // -------------------------------------------------------------------------
  addLoan: (amount: number, termWeeks: number) => {
    set((s) => {
      if (!s.gameState) return s;

      const state = s.gameState;
      const loanRate = state.finance.marketState?.loanRate ?? 0.08;
      const loan = createLoan(amount, termWeeks, loanRate, state.week);

      const existingLoans: Loan[] = (state.studio as any).loans || [];
      const updatedLoans = [...existingLoans, loan];

      const newCash = state.finance.cash + amount;

      return {
        finance: {
          ...s.finance,
          cash: newCash,
        },
        gameState: {
          ...state,
          finance: {
            ...state.finance,
            cash: newCash,
          },
          studio: {
            ...state.studio,
            loans: updatedLoans,
          } as any,
        },
      };
    });
  },

  // -------------------------------------------------------------------------
  // repayLoanEarly: pay off remaining balance, remove loan from array
  // -------------------------------------------------------------------------
  repayLoanEarly: (loanId: string) => {
    set((s) => {
      if (!s.gameState) return s;

      const state = s.gameState;
      const loans: Loan[] = (state.studio as any).loans || [];
      const loan = loans.find((l) => l.id === loanId);

      if (!loan) return s;

      // Remaining balance: weeksRemaining × weeklyPayment
      const remainingBalance = loan.weeklyPayment * loan.weeksRemaining;

      if (state.finance.cash < remainingBalance) return s; // Can't afford it

      const newCash = state.finance.cash - remainingBalance;
      const updatedLoans = loans.filter((l) => l.id !== loanId);

      return {
        finance: {
          ...s.finance,
          cash: newCash,
        },
        gameState: {
          ...state,
          finance: {
            ...state.finance,
            cash: newCash,
          },
          studio: {
            ...state.studio,
            loans: updatedLoans,
          } as any,
        },
      };
    });
  },
});
