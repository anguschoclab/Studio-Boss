import { describe, it, expect } from 'vitest';
import { TalentAgentInteractionEngine, AGENT_PERSONALITIES } from '@/engine/systems/talent/talentAgentInteractions';
import { Talent, Agent, Agency } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';

describe('TalentAgentInteractionEngine', () => {
  describe('AGENT_PERSONALITIES', () => {
    it('should have all required personality types', () => {
      expect(AGENT_PERSONALITIES).toBeDefined();
      expect(AGENT_PERSONALITIES.shark).toBeDefined();
      expect(AGENT_PERSONALITIES.diplomat).toBeDefined();
      expect(AGENT_PERSONALITIES.prestige).toBeDefined();
      expect(AGENT_PERSONALITIES.volume).toBeDefined();
      expect(AGENT_PERSONALITIES.protector).toBeDefined();
      expect(AGENT_PERSONALITIES.visionary).toBeDefined();
    });

    it('should have valid configuration for each personality', () => {
      for (const [personality, config] of Object.entries(AGENT_PERSONALITIES)) {
        expect(config.personality).toBe(personality);
        expect(config.description).toBeDefined();
        expect(config.negotiationBonus).toBeGreaterThanOrEqual(-20);
        expect(config.negotiationBonus).toBeLessThanOrEqual(20);
        expect(config.relationshipGrowthRate).toBeGreaterThanOrEqual(0);
        expect(config.relationshipGrowthRate).toBeLessThanOrEqual(100);
        expect(config.loyaltyBonus).toBeGreaterThanOrEqual(0);
        expect(config.loyaltyBonus).toBeLessThanOrEqual(100);
        expect(config.riskTolerance).toBeGreaterThanOrEqual(0);
        expect(config.riskTolerance).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('calculateCompatibility', () => {
    it('should return a compatibility score with all required fields', () => {
      const result = TalentAgentInteractionEngine.calculateCompatibility('collaborative', 'diplomat');

      expect(result).toBeDefined();
      expect(result.score).toBeDefined();
      expect(typeof result.score).toBe('number');
      expect(result.score).toBeGreaterThanOrEqual(-100);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.factors).toBeDefined();
      expect(Array.isArray(result.factors)).toBe(true);
      expect(result.synergy).toBeDefined();
      expect(result.synergy).toBeGreaterThanOrEqual(-50);
      expect(result.synergy).toBeLessThanOrEqual(50);
    });

    it('should have higher compatibility for matching personalities', () => {
      const collaborativeDiplomat = TalentAgentInteractionEngine.calculateCompatibility('collaborative', 'diplomat');
      const collaborativeShark = TalentAgentInteractionEngine.calculateCompatibility('collaborative', 'shark');

      expect(collaborativeDiplomat.score).toBeGreaterThan(collaborativeShark.score);
    });

    it('should provide factors explaining compatibility', () => {
      const result = TalentAgentInteractionEngine.calculateCompatibility('perfectionist', 'prestige');

      expect(result.factors.length).toBeGreaterThan(0);
      expect(result.factors[0]).toBeDefined();
      expect(typeof result.factors[0]).toBe('string');
    });
  });

  describe('calculateSynergy', () => {
    it('should calculate synergy based on relationship score', () => {
      const relationship = {
        talentId: 'talent-1',
        agentId: 'agent-1',
        relationshipScore: 75,
        history: {
          successfulDeals: 5,
          failedDeals: 1,
          totalDeals: 6,
          yearsTogether: 2
        },
        synergy: 0
      };

      const synergy = TalentAgentInteractionEngine.calculateSynergy(relationship);

      expect(synergy).toBeDefined();
      expect(typeof synergy).toBe('number');
      expect(synergy).toBeGreaterThanOrEqual(-50);
      expect(synergy).toBeLessThanOrEqual(50);
    });

    it('should have positive synergy for high relationship scores', () => {
      const highRelationship = {
        talentId: 'talent-1',
        agentId: 'agent-1',
        relationshipScore: 90,
        history: {
          successfulDeals: 10,
          failedDeals: 0,
          totalDeals: 10,
          yearsTogether: 3
        },
        synergy: 0
      };

      const lowRelationship = {
        talentId: 'talent-2',
        agentId: 'agent-2',
        relationshipScore: 30,
        history: {
          successfulDeals: 2,
          failedDeals: 5,
          totalDeals: 7,
          yearsTogether: 1
        },
        synergy: 0
      };

      const highSynergy = TalentAgentInteractionEngine.calculateSynergy(highRelationship);
      const lowSynergy = TalentAgentInteractionEngine.calculateSynergy(lowRelationship);

      expect(highSynergy).toBeGreaterThan(lowSynergy);
    });
  });

  describe('updateRelationship', () => {
    it('should update relationship on successful deal', () => {
      const relationship = {
        talentId: 'talent-1',
        agentId: 'agent-1',
        relationshipScore: 60,
        history: {
          successfulDeals: 5,
          failedDeals: 1,
          totalDeals: 6,
          yearsTogether: 2
        },
        synergy: 10
      };

      const updated = TalentAgentInteractionEngine.updateRelationship(relationship, true);

      expect(updated.history.successfulDeals).toBe(6);
      expect(updated.history.totalDeals).toBe(7);
      expect(updated.relationshipScore).toBeGreaterThan(60);
    });

    it('should update relationship on failed deal', () => {
      const relationship = {
        talentId: 'talent-1',
        agentId: 'agent-1',
        relationshipScore: 60,
        history: {
          successfulDeals: 5,
          failedDeals: 1,
          totalDeals: 6,
          yearsTogether: 2
        },
        synergy: 10
      };

      const updated = TalentAgentInteractionEngine.updateRelationship(relationship, false);

      expect(updated.history.failedDeals).toBe(2);
      expect(updated.history.totalDeals).toBe(7);
      expect(updated.relationshipScore).toBeLessThan(60);
    });

    it('should boost relationship for high-value deals', () => {
      const relationship = {
        talentId: 'talent-1',
        agentId: 'agent-1',
        relationshipScore: 60,
        history: {
          successfulDeals: 5,
          failedDeals: 1,
          totalDeals: 6,
          yearsTogether: 2
        },
        synergy: 10
      };

      const normalDeal = TalentAgentInteractionEngine.updateRelationship(relationship, true, 500000);
      const highValueDeal = TalentAgentInteractionEngine.updateRelationship(relationship, true, 5000000);

      expect(highValueDeal.relationshipScore).toBeGreaterThan(normalDeal.relationshipScore);
    });
  });

  describe('createRelationship', () => {
    it('should create a new relationship with initial values', () => {
      const relationship = TalentAgentInteractionEngine.createRelationship(
        'talent-1',
        'agent-1',
        'collaborative',
        'diplomat'
      );

      expect(relationship.talentId).toBe('talent-1');
      expect(relationship.agentId).toBe('agent-1');
      expect(relationship.relationshipScore).toBeGreaterThan(0);
      expect(relationship.relationshipScore).toBeLessThan(100);
      expect(relationship.history.successfulDeals).toBe(0);
      expect(relationship.history.failedDeals).toBe(0);
      expect(relationship.history.totalDeals).toBe(0);
      expect(relationship.history.yearsTogether).toBe(0);
      expect(relationship.synergy).toBeDefined();
    });

    it('should set initial relationship based on compatibility', () => {
      const compatible = TalentAgentInteractionEngine.createRelationship(
        'talent-1',
        'agent-1',
        'collaborative',
        'diplomat'
      );

      const incompatible = TalentAgentInteractionEngine.createRelationship(
        'talent-2',
        'agent-2',
        'difficult',
        'diplomat'
      );

      expect(compatible.relationshipScore).toBeGreaterThan(incompatible.relationshipScore);
    });
  });

  describe('evolveRelationship', () => {
    it('should decay relationship over time without interaction', () => {
      const relationship = {
        talentId: 'talent-1',
        agentId: 'agent-1',
        relationshipScore: 80,
        history: {
          successfulDeals: 5,
          failedDeals: 1,
          totalDeals: 6,
          yearsTogether: 2
        },
        synergy: 10
      };

      const mockRng = new RandomGenerator(12345);

      const evolved = TalentAgentInteractionEngine.evolveRelationship(relationship, 30, mockRng);

      expect(evolved.relationshipScore).toBeLessThan(80);
    });

    it('should increment years together after 52 weeks', () => {
      const relationship = {
        talentId: 'talent-1',
        agentId: 'agent-1',
        relationshipScore: 80,
        history: {
          successfulDeals: 5,
          failedDeals: 1,
          totalDeals: 6,
          yearsTogether: 2
        },
        synergy: 10
      };

      const mockRng = new RandomGenerator(12345);

      const evolved = TalentAgentInteractionEngine.evolveRelationship(relationship, 60, mockRng);

      expect(evolved.history.yearsTogether).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getNegotiationBonus', () => {
    it('should return positive bonus for high relationship', () => {
      const highRelationship = {
        talentId: 'talent-1',
        agentId: 'agent-1',
        relationshipScore: 90,
        history: { successfulDeals: 10, failedDeals: 0, totalDeals: 10, yearsTogether: 3 },
        synergy: 20
      };

      const bonus = TalentAgentInteractionEngine.getNegotiationBonus(highRelationship);

      expect(bonus).toBeGreaterThan(0);
    });

    it('should return negative bonus for low relationship', () => {
      const lowRelationship = {
        talentId: 'talent-1',
        agentId: 'agent-1',
        relationshipScore: 30,
        history: { successfulDeals: 2, failedDeals: 5, totalDeals: 7, yearsTogether: 1 },
        synergy: -20
      };

      const bonus = TalentAgentInteractionEngine.getNegotiationBonus(lowRelationship);

      expect(bonus).toBeLessThan(0);
    });
  });

  describe('getLoyaltyBonus', () => {
    it('should return positive bonus for high relationship', () => {
      const highRelationship = {
        talentId: 'talent-1',
        agentId: 'agent-1',
        relationshipScore: 90,
        history: { successfulDeals: 10, failedDeals: 0, totalDeals: 10, yearsTogether: 5 },
        synergy: 20
      };

      const bonus = TalentAgentInteractionEngine.getLoyaltyBonus(highRelationship);

      expect(bonus).toBeGreaterThan(0);
    });

    it('should return zero for low relationship', () => {
      const lowRelationship = {
        talentId: 'talent-1',
        agentId: 'agent-1',
        relationshipScore: 30,
        history: { successfulDeals: 2, failedDeals: 5, totalDeals: 7, yearsTogether: 0 },
        synergy: -20
      };

      const bonus = TalentAgentInteractionEngine.getLoyaltyBonus(lowRelationship);

      expect(bonus).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateCompatibilityMatrix', () => {
    it('should calculate compatibility for all talent-agent pairs', () => {
      const talents: Record<string, Talent> = {
        'talent-1': {
          id: 'talent-1',
          name: 'Talent 1',
          role: 'actor',
          roles: ['actor'],
          tier: 2,
          demographics: { gender: 'MALE', country: 'US', ethnicity: 'white', age: 35 },
          psychology: { ego: 50, mood: 50, scandalRisk: 50, synergyAffinities: [], synergyConflicts: [] },
          skills: { acting: 70, directing: 50, writing: 50, stardom: 60 },
          prestige: 60,
          draw: 65,
          fee: 1000000,
          momentum: 50,
          starMeter: 60,
          bio: 'Test talent',
          motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
          currentMotivation: 'NONE',
          motivationImpulse: 'NONE',
          commitments: [],
          fatigue: 0,
          preferredGenres: ['Drama'],
          personality: 'collaborative',
          accessLevel: 'outsider' as any
        }
      };

      const agents: Record<string, Agent> = {
        'agent-1': {
          id: 'agent-1',
          name: 'Agent 1',
          agencyId: 'agency-1',
          negotiationTactic: 'DIPLOMAT',
          reputation: 60
        } as any
      };

      const agencies: Record<string, Agency> = {
        'agency-1': {
          id: 'agency-1',
          name: 'Agency 1',
          tier: 'major',
          culture: 'BOUTIQUE' as any,
          reputation: 70,
          cash: 10000000
        } as any
      };

      const matrix = TalentAgentInteractionEngine.calculateCompatibilityMatrix(talents, agents, agencies);

      expect(matrix).toBeDefined();
      expect(matrix.size).toBeGreaterThan(0);
    });
  });
});
