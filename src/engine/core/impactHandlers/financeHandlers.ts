import { GameState } from "@/engine/types";
import type {
  FundsImpact,
  FundsDeductedImpact,
  LedgerImpact,
  FinanceSnapshotImpact,
  SyncMAFundsImpact,
  FinanceTransactionImpact,
  MarketEventUpdateImpact,
} from "@/engine/types/state.types";

/**
 * Finance-related impact handlers
 * Pure functions that apply finance-related state impacts
 */

export function handleFundsChanged(state: GameState, impact: FundsImpact): GameState {
  const { amount } = impact.payload;
  return {
    ...state,
    finance: {
      ...state.finance,
      cash: state.finance.cash + amount,
    },
  };
}

export function handleLedgerUpdated(state: GameState, impact: LedgerImpact): GameState {
  const { report } = impact.payload;
  return {
    ...state,
    finance: {
      ...state.finance,
      ledger: [report, ...state.finance.ledger].slice(0, 100),
    },
  };
}

export function handleFinanceSnapshotAdded(state: GameState, impact: FinanceSnapshotImpact): GameState {
  const { snapshot } = impact.payload;
  return {
    ...state,
    finance: {
      ...state.finance,
      weeklyHistory: [snapshot, ...state.finance.weeklyHistory].slice(0, 52),
    },
  };
}

export function handleSyncMAFunds(state: GameState, impact: SyncMAFundsImpact): GameState {
  const { amount } = impact.payload;
  return {
    ...state,
    finance: {
      ...state.finance,
      cash: state.finance.cash + amount,
    },
  };
}

export function handleFundsDeducted(state: GameState, impact: FundsDeductedImpact): GameState {
  const amount = impact.payload?.amount ?? impact.cashChange ?? 0;
  return {
    ...state,
    finance: {
      ...state.finance,
      cash: state.finance.cash - amount,
    },
  };
}

export function handleFinanceTransaction(state: GameState, impact: FinanceTransactionImpact): GameState {
  const { amount, targetId } = impact.payload;
  if (targetId && targetId !== "player") {
    const rivals = { ...state.entities.rivals };
    if (rivals[targetId]) {
      rivals[targetId] = { ...rivals[targetId], cash: rivals[targetId].cash + amount };
    }
    return {
      ...state,
      entities: {
        ...state.entities,
        rivals,
      },
    };
  }
  return handleFundsChanged(state, { type: "FUNDS_CHANGED", payload: { amount } });
}

export function handleMarketEventUpdated(state: GameState, impact: MarketEventUpdateImpact): GameState {
  const { events, marketState } = impact.payload;
  return {
    ...state,
    market: {
      ...state.market,
      activeMarketEvents: events || state.market.activeMarketEvents,
    },
    finance: {
      ...state.finance,
      marketState: marketState || state.finance.marketState,
    },
  };
}
