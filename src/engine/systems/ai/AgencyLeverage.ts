import { Agency, Agent, Talent, MarketState } from '../../types';
import { clamp } from '../../utils';

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

export class AgencyLeverageEngine {
  /**
   * Calculates the total leverage score for a specific negotiation.
   */
  static calculateNegotiationLeverage(
    talent: Talent,
    agency: Agency | undefined,
    agent: Agent | undefined,
    market: MarketState,
    projectContext?: { buzz: number; budgetTier: string }
  ): LeverageResult {
    const _buzz = projectContext?.buzz || 0;
    const explanation: string[] = [];
    
    // 1. Base Talent Leverage (Primary driver)
    let talentEffect = 0.5; // Baseline
    
    // Project Heat (Buzz) multiplier
    if (_buzz > 80) {
      talentEffect += 0.1;
      explanation.push('High project buzz increases talent bargaining power.');
    }
    switch (talent.tier) {
      case 1: talentEffect += 0.4; explanation.push('A-List status provides maximum leverage.'); break;
      case 2: talentEffect += 0.2; explanation.push('B-List status provides solid bargaining ground.'); break;
      case 3: talentEffect += 0.15; explanation.push('Rising star momentum increases leverage.'); break;
      case 4: talentEffect -= 0.1; explanation.push('C-List status limits negotiation power.'); break;
      default: talentEffect -= 0.3; explanation.push('Newcomers have minimal standing.'); break;
    }

    // 2. Market Cycle Effect
    let marketEffect = 0;
    switch (market.cycle) {
      case 'BOOM': 
        marketEffect = 0.2; 
        explanation.push('Market boom: Talent has the upper hand.'); 
        break;
      case 'STABLE': 
        marketEffect = 0; 
        break;
      case 'BEAR': 
        marketEffect = -0.15; 
        explanation.push('Market cooling: Fees are under pressure.'); 
        break;
      case 'RECESSION': 
        marketEffect = -0.3; 
        explanation.push('Economic recession: Agencies are desperate for deals.'); 
        break;
      case 'RECOVERY': 
        marketEffect = 0.1; 
        explanation.push('Market recovery: Sentiment is improving.'); 
        break;
    }

    // 3. Agency & Agent Effect
    let agencyEffect = 0;
    if (agency) {
      switch (agency.tier) {
        case 'powerhouse': agencyEffect += 0.15; explanation.push(`${agency.name}'s powerhouse status adds significant weight.`); break;
        case 'major': agencyEffect += 0.1; break;
        case 'specialist': agencyEffect += 0.05; break;
        case 'boutique': agencyEffect -= 0.05; break;
      }
    }

    // 4. Agent Tactic
    let tacticEffect = 0;
    if (agent) {
      switch (agent.negotiationTactic) {
        case 'SHARK': 
          tacticEffect = 0.1; 
          explanation.push(`${agent.name} is using aggressive 'Shark' tactics.`); 
          break;
        case 'PRESTIGE': 
          tacticEffect = 0.05; 
          explanation.push(`${agent.name} is leveraging critical acclaim.`); 
          break;
        case 'VOLUME': 
          tacticEffect = -0.05; 
          explanation.push(`${agent.name} prefers deal velocity over top dollar.`); 
          break;
        case 'DIPLOMAT': 
          tacticEffect = 0; 
          break;
      }
    }

    // 5. Calculate Final Score
    const totalScore = clamp(talentEffect + marketEffect + agencyEffect + tacticEffect, 0, 1.0);

    return {
      score: totalScore,
      modifiers: {
        marketEffect,
        agencyEffect,
        talentEffect,
        tacticEffect
      },
      explanation
    };
  }

  /**
   * Applies leverage to a proposed fee.
   * Higher leverage results in higher minimum fee demands.
   */
  static getRequiredFee(baseFee: number, leverage: LeverageResult): number {
    const multiplier = 1.0 + (leverage.score - 0.5) * 0.5; // Ranges from 0.75x to 1.25x of base fee
    return Math.floor(baseFee * multiplier);
  }
}
