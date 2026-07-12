import { Agency, Agent, Talent, MarketState } from "../../types";
import { clamp } from "../../utils";
import { AGENCY_ARCHETYPES } from "../../data/archetypes";

/**
 * Phase 7: Agency Leverage Engine.
 * Calculates the 'Negotiation Leverage' which determines fee floors, backend demands,
 * and the likelihood of talent 'walking away' from a deal.
 */

export interface LeverageResult {
  score: number; // 0.0 to 1.0
  modifiers: {
    marketEffect: number;
    agencyEffect: number;
    talentEffect: number;
    tacticEffect: number;
  };
  explanation: string[];
}

const TALENT_TIER_EFFECTS: Record<number, { effect: number; explanation: string }> = {
  1: { effect: 0.4, explanation: "A-List status provides maximum leverage." },
  2: { effect: 0.2, explanation: "B-List status provides solid bargaining ground." },
  3: { effect: 0.15, explanation: "Rising star momentum increases leverage." },
  4: { effect: -0.1, explanation: "C-List status limits negotiation power." },
};

const MARKET_CYCLE_EFFECTS: Record<string, { effect: number; explanation: string }> = {
  BOOM: { effect: 0.2, explanation: "Market boom: Talent has the upper hand." },
  BEAR: { effect: -0.15, explanation: "Market cooling: Fees are under pressure." },
  RECESSION: { effect: -0.3, explanation: "Economic recession: Agencies are desperate for deals." },
  RECOVERY: { effect: 0.1, explanation: "Market recovery: Sentiment is improving." },
  STABLE: { effect: 0, explanation: "" },
};

const AGENCY_TIER_EFFECTS: Record<string, { effect: number; explanation?: string }> = {
  powerhouse: { effect: 0.15, explanation: "powerhouse status adds significant weight." },
  major: { effect: 0.1 },
  specialist: { effect: 0.05 },
  boutique: { effect: -0.05 },
};

const TACTIC_BASE_EFFECTS: Record<
  string,
  { effect: number; explanation: string; alignmentExplanation: string }
> = {
  SHARK: {
    effect: 0.1,
    explanation: "is using aggressive 'Shark' tactics.",
    alignmentExplanation:
      "is using aggressive 'Shark' tactics, aligned with {archetype} archetype.",
  },
  PRESTIGE: {
    effect: 0.05,
    explanation: "is leveraging critical acclaim.",
    alignmentExplanation: "is leveraging critical acclaim, aligned with {archetype} archetype.",
  },
  VOLUME: {
    effect: -0.05,
    explanation: "prefers deal velocity over top dollar.",
    alignmentExplanation:
      "prefers deal velocity over top dollar, aligned with {archetype} archetype.",
  },
  DIPLOMAT: {
    effect: 0,
    explanation: "is using diplomatic tactics.",
    alignmentExplanation: "is using diplomatic tactics, aligned with {archetype} archetype.",
  },
};

export const AgencyLeverageEngine = {
  /**
   * Calculates the total leverage score for a specific negotiation.
   */
  calculateNegotiationLeverage(
    talent: Talent,
    agency: Agency | undefined,
    agent: Agent | undefined,
    market: MarketState,
    projectContext?: { buzz: number; budgetTier: string }
  ): LeverageResult {
    const _buzz = projectContext?.buzz || 0;
    const explanation: string[] = [];

    // 1. Base Talent Leverage
    let talentEffect = 0.5;
    if (_buzz > 80) {
      talentEffect += 0.1;
      explanation.push("High project buzz increases talent bargaining power.");
    }

    const tierImpact = TALENT_TIER_EFFECTS[talent.tier];
    if (tierImpact) {
      talentEffect += tierImpact.effect;
      explanation.push(tierImpact.explanation);
    } else {
      talentEffect -= 0.3;
      explanation.push("Newcomers have minimal standing.");
    }

    // 2. Market Cycle Effect
    const cycleImpact = MARKET_CYCLE_EFFECTS[market.cycle];
    let marketEffect = 0;
    if (cycleImpact) {
      marketEffect = cycleImpact.effect;
      if (cycleImpact.explanation) explanation.push(cycleImpact.explanation);
    }

    // 3. Agency & Agent Effect
    let agencyEffect = 0;
    if (agency) {
      const archetype = agency.culture
        ? AGENCY_ARCHETYPES[agency.culture as keyof typeof AGENCY_ARCHETYPES]
        : undefined;
      if (archetype) {
        const leverageBonus = (archetype.leverage_base / 100) * 0.2;
        agencyEffect += leverageBonus;
        explanation.push(
          `${agency.name}'s ${archetype.name} archetype provides leverage base of ${archetype.leverage_base}.`
        );
      } else {
        const tierImpact = AGENCY_TIER_EFFECTS[agency.tier];
        if (tierImpact) {
          agencyEffect += tierImpact.effect;
          if (tierImpact.explanation)
            explanation.push(`${agency.name}'s ${tierImpact.explanation}`);
        }
      }
    }

    // 4. Agent Tactic
    let tacticEffect = 0;
    if (agent) {
      const archetype = agency?.culture
        ? AGENCY_ARCHETYPES[agency.culture as keyof typeof AGENCY_ARCHETYPES]
        : undefined;
      const tacticMatchesArchetype = archetype?.negotiation_tactic_preferences.includes(
        agent.negotiationTactic.toUpperCase()
      );
      const tacticImpact = TACTIC_BASE_EFFECTS[agent.negotiationTactic.toUpperCase()];

      if (tacticImpact) {
        tacticEffect = tacticImpact.effect;
        if (tacticMatchesArchetype) {
          tacticEffect += 0.05;
          explanation.push(
            `${agent.name} ${tacticImpact.alignmentExplanation.replace("{archetype}", archetype?.name || "")}`
          );
        } else {
          explanation.push(`${agent.name} ${tacticImpact.explanation}`);
        }
      }
    }

    // 5. Calculate Final Score
    const totalScore = clamp(talentEffect + marketEffect + agencyEffect + tacticEffect, 0, 1.0);

    return {
      score: totalScore,
      modifiers: { marketEffect, agencyEffect, talentEffect, tacticEffect },
      explanation,
    };
  },

  getRequiredFee(baseFee: number, leverage: LeverageResult): number {
    const multiplier = 1.0 + (leverage.score - 0.5) * 0.5;
    return Math.floor(baseFee * multiplier);
  },
};
