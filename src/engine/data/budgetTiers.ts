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
  low: {
    key: 'low',
    name: 'Low Budget',
    label: '$5M',
    budget: 5_000_000,
    // The Studio Comptroller: Rebalanced base cost and revenue range for realistic scaling.
    weeklyCost: 250_000, // The Studio Comptroller: Rebalanced base cost and revenue range for realistic scaling.
    developmentWeeks: 6,
    productionWeeks: 8,
    // The Studio Comptroller: Rebalanced base cost and revenue range for realistic scaling.
    revenueRange: [100_000, 350_000_000], // The Studio Comptroller: Rebalanced base cost and revenue range for realistic scaling.
  },
  mid: {
    key: 'mid',
    name: 'Mid Budget',
    label: '$30M',
    budget: 30_000_000,
    // The Studio Comptroller: Rebalanced base cost and revenue range for realistic scaling.
    weeklyCost: 1_000_000, // The Studio Comptroller: Rebalanced base cost and revenue range for realistic scaling.
    developmentWeeks: 8,
    productionWeeks: 12,
    // The Studio Comptroller: Rebalanced base cost and revenue range for realistic scaling.
    revenueRange: [1_000_000, 600_000_000], // The Studio Comptroller: Rebalanced base cost and revenue range for realistic scaling.
  },
  high: {
    key: 'high',
    name: 'High Budget',
    label: '$80M',
    // Bumped budget to 80M to reflect inflation of mid-tier to high-tier projects.
    budget: 80_000_000,
    // The Studio Comptroller: Rebalanced base cost and revenue range for realistic scaling.
    weeklyCost: 3_000_000, // The Studio Comptroller: Rebalanced base cost and revenue range for realistic scaling.
    developmentWeeks: 12,
    productionWeeks: 16,
    // The Studio Comptroller: Rebalanced base cost and revenue range for realistic scaling.
    revenueRange: [10_000_000, 1_200_000_000], // The Studio Comptroller: Rebalanced base cost and revenue range for realistic scaling.
  },
  blockbuster: {
    key: 'blockbuster',
    name: 'Blockbuster',
    label: '$200M',
    // The Studio Comptroller: Adjusted blockbuster budget down to $200M to align with realistic scaling, but expanded revenue range to ensure catastrophic bomb risk and massive upside.
    budget: 200_000_000,
    // The Studio Comptroller: Rebalanced base cost and revenue range for realistic scaling.
    weeklyCost: 6_000_000, // The Studio Comptroller: Rebalanced base cost and revenue range for realistic scaling.
    developmentWeeks: 16,
    productionWeeks: 24,
    // The Studio Comptroller: Rebalanced base cost and revenue range for realistic scaling.
    revenueRange: [50_000_000, 2_500_000_000], // The Studio Comptroller: Rebalanced base cost and revenue range for realistic scaling.
  },
};
