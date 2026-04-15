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
    // The Studio Comptroller: Increased upside for indie hits to 25M while lowering floor to 1k for complete flops.
    revenueRange: [1_000, 25_000_000],
  },
  low: {
    key: 'low',
    name: 'Low Budget',
    label: '$5M',
    budget: 5_000_000,
    weeklyCost: 250_000,
    developmentWeeks: 6,
    productionWeeks: 8,
    // The Studio Comptroller: Expanded top bound to 1B for micro-budget horror anomalies, dropped floor to 10k to emphasize risk.
    revenueRange: [10_000, 1_000_000_000],
  },
  mid: {
    key: 'mid',
    name: 'Mid Budget',
    label: '$30M',
    budget: 30_000_000,
    weeklyCost: 1_000_000,
    developmentWeeks: 8,
    productionWeeks: 12,
    // The Studio Comptroller: Pushed mid-tier ceiling to 800M to allow for breakout comedy/action hits, lowered floor to 100k.
    revenueRange: [100_000, 800_000_000],
  },
  high: {
    key: 'high',
    name: 'High Budget',
    label: '$80M',
    budget: 80_000_000,
    weeklyCost: 3_000_000,
    developmentWeeks: 12,
    productionWeeks: 16,
    // The Studio Comptroller: Increased high budget ceiling to 2B to simulate modern IP expansions.
    revenueRange: [1_000_000, 2_000_000_000],
  },
  blockbuster: {
    key: 'blockbuster',
    name: 'Blockbuster',
    label: '$200M',
    budget: 200_000_000,
    // The Studio Comptroller: Increased burn rate to 12M to make blockbuster stakes genuinely terrifying for cashflow.
    weeklyCost: 12_000_000,
    developmentWeeks: 16,
    productionWeeks: 24,
    // The Studio Comptroller: Lowered floor to 1M and increased ceiling to 4B, creating massive variance and punishing weak IP.
    revenueRange: [1_000_000, 4_000_000_000],
  },
};
