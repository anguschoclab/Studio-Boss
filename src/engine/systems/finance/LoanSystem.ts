import { GameState, StateImpact } from "@/engine/types";
import { RandomGenerator } from "@/engine/utils/rng";

// ---------------------------------------------------------------------------
// Loan record – stored in state.studio.loans[]
// ---------------------------------------------------------------------------

export interface Loan {
  id: string;
  principal: number;
  interestRate: number; // annual rate, e.g. 0.08 for 8%
  weeklyPayment: number; // fixed payment each week
  weeksRemaining: number;
  startWeek: number;
  lenderName: string;
}

// ---------------------------------------------------------------------------
// Lender name pool (deterministic pick via rng)
// ---------------------------------------------------------------------------

const LENDER_NAMES = [
  "First National Bank",
  "Studio Hedge Fund",
  "Sunset Capital Partners",
  "Pacific Venture Lending",
  "Meridian Film Finance",
  "Goldcrest Credit Corp",
  "Paramount Lending Group",
  "Apex Studio Finance",
];

// ---------------------------------------------------------------------------
// createLoan – pure factory, called from the store action
// ---------------------------------------------------------------------------

export function createLoan(
  amount: number,
  termWeeks: number,
  loanRate: number,
  startWeek: number
): Loan {
  // Weekly interest = annual rate / 52
  const weeklyInterestRate = loanRate / 52;
  // Amortised weekly payment: P * r / (1 - (1+r)^-n)
  let weeklyPayment: number;
  if (weeklyInterestRate === 0) {
    weeklyPayment = amount / termWeeks;
  } else {
    weeklyPayment =
      (amount * weeklyInterestRate) / (1 - Math.pow(1 + weeklyInterestRate, -termWeeks));
  }

  // Deterministic ID from start week + amount (no rand() to keep engine pure)
  const id = `loan-${startWeek}-${Math.round(amount)}`;

  // Pick a lender name deterministically from the amount hash
  const lenderIndex = Math.abs(Math.round(amount) + startWeek) % LENDER_NAMES.length;
  const lenderName = LENDER_NAMES[lenderIndex];

  return {
    id,
    principal: amount,
    interestRate: loanRate,
    weeklyPayment: Math.round(weeklyPayment),
    weeksRemaining: termWeeks,
    startWeek,
    lenderName,
  };
}

// ---------------------------------------------------------------------------
// tickLoans – called each week by WeekCoordinator
// ---------------------------------------------------------------------------

export function tickLoans(state: GameState, _rng: RandomGenerator): StateImpact[] {
  const loans: Loan[] = state.studio.loans || [];

  const impacts: StateImpact[] = [];
  let totalPayments = 0;

  for (const loan of loans) {
    if (loan.weeksRemaining <= 0) continue;

    const payment = loan.weeklyPayment;
    totalPayments += payment;
    const isFinalPayment = loan.weeksRemaining === 1;

    // Deduct payment from cash — a single debit, not two.
    impacts.push({
      type: "FUNDS_DEDUCTED",
      payload: { amount: payment },
    });

    if (isFinalPayment) {
      impacts.push({
        type: "NEWS_ADDED",
        payload: {
          headline: `Loan to ${loan.lenderName} fully repaid`,
          description: `Your studio has completed all payments on the $${(loan.principal / 1_000_000).toFixed(0)}M loan from ${loan.lenderName}. The debt has been cleared.`,
          category: "general",
        },
      });
    }

    // weeksRemaining is decremented by WeekCoordinator's studio.loans update;
    // no loan-tick impact is needed here.
  }

  // Bankruptcy runs even with no outstanding loans and accounts for this
  // tick's payments so a debit that pushes cash under the floor is caught now.
  const bankruptcyImpact = checkBankruptcy(state, totalPayments);
  if (bankruptcyImpact) {
    impacts.push(bankruptcyImpact);
  }

  return impacts;
}

// ---------------------------------------------------------------------------
// checkBankruptcy – returns MODAL_TRIGGERED impact or null
// ---------------------------------------------------------------------------

export function checkBankruptcy(state: GameState, pendingPayments = 0): StateImpact | null {
  const cash = state.finance.cash - pendingPayments;

  if (cash >= -500_000) return null;

  return {
    type: "MODAL_TRIGGERED",
    payload: {
      modalType: "GAME_OVER",
      priority: 999,
      payload: {
        reason: "bankruptcy",
        cashDeficit: Math.abs(cash),
      },
    },
  };
}
