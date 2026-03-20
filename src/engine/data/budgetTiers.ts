import { BudgetTierKey } from '../types';

interface BudgetTierData {
  key: BudgetTierKey;
  name: string;
  label: string;
  budget: number;
  weeklyCost: number;
  developmentWeeks: number;
  productionWeeks: number;
  revenueRange: [number, number];
}

export const BUDGET_TIERS: Record<BudgetTierKey, BudgetTierData> = {
  low: {
    key: 'low',
    name: 'Low Budget',
    label: '$5M',
    budget: 5_000_000,
    weeklyCost: 500_000,
    developmentWeeks: 6,
    productionWeeks: 8,
    revenueRange: [2_000_000, 25_000_000],
  },
  mid: {
    key: 'mid',
    name: 'Mid Budget',
    label: '$20M',
    budget: 20_000_000,
    weeklyCost: 1_500_000,
    developmentWeeks: 8,
    productionWeeks: 12,
    revenueRange: [10_000_000, 80_000_000],
  },
  high: {
    key: 'high',
    name: 'High Budget',
    label: '$60M',
    budget: 60_000_000,
    weeklyCost: 3_000_000,
    developmentWeeks: 12,
    productionWeeks: 16,
    revenueRange: [30_000_000, 200_000_000],
  },
  blockbuster: {
    key: 'blockbuster',
    name: 'Blockbuster',
    label: '$150M',
    budget: 150_000_000,
    weeklyCost: 6_000_000,
    developmentWeeks: 16,
    productionWeeks: 24,
    revenueRange: [80_000_000, 500_000_000],
  },
};
