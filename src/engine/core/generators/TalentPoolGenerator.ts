import { Talent } from '@/engine/types';
import { generateFamilies, generateTalentPool } from '../../generators/talent';
import { generateAgencies, generateAgents } from '../../generators/agencies';
import { RandomGenerator } from '../../utils/rng';
import { TalentAgentInteractionEngine } from '../../systems/talent/talentAgentInteractions';

interface TalentPoolGeneratorOptions {
  talentCount?: number;
  agencyCount?: number;
  agentsPerAgency?: number;
  familyCount?: number;
}

export function generateTalentPoolWithRelationships(
  rng: RandomGenerator,
  options: TalentPoolGeneratorOptions = {}
): {
  talentPool: Record<string, Talent>;
  talentPoolArray: Talent[];
  agencies: any[];
  agents: any[];
  families: any[];
  talentAgentRelationships: Record<string, any>;
} {
  const {
    talentCount = 500,
    agencyCount = 5,
    agentsPerAgency = 4,
    familyCount = 5
  } = options;

  const agencies = generateAgencies(rng, agencyCount);
  const agents = generateAgents(rng, agencies, agentsPerAgency);
  const families = generateFamilies(rng, familyCount);

  // Pre-index for O(1) lookups
  const agenciesMap = new Map(agencies.map(a => [a.id, a]));
  const agentsMap = new Map(agents.map(a => [a.id, a]));

  const talentPoolArray = generateTalentPool(rng, talentCount);
  const talentPool = talentPoolArray.reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {} as Record<string, Talent>);

  // Initialize talent-agent relationships
  const talentAgentRelationships: Record<string, any> = {};

  for (const [talentId, talent] of Object.entries(talentPool)) {
    if (talent.agentId) {
      const agent = agentsMap.get(talent.agentId);
      if (agent && talent.personality) {
        const agentPersonality = agent.personality || derivePersonalityFromAgent(agent);
        const agency = agenciesMap.get(agent.agencyId);
        
        const relationship = TalentAgentInteractionEngine.createRelationship(
          talentId,
          talent.agentId,
          talent.personality,
          agentPersonality,
          agency?.tier
        );
        talentAgentRelationships[`${talentId}-${talent.agentId}`] = relationship;
      }
    }
  }

  return {
    talentPool,
    talentPoolArray,
    agencies,
    agents,
    families,
    talentAgentRelationships
  };
}

function derivePersonalityFromAgent(agent: any): any {
  const tacticMap: Record<string, any> = {
    'SHARK': 'shark',
    'DIPLOMAT': 'diplomat',
    'VOLUME': 'volume',
    'PRESTIGE': 'prestige'
  };
  return tacticMap[agent.negotiationTactic] || 'diplomat';
}
