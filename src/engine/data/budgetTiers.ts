import { BudgetTierKey } from '@/engine/types';

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
  indie: {
    key: 'indie',
    name: 'Indie Budget',
    label: '$500K',
    budget: 500_000,
    weeklyCost: 25_000,
    developmentWeeks: 4,
    productionWeeks: 4,
    revenueRange: [10_000, 10_000_000],
  },
  low: {
    key: 'low',
    name: 'Low Budget',
    label: '$5M',
    budget: 5_000_000,
    weeklyCost: 250_000,
    developmentWeeks: 6,
    productionWeeks: 8,
    revenueRange: [100_000, 350_000_000],
  },
  mid: {
    key: 'mid',
    name: 'Mid Budget',
    label: '$30M',
    budget: 30_000_000,
    weeklyCost: 1_000_000,
    developmentWeeks: 8,
    productionWeeks: 12,
    revenueRange: [1_000_000, 600_000_000],
  },
  high: {
    key: 'high',
    name: 'High Budget',
    label: '$80M',
    budget: 80_000_000,
    weeklyCost: 3_000_000,
    developmentWeeks: 12,
    productionWeeks: 16,
    revenueRange: [10_000_000, 1_200_000_000],
  },
  blockbuster: {
    key: 'blockbuster',
    name: 'Blockbuster',
    label: '$200M',
    budget: 200_000_000,
    weeklyCost: 6_000_000,
    developmentWeeks: 16,
    productionWeeks: 24,
    revenueRange: [50_000_000, 2_500_000_000],
  },
};
