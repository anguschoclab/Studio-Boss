import { Agency, Agent, AgencyTier, AgencyCulture, AgentSpecialty } from '../types';
import { pick, randRange } from '../utils';

const AGENCY_NAMES = [
  'Creative Artists Collective (CAC)',
  'William Morrison Entertainment (WME)',
  'United Talent Partners (UTP)',
  'The Gershwin Agency',
  'Innovative Artists Group',
  'Paradigm Shift',
  'Apex Talent',
  'Nexus Representation',
  'Echo Management',
  'Vanguard Artists',
  'Comedy Central',
  'Backend Behemoths',
  'Auteur Agency',
  'Laugh Factory'
];

const AGENT_FIRST_NAMES = ['Ari', 'Bryan', 'Maha', 'Jeremy', 'Richard', 'Sue', 'Ali', 'Kevin', 'Aaron', 'Emma', 'David', 'Laura'];
const AGENT_LAST_NAMES = ['Gold', 'Lourd', 'Dakhil', 'Zimmer', 'Lovett', 'Mengers', 'Emanuel', 'Huvane', 'Sorkin', 'Stone', 'Smith', 'Jones'];

export function generateAgencies(count: number): Agency[] {
  const agencies: Agency[] = [];
  const names = [...AGENCY_NAMES];

  for (let i = 0; i < count; i++) {
    const isPowerhouse = i < 2; // Make the first 2 powerhouses
    const nameIndex = Math.floor(Math.random() * names.length);
    const name = names[nameIndex];
    names.splice(nameIndex, 1);

    const tier: AgencyTier = isPowerhouse ? 'powerhouse' : (i < 4 ? 'major' : (i < 7 ? 'mid-tier' : pick(['boutique', 'specialist'])));

    let culture: AgencyCulture;
    if (tier === 'powerhouse') culture = pick(['shark', 'volume']);
    else if (tier === 'boutique') culture = pick(['family', 'prestige']);
    else culture = pick(['shark', 'family', 'volume', 'prestige']);

    const actualName = name || `Agency ${i}`;
    let leverage = tier === 'powerhouse' ? Math.floor(randRange(85, 100)) : (tier === 'major' ? Math.floor(randRange(65, 85)) : Math.floor(randRange(20, 60)));
    const traits: string[] = [];

    if (actualName === 'Comedy Central' || actualName === 'Laugh Factory') {
      traits.push('Only represents comedy writers');
    }

    if (actualName === 'Backend Behemoths') {
      traits.push('Demands massive backend points');
      leverage = 100; // Uncompromising leverage
      culture = 'shark';
    }

    if (actualName === 'Auteur Agency') {
      traits.push('Brings their own script doctor');
      culture = 'prestige';
    }

    agencies.push({
      id: `agency-${crypto.randomUUID()}`,
      name: actualName,
      tier,
      culture,
      prestige: tier === 'powerhouse' ? Math.floor(randRange(80, 100)) : (tier === 'major' ? Math.floor(randRange(60, 85)) : Math.floor(randRange(30, 70))),
      leverage,
      traits
    });
  }

  return agencies;
}

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

      agents.push({
        id: `agent-${crypto.randomUUID()}`,
        agencyId: agency.id,
        name: `${firstName} ${lastName}`,
        specialty,
        skill: Math.floor(randRange(agency.prestige - 20, agency.prestige + 20)),
        aggression: agency.culture === 'shark' ? Math.floor(randRange(70, 100)) : Math.floor(randRange(30, 80))
      });
    }
  }

  return agents;
}
