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
    // Increased weekly cost from 500k to 600k for inflation adjustments
    weeklyCost: 600_000,
    developmentWeeks: 6,
    productionWeeks: 8,
    // The Studio Comptroller: Widened top-end revenue further to $400M to allow for extreme high-ROI horror/indie anomalies, and lowered floor to $50k for brutal bomb risk.
    revenueRange: [50_000, 400_000_000],
  },
  mid: {
    key: 'mid',
    name: 'Mid Budget',
    label: '$30M',
    budget: 30_000_000,
    // Increased weekly cost to 2.5M to represent modern rising crew rates.
    weeklyCost: 2_500_000,
    developmentWeeks: 8,
    productionWeeks: 12,
    revenueRange: [2_000_000, 150_000_000],
  },
  high: {
    key: 'high',
    name: 'High Budget',
    label: '$80M',
    // Bumped budget to 80M to reflect inflation of mid-tier to high-tier projects.
    budget: 80_000_000,
    // Steep weekly cost increase to penalize prolonged productions.
    weeklyCost: 6_000_000,
    developmentWeeks: 12,
    productionWeeks: 16,
    // Higher floor, but lower ceiling compared to risk to force careful greenlighting.
    revenueRange: [20_000_000, 350_000_000],
  },
  blockbuster: {
    key: 'blockbuster',
    name: 'Blockbuster',
    label: '$200M',
    // The Studio Comptroller: Adjusted blockbuster budget down to $200M to align with realistic scaling, but expanded revenue range to ensure catastrophic bomb risk and massive upside.
    budget: 200_000_000,
    // The Studio Comptroller: Increased base weekly cost from $25M to $30M to exponentially increase cashflow drain on delayed blockbusters. Adjusted to 25M for balance.
    weeklyCost: 25_000_000,
    developmentWeeks: 16,
    productionWeeks: 24,
    // The Studio Comptroller: Lowered floor to $5M to simulate catastrophic, studio-bankrupting box office bombs. Increased upside to $1.5B
    revenueRange: [5_000_000, 1_500_000_000],
  },
};
