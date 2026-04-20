import { Talent, Agent, Agency, TalentPersonality } from '../../types/talent.types';
import { AGENCY_ARCHETYPES } from '../../data/archetypes';
import { PERSONALITY_TRAITS } from '../../data/talentArchetypes';
import { RandomGenerator } from '../../utils/rng';

/**
 * Agent personality types
 * These define the agent's approach to talent management and negotiation
 */
export type AgentPersonality = 
  | 'shark'        // Aggressive, profit-focused
  | 'diplomat'     // Relationship-focused, collaborative
  | 'prestige'     // Awards-focused, reputation-driven
  | 'volume'       // High-volume, deal-focused
  | 'protector'    // Talent welfare-focused
  | 'visionary';   // Long-term career planning

/**
 * Agent personality configuration
 */
export interface AgentPersonalityConfig {
  personality: AgentPersonality;
  description: string;
  negotiationBonus: number; // -20 to +20
  relationshipGrowthRate: number; // 0-100
  loyaltyBonus: number; // 0-100
  riskTolerance: number; // 0-100
}

/**
 * Agent personality configurations
 */
export const AGENT_PERSONALITIES: Record<AgentPersonality, AgentPersonalityConfig> = {
  shark: {
    personality: 'shark',
    description: 'Aggressive negotiator who maximizes profit at all costs',
    negotiationBonus: 20,
    relationshipGrowthRate: 30,
    loyaltyBonus: 20,
    riskTolerance: 80
  },
  diplomat: {
    personality: 'diplomat',
    description: 'Relationship-focused agent who prioritizes harmony and long-term partnerships',
    negotiationBonus: 0,
    relationshipGrowthRate: 80,
    loyaltyBonus: 60,
    riskTolerance: 40
  },
  prestige: {
    personality: 'prestige',
    description: 'Awards-focused agent who seeks high-profile projects and critical acclaim',
    negotiationBonus: 10,
    relationshipGrowthRate: 50,
    loyaltyBonus: 40,
    riskTolerance: 60
  },
  volume: {
    personality: 'volume',
    description: 'High-volume agent who prioritizes deal velocity over maximizing individual deals',
    negotiationBonus: -10,
    relationshipGrowthRate: 40,
    loyaltyBonus: 30,
    riskTolerance: 50
  },
  protector: {
    personality: 'protector',
    description: 'Talent welfare-focused agent who protects clients from exploitation',
    negotiationBonus: 5,
    relationshipGrowthRate: 90,
    loyaltyBonus: 80,
    riskTolerance: 20
  },
  visionary: {
    personality: 'visionary',
    description: 'Long-term career planner who focuses on strategic career development',
    negotiationBonus: 10,
    relationshipGrowthRate: 60,
    loyaltyBonus: 50,
    riskTolerance: 70
  }
};

/**
 * Talent-agent relationship state
 */
export interface TalentAgentRelationship {
  talentId: string;
  agentId: string;
  relationshipScore: number; // 0-100
  history: {
    successfulDeals: number;
    failedDeals: number;
    totalDeals: number;
    yearsTogether: number;
  };
  synergy: number; // -50 to +50
  lastInteractionWeek?: number;
}

/**
 * Compatibility score between talent personality and agent personality
 */
export interface CompatibilityScore {
  score: number; // -100 to +100
  factors: string[];
  synergy: number; // -50 to +50
}

/**
 * Talent-Agent Interaction Engine
 * Manages the compatibility, relationships, and synergy between talents and their agents
 */
export const TalentAgentInteractionEngine = {
  /**
   * Calculate compatibility between talent personality and agent personality
   */
  calculateCompatibility(
    talentPersonality: TalentPersonality,
    agentPersonality: AgentPersonality,
    agencyArchetype?: string
  ): CompatibilityScore {
    const factors: string[] = [];
    let score = 0;

    // Personality trait compatibility matrix
    const compatibilityMatrix: Record<TalentPersonality, Record<AgentPersonality, number>> = {
      perfectionist: {
        shark: -20, diplomat: 10, prestige: 20, volume: -10, protector: 15, visionary: 10
      },
      collaborative: {
        shark: -15, diplomat: 30, prestige: 15, volume: 10, protector: 25, visionary: 20
      },
      difficult: {
        shark: 20, diplomat: -20, prestige: 10, volume: -10, protector: -15, visionary: 5
      },
      charismatic: {
        shark: 15, diplomat: 20, prestige: 25, volume: 15, protector: 10, visionary: 20
      },
      method: {
        shark: -10, diplomat: 5, prestige: 25, volume: -20, protector: 10, visionary: 20
      },
      pragmatic: {
        shark: 10, diplomat: 15, prestige: 5, volume: 25, protector: 10, visionary: 15
      },
      artistic: {
        shark: -25, diplomat: 10, prestige: 30, volume: -15, protector: 15, visionary: 25
      },
      commercial: {
        shark: 25, diplomat: 5, prestige: -10, volume: 20, protector: -5, visionary: 10
      },
      loyal: {
        shark: -20, diplomat: 30, prestige: 15, volume: 10, protector: 30, visionary: 20
      },
      ambitious: {
        shark: 20, diplomat: 10, prestige: 20, volume: 15, protector: -10, visionary: 25
      }
    };

    const baseScore = compatibilityMatrix[talentPersonality]?.[agentPersonality] || 0;
    score += baseScore;

    if (baseScore > 15) {
      factors.push(`Strong natural compatibility between ${talentPersonality} talent and ${agentPersonality} agent`);
    } else if (baseScore < -15) {
      factors.push(`Potential conflict between ${talentPersonality} talent and ${agentPersonality} agent`);
    } else {
      factors.push(`Neutral compatibility between ${talentPersonality} talent and ${agentPersonality} agent`);
    }

    // Agency archetype influence
    const agencyBonus = this.getAgencyArchetypeCompatibility(talentPersonality, agencyArchetype);
    score += agencyBonus;

    if (agencyBonus > 10) {
      factors.push('Agency archetype aligns well with talent personality');
    } else if (agencyBonus < -10) {
      factors.push('Agency archetype may clash with talent personality');
    }

    const synergy = Math.min(50, Math.max(-50, score / 2));

    return {
      score: Math.min(100, Math.max(-100, score)),
      factors,
      synergy
    };
  },

  /**
   * Get agency archetype compatibility bonus for a talent personality
   * Enhanced with more nuanced archetype matching
   */
  getAgencyArchetypeCompatibility(talentPersonality: TalentPersonality, agencyArchetype?: string): number {
    // Enhanced archetype compatibility matrix
    const archetypeCompatibility: Record<TalentPersonality, number> = {
      perfectionist: 5,
      collaborative: 15,
      difficult: -10,
      charismatic: 10,
      method: 5,
      pragmatic: 10,
      artistic: 15,
      commercial: -5,
      loyal: 10,
      ambitious: 5
    };
    
    const baseBonus = archetypeCompatibility[talentPersonality] || 0;
    
    // Additional bonus based on agency archetype if provided
    if (agencyArchetype) {
      const agencyBonus: Record<string, number> = {
        'powerhouse': 5,  // Major agencies have more leverage
        'major': 3,
        'boutique': 10,  // Boutique agencies offer more personalized service
        'independent': 8
      };
      return baseBonus + (agencyBonus[agencyArchetype] || 0);
    }
    
    return baseBonus;
  },

  /**
   * Calculate synergy between talent and agent based on their relationship history
   */
  calculateSynergy(relationship: TalentAgentRelationship): number {
    const { relationshipScore, history } = relationship;

    // Base synergy from relationship score
    let synergy = (relationshipScore - 50) / 2; // -25 to +25

    // Bonus for successful deals
    const successRate = history.totalDeals > 0 ? history.successfulDeals / history.totalDeals : 0.5;
    synergy += (successRate - 0.5) * 20; // -10 to +10

    // Bonus for long-term relationships
    if (history.yearsTogether > 5) {
      synergy += 10;
    } else if (history.yearsTogether > 2) {
      synergy += 5;
    }

    return Math.min(50, Math.max(-50, synergy));
  },

  /**
   * Update relationship based on a deal outcome
   */
  updateRelationship(
    relationship: TalentAgentRelationship,
    success: boolean,
    dealValue?: number
  ): TalentAgentRelationship {
    const updated = { ...relationship };

    updated.history.totalDeals++;
    if (success) {
      updated.history.successfulDeals++;
      updated.relationshipScore = Math.min(100, updated.relationshipScore + 5);
    } else {
      updated.history.failedDeals++;
      updated.relationshipScore = Math.max(0, updated.relationshipScore - 3);
    }

    // High-value deals boost relationship more
    if (success && dealValue && dealValue > 1000000) {
      updated.relationshipScore = Math.min(100, updated.relationshipScore + 3);
    }

    // Recalculate synergy
    updated.synergy = this.calculateSynergy(updated);

    return updated;
  },

  /**
   * Generate a new relationship between talent and agent
   */
  createRelationship(
    talentId: string,
    agentId: string,
    talentPersonality: TalentPersonality,
    agentPersonality: AgentPersonality,
    agencyArchetype?: string
  ): TalentAgentRelationship {
    const compatibility = this.calculateCompatibility(talentPersonality, agentPersonality, agencyArchetype);

    return {
      talentId,
      agentId,
      relationshipScore: 50 + (compatibility.score / 4), // 25 to 75 based on compatibility
      history: {
        successfulDeals: 0,
        failedDeals: 0,
        totalDeals: 0,
        yearsTogether: 0
      },
      synergy: compatibility.synergy
    };
  },

  /**
   * Evolve relationship over time
   * Relationships naturally decay or grow based on activity
   */
  evolveRelationship(
    relationship: TalentAgentRelationship,
    weeksSinceLastInteraction: number,
    rng: RandomGenerator
  ): TalentAgentRelationship {
    const updated = { ...relationship };

    // Relationship decay over time if no recent interaction
    if (weeksSinceLastInteraction > 52) { // 1 year
      updated.relationshipScore = Math.max(0, updated.relationshipScore - 10);
      updated.history.yearsTogether++;
    } else if (weeksSinceLastInteraction > 26) { // 6 months
      updated.relationshipScore = Math.max(0, updated.relationshipScore - 5);
    }

    // Small random fluctuation
    if (rng.next() < 0.1) {
      const fluctuation = rng.rangeInt(-2, 3);
      updated.relationshipScore = Math.min(100, Math.max(0, updated.relationshipScore + fluctuation));
    }

    // Recalculate synergy
    updated.synergy = this.calculateSynergy(updated);

    return updated;
  },

  /**
   * Get negotiation bonus based on relationship and synergy
   */
  getNegotiationBonus(relationship: TalentAgentRelationship): number {
    const relationshipBonus = (relationship.relationshipScore - 50) / 5; // -10 to +10
    const synergyBonus = relationship.synergy / 5; // -10 to +10

    return Math.min(20, Math.max(-20, relationshipBonus + synergyBonus));
  },

  /**
   * Get loyalty bonus based on relationship and synergy
   */
  getLoyaltyBonus(relationship: TalentAgentRelationship): number {
    const relationshipBonus = (relationship.relationshipScore - 50) / 4; // -12.5 to +12.5
    const synergyBonus = relationship.synergy / 4; // -12.5 to +12.5
    const yearsBonus = Math.min(10, relationship.history.yearsTogether * 2);

    return Math.min(30, Math.max(0, relationshipBonus + synergyBonus + yearsBonus));
  },

  /**
   * Calculate talent-agent compatibility matrix for all talents and agents
   */
  calculateCompatibilityMatrix(
    talents: Record<string, Talent>,
    agents: Record<string, Agent>,
    agencies: Record<string, Agency>
  ): Map<string, CompatibilityScore> {
    const matrix = new Map<string, CompatibilityScore>();

    for (const [talentId, talent] of Object.entries(talents)) {
      if (!talent.personality) continue;

      for (const [agentId, agent] of Object.entries(agents)) {
        // Get agent personality from agent or agency
        let agentPersonality: AgentPersonality = 'diplomat'; // default
        
        if ((agent as any).personality) {
          agentPersonality = (agent as any).personality;
        } else if (agent.agencyId && agencies[agent.agencyId]) {
          // Derive from agency archetype
          const agency = agencies[agent.agencyId];
          const archetype = agency.culture ? AGENCY_ARCHETYPES[agency.culture as keyof typeof AGENCY_ARCHETYPES] : null;
          if (archetype) {
            agentPersonality = this.mapArchetypeToPersonality(archetype.key);
          }
        }

        const compatibility = this.calculateCompatibility(talent.personality, agentPersonality);
        matrix.set(`${talentId}-${agentId}`, compatibility);
      }
    }

    return matrix;
  },

  /**
   * Map agency archetype to agent personality
   */
  mapArchetypeToPersonality(archetypeKey: string): AgentPersonality {
    const mapping: Record<string, AgentPersonality> = {
      powerhouse: 'shark',
      boutique: 'visionary',
      shark: 'shark',
      comedy_specialist: 'volume',
      lit_agency: 'prestige',
      mega_corp: 'volume',
      streaming_titan: 'visionary',
      indie_darling: 'protector'
    };

    return mapping[archetypeKey] || 'diplomat';
  }
};
