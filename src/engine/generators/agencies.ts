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
  'Laugh Factory',
  'The Comedy Cartel',
  'Cutthroat Media',
  'Prestige Worldwide',
  'Blockbuster Brokers',
  'Packaging Powerhouse',
  'Indie Darling Reps',
  'The Franchise Foundry',
  'A-List Associates',
  'Maverick Representation',
  'Guerilla Talent',
  'The Streaming Syndicate',
  'The Showrunner Guild',
  'Nepo Baby Management',
  'Digital Disruptors',
  'Commercial Hacks Inc',
  'Legacy Defenders',
  'The Pitch Masters',
  'The Shark Tank',
  'Vulture Capital Reps',
  'Titan Representation',
  'Bloodline Management',
  'The Method Institute',
  'Final Cut Collective',
  'Merch Moguls',
  'Anti-Stream Syndicate',
  'Backend Bandits',
  'Comedy Dictators',
  'The Entourage',
  'Picky Producers'
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
      traits.push('Only represents auteur directors');
      traits.push('Brings their own script doctor');
      culture = 'prestige';
    }

    if (actualName === 'Cutthroat Media') {
      traits.push('Poaches talent from rivals');
      culture = 'shark';
    }

    if (actualName === 'Prestige Worldwide') {
      traits.push('Demands massive backend points');
      leverage = 100;
      culture = 'shark';
    }

    if (actualName === 'Blockbuster Brokers') {
      traits.push('Pitches packaging deals only');
      leverage = 90;
    }

    if (actualName === 'Indie Darling Reps') {
      traits.push('Only represents auteur directors');
      culture = 'prestige';
    }

    if (actualName === 'Packaging Powerhouse') {
      traits.push('Requires entire package hire');
      leverage = 95;
    }

    if (actualName === 'The Franchise Foundry') {
      traits.push('Demands guaranteed sequel clauses');
      leverage = 95;
    }

    if (actualName === 'A-List Associates') {
      traits.push('Refuses to work with indie studios');
      culture = 'prestige';
    }

    if (actualName === 'Maverick Representation') {
      traits.push('Notorious for walk-outs and renegotiations');
      culture = 'shark';
      leverage = 90;
    }

    if (actualName === 'Guerilla Talent') {
      traits.push('Aggressive poaching tactics');
      culture = 'shark';
    }

    if (actualName === 'The Streaming Syndicate') {
      traits.push('Prioritizes streaming deals over theatrical');
    }

    if (actualName === 'The Showrunner Guild') {
      traits.push('Only represents showrunners');
      culture = 'prestige';
    }

    if (actualName === 'Nepo Baby Management') {
      traits.push('Only represents legacy talent');
      culture = 'family';
    }

    if (actualName === 'Digital Disruptors') {
      traits.push('Prioritizes streaming deals over theatrical');
      traits.push('Demands full IP ownership');
      culture = 'volume';
    }

    if (actualName === 'Commercial Hacks Inc') {
      traits.push('Refuses to work with indie studios');
      traits.push('Pitches packaging deals only');
      culture = 'volume';
    }

    if (actualName === 'Legacy Defenders') {
      traits.push('Only represents legacy talent');
      traits.push('Demands massive backend points');
      leverage = 95;
    }

    if (actualName === 'The Pitch Masters') {
      traits.push('Pitches packaging deals only');
      traits.push('Requires entire package hire');
      culture = 'shark';
    }

    if (actualName === 'The Shark Tank') {
      traits.push('Takes 15% instead of 10%');
      traits.push('Aggressive poaching tactics');
      leverage = 98;
      culture = 'shark';
    }

    if (actualName === 'Vulture Capital Reps') {
      traits.push('Demands full creative control');
      traits.push('Notorious for walk-outs and renegotiations');
      leverage = 95;
      culture = 'shark';
    }

    if (actualName === 'Titan Representation') {
      traits.push('Forces useless co-stars into packages');
      traits.push('Requires entire package hire');
      leverage = 90;
    }

    if (actualName === 'Bloodline Management') {
      traits.push('Only represents legacy talent');
      traits.push('Refuses to work with indie studios');
      culture = 'prestige';
    }
    if (actualName === 'The Method Institute') {
      traits.push('Only represents method actors');
      traits.push('Requires personal onset chef');
      culture = 'prestige';
    }

    if (actualName === 'Final Cut Collective') {
      traits.push('Demands final cut');
      traits.push('Demands massive backend points');
      culture = 'shark';
      leverage = 95;
    }

    if (actualName === 'Merch Moguls') {
      traits.push('Demands exclusive merchandising rights');
      traits.push('Requires entire package hire');
      culture = 'volume';
    }

    if (actualName === 'Anti-Stream Syndicate') {
      traits.push('Refuses to do streaming');
      traits.push('Only works with A-List co-stars');
      culture = 'prestige';
    }

    if (actualName === 'Backend Bandits') {
      traits.push('Demands massive backend points');
      traits.push('Takes 15% instead of 10%');
      culture = 'shark';
      leverage = 98;
    }

    if (actualName === 'Comedy Dictators') {
      traits.push('Only represents comedy writers');
      traits.push('Refuses to do rewrites');
      culture = 'shark';
    }

    if (actualName === 'The Entourage') {
      traits.push('Requires 20-person entourage');
      traits.push('Requires trailer bigger than co-stars');
      leverage = 85;
    }

    if (actualName === 'Picky Producers') {
      traits.push('Refuses to work with first-time directors');
      traits.push('Demands guaranteed marketing spend');
      culture = 'prestige';
      leverage = 90;
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
