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
    weeklyCost: 30_000,
    // The Studio Comptroller: Increased indie weekly cost and top-end revenue for horror hits.
    developmentWeeks: 4,
    productionWeeks: 4,
    revenueRange: [5_000, 20_000_000],
  },
  low: {
    key: 'low',
    name: 'Low Budget',
    label: '$5M',
    budget: 5_000_000,
    weeklyCost: 300_000,
    // The Studio Comptroller: Increased low-tier burn and massive 800M top-end to reward anomaly hits.
    developmentWeeks: 6,
    productionWeeks: 8,
    revenueRange: [50_000, 800_000_000],
  },
  mid: {
    key: 'mid',
    name: 'Mid Budget',
    label: '$30M',
    budget: 30_000_000,
    weeklyCost: 1_200_000,
    // The Studio Comptroller: Increased mid-tier burn.
    developmentWeeks: 8,
    productionWeeks: 12,
    revenueRange: [1_000_000, 600_000_000],
  },
  high: {
    key: 'high',
    name: 'High Budget',
    label: '$80M',
    budget: 80_000_000,
    weeklyCost: 3_500_000,
    // The Studio Comptroller: Higher base weekly cost to squeeze high-budget ROI.
    developmentWeeks: 12,
    productionWeeks: 16,
    // The Studio Comptroller: Adjusted high risk/reward.
    revenueRange: [5_000_000, 1_500_000_000],
  },
  blockbuster: {
    key: 'blockbuster',
    name: 'Blockbuster',
    label: '$200M',
    budget: 200_000_000,
    weeklyCost: 10_000_000,
    // The Studio Comptroller: Crushing 10M weekly cost to ensure blockbusters require massive momentum to avoid disaster.
    developmentWeeks: 16,
    productionWeeks: 24,
    // The Studio Comptroller: Lowered floor and increased burn so flops are devastating.
    revenueRange: [5_000_000, 3_000_000_000],
  },
};
