import {StateCreator} from "zustand";
import {GameStore} from "../gameStore";
import {createLoan} from "@/engine/systems/finance/LoanSystem";

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

export const createLoanSlice: StateCreator<GameStore, [], [], LoanSlice> = (set, _get) => ({
  // -------------------------------------------------------------------------
  // addLoan: generate a Loan, add it to studio.loans, credit cash
  // -------------------------------------------------------------------------
  addLoan: (amount: number, termWeeks: number) => {
    set((s) => {
      if (!s.gameState) return s;

      const state = s.gameState;
      const loanRate = state.finance.marketState?.loanRate ?? 0.08;
      const loan = createLoan(amount, termWeeks, loanRate, state.week);

      const existingLoans = state.studio.loans || [];
      const updatedLoans = [...existingLoans, loan];

      const newCash = state.finance.cash + amount;

      return {
        gameState: {
          ...state,
          finance: {
            ...state.finance,
            cash: newCash,
          },
          studio: {
            ...state.studio,
            loans: updatedLoans,
          },
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
      const loans = state.studio.loans || [];
      const loan = loans.find((l) => l.id === loanId);

      if (!loan) return s;

      // Remaining balance: weeksRemaining × weeklyPayment
      const remainingBalance = loan.weeklyPayment * loan.weeksRemaining;

      if (state.finance.cash < remainingBalance) return s; // Can't afford it

      const newCash = state.finance.cash - remainingBalance;
      const updatedLoans = loans.filter((l) => l.id !== loanId);

      return {
        gameState: {
          ...state,
          finance: {
            ...state.finance,
            cash: newCash,
          },
          studio: {
            ...state.studio,
            loans: updatedLoans,
          },
        },
      };
    });
  },
});
