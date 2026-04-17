import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import {
  createFinanceLedgerSlice,
  FinanceLedgerSlice
} from './financeLedgerSlice';
import {
  createFinanceMarketingSlice,
  FinanceMarketingSlice
} from './financeMarketingSlice';
import {
  createFinanceUtilsSlice,
  FinanceUtilsSlice
} from './financeUtilsSlice';

export type FinanceSlice = FinanceLedgerSlice & FinanceMarketingSlice & FinanceUtilsSlice;

export const createFinanceSlice: StateCreator<GameStore, [], [], FinanceSlice> = (...args) => ({
  ...createFinanceLedgerSlice(...args),
  ...createFinanceMarketingSlice(...args),
  ...createFinanceUtilsSlice(...args)
});
