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
    // Widened top-end revenue even further to allow for extreme high-ROI horror/indie anomalies.
    revenueRange: [1_000_000, 100_000_000],
  },
  mid: {
    key: 'mid',
    name: 'Mid Budget',
    label: '$20M',
    budget: 20_000_000,
    // Slightly increased weekly cost to represent modern rising crew rates.
    weeklyCost: 1_800_000,
    developmentWeeks: 8,
    productionWeeks: 12,
    revenueRange: [10_000_000, 80_000_000],
  },
  high: {
    key: 'high',
    name: 'High Budget',
    label: '$60M',
    // Bumped budget to 70M to reflect inflation of mid-tier to high-tier projects.
    budget: 70_000_000,
    // Steep weekly cost increase to penalize prolonged productions.
    weeklyCost: 4_500_000,
    developmentWeeks: 12,
    productionWeeks: 16,
    // Higher floor, but lower ceiling compared to risk to force careful greenlighting.
    revenueRange: [40_000_000, 250_000_000],
  },
  blockbuster: {
    key: 'blockbuster',
    name: 'Blockbuster',
    label: '$250M',
    // Increased base budget to $250M and weekly cost to $15M to severely punish delays and make tentpoles genuinely risky.
    budget: 250_000_000,
    weeklyCost: 15_000_000,
    developmentWeeks: 16,
    productionWeeks: 24,
    revenueRange: [100_000_000, 800_000_000],
  },
};
