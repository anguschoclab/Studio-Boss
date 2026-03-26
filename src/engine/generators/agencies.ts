import { Agency, Agent, AgencyTier, AgencyCulture, AgentSpecialty, AgencyArchetype } from '../types/index';
import { pick, randRange } from '../utils';

const POWERHOUSE_PREFIXES = ['United Global', 'Apex', 'Titan', 'Creative Artists', 'William Morrison'];
const BOUTIQUE_PREFIXES = ['Silver Lake', 'Artisan', 'Lighthouse', 'Indie', 'Auteur'];
const SHARK_PREFIXES = ['Viper', 'Goldstein &', 'Predator', 'Ironclad', 'Cutthroat'];

export function generateAgencies(count: number): Agency[] {
  const agencies: Agency[] = [];

  for (let i = 0; i < count; i++) {
    let archetype: AgencyArchetype;
    let actualName = '';

    if (i < 2) {
      archetype = 'powerhouse';
      actualName = pick(POWERHOUSE_PREFIXES) + pick([' Partners', ' Representation', ' Agency', ' Group', ' Collective']);
    } else if (i % 3 === 0) {
      archetype = 'shark';
      actualName = pick(SHARK_PREFIXES) + pick([' Management', ' Media', ' Brokers', ' Associates']);
    } else {
      archetype = 'boutique';
      actualName = pick(BOUTIQUE_PREFIXES) + pick([' Reps', ' Artists', ' Guild', ' Defenders']);
    }

    let tier: AgencyTier;
    if (archetype === 'powerhouse') {
        tier = 'powerhouse';
    } else if (archetype === 'shark') {
        tier = 'major';
    } else {
        tier = pick(['mid-tier', 'boutique', 'specialist']);
    }

    let culture: AgencyCulture;
    if (archetype === 'powerhouse') culture = pick(['shark', 'volume']);
    else if (archetype === 'shark') culture = 'shark';
    else culture = pick(['family', 'prestige']);

    const leverage = archetype === 'powerhouse' ? Math.floor(randRange(85, 100)) : (archetype === 'shark' ? Math.floor(randRange(80, 95)) : Math.floor(randRange(20, 60)));
    const traits: string[] = [];

    if (archetype === 'shark') {
      traits.push('Demands massive backend points');
      traits.push('Aggressive poaching tactics');
    } else if (archetype === 'powerhouse') {
      traits.push('Requires entire package hire');
      traits.push('Refuses to work with indie studios');
    } else {
      traits.push('Only represents auteur directors');
      traits.push('Brings their own script doctor');
    }

    agencies.push({
      id: `agency-${crypto.randomUUID()}`,
      name: actualName,
      archetype,
      tier,
      culture,
      prestige: tier === 'powerhouse' ? Math.floor(randRange(80, 100)) : (tier === 'major' ? Math.floor(randRange(60, 85)) : Math.floor(randRange(30, 70))),
      leverage,
      traits
    });
  }

  return agencies;
}


const AGENT_FIRST_NAMES = ['Ari', 'Bryan', 'Maha', 'Jeremy', 'Richard', 'Sue', 'Ali', 'Kevin', 'Aaron', 'Emma', 'David', 'Laura'];
const AGENT_LAST_NAMES = ['Gold', 'Lourd', 'Dakhil', 'Zimmer', 'Lovett', 'Mengers', 'Emanuel', 'Huvane', 'Sorkin', 'Stone', 'Smith', 'Jones'];

export function generateAgents(agencies: Agency[], countPerAgency: number): Agent[] {

  const agents: Agent[] = [];

  for (const agency of agencies) {
    const agentCount = agency.tier === 'powerhouse' ? countPerAgency * 2 : (agency.tier === 'boutique' ? Math.max(1, Math.floor(countPerAgency / 2)) : countPerAgency);

    for (let i = 0; i < agentCount; i++) {
      const firstName = pick(AGENT_FIRST_NAMES);
      const lastName = pick(AGENT_LAST_NAMES);
      let specialty: AgentSpecialty = pick(['film_packaging', 'tv_packaging', 'literary', 'talent', 'comedy', 'unscripted']);

      // Override specialty based on agency traits
      if (agency.traits?.includes('Only represents comedy writers')) {
        specialty = 'comedy';
      }
      if (agency.traits?.includes('Only represents showrunners')) {
        specialty = 'tv_packaging';
      }

      agents.push({
        id: `agent-${crypto.randomUUID()}`,
        agencyId: agency.id,
        name: `${firstName} ${lastName}`,
        specialty,
        prestige: Math.floor(randRange(agency.prestige - 20, agency.prestige + 20)),
        leverage: agency.culture === 'shark' ? Math.floor(randRange(70, 100)) : Math.floor(randRange(30, 80))
      });
    }
  }

  return agents;
}
