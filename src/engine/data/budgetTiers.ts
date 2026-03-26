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
    // Increased weekly cost from 500k to 600k for inflation adjustments
    weeklyCost: 600_000,
    developmentWeeks: 6,
    productionWeeks: 8,
    // The Studio Comptroller: Widened top-end revenue further to $300M to allow for extreme high-ROI horror/indie anomalies, and lowered floor to $50k for brutal bomb risk.
    revenueRange: [50_000, 300_000_000],
  },
  mid: {
    key: 'mid',
    name: 'Mid Budget',
    label: '$25M',
    budget: 25_000_000,
    // Increased weekly cost to 2M to represent modern rising crew rates.
    weeklyCost: 2_000_000,
    developmentWeeks: 8,
    productionWeeks: 12,
    revenueRange: [5_000_000, 100_000_000],
  },
  high: {
    key: 'high',
    name: 'High Budget',
    label: '$70M',
    // Bumped budget to 70M to reflect inflation of mid-tier to high-tier projects.
    budget: 70_000_000,
    // Steep weekly cost increase to penalize prolonged productions.
    weeklyCost: 5_000_000,
    developmentWeeks: 12,
    productionWeeks: 16,
    // Higher floor, but lower ceiling compared to risk to force careful greenlighting.
    revenueRange: [40_000_000, 250_000_000],
  },
  blockbuster: {
    key: 'blockbuster',
    name: 'Blockbuster',
    label: '$300M',
    // Increased base budget to $300M and weekly cost to $20M to severely punish delays and make tentpoles genuinely risky.
    budget: 300_000_000,
    // The Studio Comptroller: Increased base weekly cost from $25M to $30M to exponentially increase cashflow drain on delayed blockbusters.
    weeklyCost: 30_000_000,
    developmentWeeks: 16,
    productionWeeks: 24,
    // The Studio Comptroller: Lowered floor to $10M to simulate catastrophic, studio-bankrupting box office bombs.
    revenueRange: [10_000_000, 1_200_000_000],
  },
};
