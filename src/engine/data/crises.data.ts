import { CrisisOption } from '../types';

export interface CrisisTemplate {
  id: string;
  description: string; // Now used as a fallback/hint for the Bard Engine
  options: CrisisOption[];
}

/**
 * CRISIS ARCHETYPES
 * These have been simplified to logic-only structures.
 * The Bard Engine (BardResolver) handles the dynamic narrative for both descriptions and options.
 */
export const CRISIS_POOLS: CrisisTemplate[] = [
  {
    id: 'PRODUCTION_SAFETY',
    description: "PRODUCTION_SAFETY", // Hint for Bard
    options: [
      {
        text: "BudgetExpansion", // Key for Bard to resolve option text
        effectDescription: "Inject emergency funds to solve the issue. Costs high cash.",
        cashPenalty: 1500000
      },
      {
        text: "Delay",
        effectDescription: "Push the release date back. Adds 3 weeks delay.",
        weeksDelay: 3
      },
      {
        text: "CuttingCorners",
        effectDescription: "Cut affected scenes. Lose 25 buzz.",
        buzzPenalty: 25
      }
    ]
  },
  {
    id: 'TALENT_PR',
    description: "PR",
    options: [
      {
        text: "Aggressive",
        effectDescription: "Hire a high-powered crisis management firm. Costs $250k.",
        cashPenalty: 250000
      },
      {
        text: "Apologetic",
        effectDescription: "Issue a sincere apology. Lose 10 reputation.",
        reputationPenalty: 10
      },
      {
        text: "Ignored",
        effectDescription: "Maintain radio silence. Lose 40 buzz.",
        buzzPenalty: 40
      }
    ]
  },
  {
    id: 'FINANCIAL_AUDIT',
    description: "MARKET",
    options: [
      {
        text: "Aggressive",
        effectDescription: "Fight the audit in court. Costs $1M in legal fees.",
        cashPenalty: 1000000
      },
      {
        text: "Apologetic",
        effectDescription: "Settle and pay the fine. Costs $500k and 5 reputation.",
        cashPenalty: 500000,
        reputationPenalty: 5
      },
      {
        text: "Ignored",
        effectDescription: "Do nothing. Risks a massive 30 reputation hit.",
        reputationPenalty: 30
      }
    ]
  },
  {
    id: 'TECHNICAL_FAILURE',
    description: "PRODUCTION",
    options: [
      {
        text: "BudgetExpansion",
        effectDescription: "Hire technical specialists. Costs $800k.",
        cashPenalty: 800000
      },
      {
        text: "Delay",
        effectDescription: "Repair systems properly. Adds 2 weeks delay.",
        weeksDelay: 2
      },
      {
        text: "CuttingCorners",
        effectDescription: "Work with damaged assets. Lose 20 buzz.",
        buzzPenalty: 20
      }
    ]
  }
];