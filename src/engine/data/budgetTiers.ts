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
    // Increased weekly cost from 500k to 600k for inflation adjustments. Increased to 750k to raise stakes.
    weeklyCost: 900_000, // The Studio Comptroller: Further increased base cost to heighten early-game risk.
    developmentWeeks: 6,
    productionWeeks: 8,
    // The Studio Comptroller: Widened top-end revenue further to allow for extreme high-ROI horror/indie breakout anomalies.
    revenueRange: [10_000, 1_500_000_000], // The Studio Comptroller: Widened ceiling to 1.5B to allow massive Blair Witch style sleeper anomalies.
  },
  mid: {
    key: 'mid',
    name: 'Mid Budget',
    label: '$30M',
    budget: 30_000_000,
    // Increased weekly cost to 2.5M to represent modern rising crew rates.
    weeklyCost: 3_000_000, // The Studio Comptroller: Increased weekly cost to simulate rising mid-tier crew rates.
    developmentWeeks: 8,
    productionWeeks: 12,
    // The Studio Comptroller: Lowered floor to $250k to increase risk and raised ceiling to $250M for overperforming sleepers.
    revenueRange: [250_000, 250_000_000], // The Studio Comptroller: Lowered floor to 250k to drastically increase flop risk.
  },
  high: {
    key: 'high',
    name: 'High Budget',
    label: '$80M',
    // Bumped budget to 80M to reflect inflation of mid-tier to high-tier projects.
    budget: 80_000_000,
    // Steep weekly cost increase to penalize prolonged productions.
    weeklyCost: 8_000_000, // The Studio Comptroller: Steeply increased weekly cost to severely penalize prolonged high-tier productions.
    developmentWeeks: 12,
    productionWeeks: 16,
    // The Studio Comptroller: Lowered floor to $10M for stronger flop penalization, raised ceiling to $500M.
    revenueRange: [10_000_000, 500_000_000],
  },
  blockbuster: {
    key: 'blockbuster',
    name: 'Blockbuster',
    label: '$200M',
    // The Studio Comptroller: Adjusted blockbuster budget down to $200M to align with realistic scaling, but expanded revenue range to ensure catastrophic bomb risk and massive upside.
    budget: 200_000_000,
    // The Studio Comptroller: Increased base weekly cost from $35M to $45M to exponentially increase cashflow drain on delayed blockbusters.
    weeklyCost: 65_000_000, // The Studio Comptroller: Unforgiving cashflow drain on delayed blockbusters to prevent snowballing.
    developmentWeeks: 16,
    productionWeeks: 24,
    // The Studio Comptroller: Lowered floor to $100k to simulate catastrophic, studio-bankrupting box office bombs. Increased upside to $4.0B
    revenueRange: [100_000, 4_000_000_000], // The Studio Comptroller: Floor lowered to 100k for apocalyptic bombs, ceiling to 4B for cultural milestones.
  },
};
