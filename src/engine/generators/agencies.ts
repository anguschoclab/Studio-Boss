import { Agency, Agent, AgencyTier, AgencyCulture, AgentSpecialty, AgencyArchetype, AgencyMotivation, MotivationProfile } from '@/engine/types';
import { pick, randRange, secureRandom } from '../utils';

const POWERHOUSE_PREFIXES = ['United Global', 'Apex', 'Titan', 'Creative Artists', 'William Morrison', 'Monolith', 'Apex Predators', 'Colossal', 'Leviathan'];
const BOUTIQUE_PREFIXES = ['Silver Lake', 'Artisan', 'Lighthouse', 'Indie', 'Auteur', 'Visionary', 'Underground', 'Echo Park', 'Canyon'];
const SHARK_PREFIXES = ['Viper', 'Goldstein &', 'Predator', 'Ironclad', 'Cutthroat', 'Ruthless', 'Bloodsucker', 'Barracuda', 'Venom'];
const STREAMING_TITAN_PREFIXES = ['Algorithm', 'Streamline', 'Cloud', 'Data-Driven', 'Binge'];
const INDIE_DARLING_PREFIXES = ['Festival', 'Arthouse', 'Cinema', 'Auteur', 'Celluloid'];
const NEPO_MILL_PREFIXES = ['Dynasty', 'Legacy', 'Bloodline', 'Heirloom', 'Sion'];
const INT_BROKER_PREFIXES = ['Global', 'Transcontinental', 'Overseas', 'Worldwide', 'Meridian'];
const LEGACY_PREFIXES = ['Heritage', 'Golden Age', 'Classic', 'Icons', 'Vintage'];
const GENRE_PREFIXES = ['Scream', 'Sci-Fi', 'Action', 'Bloodline', 'Pulp'];
const INFLUENCER_PREFIXES = ['Viral', 'Trend', 'Hype', 'Creator', 'Engagement'];



const SHARK_TRAITS = [
  'Requires absurd personal security detail',
  'Demands their own production company credit',
  'Demands massive backend points',
  'Aggressive poaching tactics',
  'Threatens media smear campaigns',
  'Renegotiates mid-production',
  'Requires excessive vanity credits',
  'Requires first-dollar gross',
  'Mandates script rewrites by their writers',
  'Demands guaranteed award campaigns',
  'Demands 20% backend',
  'Forces multi-picture deal',
  'Threatens to pull all clients'
];

const POWERHOUSE_TRAITS = [
  'Mandates guaranteed trilogy',
  'Refuses to do international press',
  'Requires entire package hire',
  'Refuses to work with indie studios',
  'Only represents showrunners',
  'Demands constant schedule changes',
  'Forces unwanted co-stars',
  'Forces greenlight on passion projects',
  'Requires first-dollar gross',
  'Demands guaranteed award campaigns',
  'Demands cross-promotional tie-ins',
  'Forces top billing for all clients',
  'Mandates release windows'
];

const BOUTIQUE_TRAITS = [
  'Only represents auteur directors',
  'Brings their own script doctor',
  'Only represents comedy writers',
  'Refuses to do chemistry reads',
  'Requires final cut privileges',
  'Mandates script rewrites by their writers',
  'Forces greenlight on passion projects',
  'Requires an analog film shoot',
  'Mandates a 3-month rehearsal period',
  'Demands closed-set rehearsals'
];

const COMEDY_SPECIALIST_TRAITS = [
  'Only represents comedy writers',
  'Requires their own stand-up openers',
  'Demands massive backend points for streaming',
  'Mandates high script punch-up fees',
  'Refuses to work on drama projects'
];

const LIT_AGENCY_TRAITS = [
  'Demands aggressive credit arbitration',
  'Requires complete creative control over scripts',
  'Forces package deals with unproven directors',
  'Demands first-look deals for all adaptations',
  'Mandates script rewrites by their writers'
];

const MEGA_CORP_TRAITS = [
  'Mandates absurd crossover cameos',
  'Forces cross-promotional brand integrations',
  'Requires entire package hire',
  'Demands guaranteed award campaigns',
  'Mandates release windows'
];

const STREAMING_TITAN_TRAITS = [
  'Demands massive upfront algorithmic buyout',
  'Requires mandatory series spinoff options',
  'Refuses traditional theatrical windows',
  'Mandates binge-release schedule',
  'Demands back-end points tied to 28-day viewership'
];

const NEPOTISM_MILL_TRAITS = [
  'Demands massive ego-stroking',
  'Requires completely unearned top billing',
  'Aggressively suppresses negative reviews',
  'Demands massive backend points despite zero experience',
  'Forces family members into supporting roles',
  'Refuses to audition or do chemistry reads'
];

const INTERNATIONAL_BROKER_TRAITS = [
  'Mandates absurd cross-cultural pandering scenes',
  'Demands separate international press tours',
  'Requires massive backend escalators for foreign gross',
  'Forces shooting in specific tax-haven countries',
  'Demands international distribution rights carve-outs'
];

const INDIE_DARLING_TRAITS = [
  'Refuses commercial franchise projects',
  'Requires analog film shoot',
  'Mandates extended rehearsal schedules',
  'Forces greenlight on passion projects',
  'Requires final cut privileges'
];

const LEGACY_DEFENDERS_TRAITS = [
  'Demands outdated legacy salaries',
  'Enforces ridiculous onset perks',
  'Refuses non-theatrical releases',
  'Requires first-dollar gross',
  'Mandates a private chef on set'
];

const GENRE_KINGS_TRAITS = [
  'Mandates high script punch-up fees',
  'Demands significant backend escalators',
  'Prohibits dramatic roles',
  'Requires their own stunt coordinators',
  'Forces sequels in original contract'
];

const INFLUENCER_SYNDICATE_TRAITS = [
  'Demands immediate upfront payments',
  'Mandates daily social media integration',
  'Forces casting of fellow influencers',
  'Refuses traditional press junkets',
  'Requires full creative control over promotional TikToks'
];


export function generateAgencies(count: number): Agency[] {
  const agencies: Agency[] = [];

  for (let i = 0; i < count; i++) {
    let archetype: AgencyArchetype;
    let actualName: string;

    const r = secureRandom();

    if (i < 2) {
      archetype = 'powerhouse';
      actualName = pick(POWERHOUSE_PREFIXES) + pick([' Partners', ' Representation', ' Agency', ' Group', ' Collective']);
    } else if (i % 3 === 0) {
      archetype = 'shark';
      actualName = pick(SHARK_PREFIXES) + pick([' Management', ' Media', ' Brokers', ' Associates']);
    } else if (r < 0.15) {
      archetype = 'comedy_specialist';
      actualName = pick(['Giggles', 'Laugh Track', 'Standup', 'Joke', 'Punchline']) + pick([' Reps', ' Management', ' Artists']);
    } else if (r < 0.3) {
      archetype = 'lit_agency';
      actualName = pick(['Pages', 'Story', 'Narrative', 'Ink', 'Typewriter']) + pick([' Guild', ' Agency', ' Associates']);
    } else if (r < 0.45) {
      archetype = 'mega_corp';
      actualName = pick(['Omni', 'Global', 'Universal', 'Infinite', 'Massive']) + pick([' Media', ' Corp', ' Representation']);
    } else if (r < 0.55) {
      archetype = 'streaming_titan';
      actualName = pick(STREAMING_TITAN_PREFIXES) + pick([' Representation', ' Management', ' Artists']);
    } else if (r < 0.65) {
      archetype = 'indie_darling';
      actualName = pick(INDIE_DARLING_PREFIXES) + pick([' Guild', ' Collective', ' Artists']);
    } else if (r < 0.7) {
      archetype = 'nepotism_mill';
      actualName = pick(NEPO_MILL_PREFIXES) + pick([' Representation', ' Management', ' Dynasty']);
    } else if (r < 0.75) {
      archetype = 'international_broker';
      actualName = pick(INT_BROKER_PREFIXES) + pick([' Media', ' Exchange', ' Associates']);
    } else if (r < 0.8) {
      archetype = 'legacy_defenders';
      actualName = pick(LEGACY_PREFIXES) + pick([' Representation', ' Icons', ' Legacy']);
    } else if (r < 0.85) {
      archetype = 'genre_kings';
      actualName = pick(GENRE_PREFIXES) + pick([' Guild', ' Management', ' Associates']);
    } else if (r < 0.9) {
      archetype = 'influencer_syndicate';
      actualName = pick(INFLUENCER_PREFIXES) + pick([' Media', ' Sync', ' Creators']);
    } else {
      archetype = 'boutique';
      actualName = pick(BOUTIQUE_PREFIXES) + pick([' Reps', ' Artists', ' Guild', ' Defenders']);
    }

    let tier: AgencyTier;
    if (archetype === 'powerhouse' || archetype === 'mega_corp' || archetype === 'streaming_titan') {
        tier = 'powerhouse';
    } else if (archetype === 'shark') {
        tier = 'major';
    } else if (archetype === 'comedy_specialist' || archetype === 'lit_agency' || archetype === 'indie_darling' || archetype === 'genre_kings' || archetype === 'influencer_syndicate') {
        tier = 'specialist';
    } else {
        tier = (archetype === 'international_broker' || archetype === 'legacy_defenders') ? 'major' : pick(['mid-tier', 'boutique', 'specialist']);
    }

    let culture: AgencyCulture;
    if (archetype === 'powerhouse' || archetype === 'mega_corp' || archetype === 'streaming_titan') culture = pick(['shark', 'volume']);
    else if (archetype === 'shark') culture = 'shark';
    else if (archetype === 'lit_agency' || archetype === 'indie_darling') culture = 'prestige';
    else if (archetype === 'comedy_specialist' || archetype === 'nepotism_mill' || archetype === 'legacy_defenders') culture = 'family';
    else if (archetype === 'influencer_syndicate' || archetype === 'genre_kings') culture = 'volume';
    else culture = pick(['family', 'prestige']);

    const leverage = (archetype === 'powerhouse' || archetype === 'mega_corp' || archetype === 'streaming_titan') ? Math.floor(randRange(85, 100)) : (archetype === 'shark' ? Math.floor(randRange(80, 95)) : Math.floor(randRange(20, 60)));
    let traitsPool: string[];
    if (archetype === 'shark') traitsPool = [...SHARK_TRAITS];
    else if (archetype === 'powerhouse') traitsPool = [...POWERHOUSE_TRAITS];
    else if (archetype === 'comedy_specialist') traitsPool = [...COMEDY_SPECIALIST_TRAITS];
    else if (archetype === 'lit_agency') traitsPool = [...LIT_AGENCY_TRAITS];
    else if (archetype === 'mega_corp') traitsPool = [...MEGA_CORP_TRAITS];
    else if (archetype === 'streaming_titan') traitsPool = [...STREAMING_TITAN_TRAITS];
    else if (archetype === 'indie_darling') traitsPool = [...INDIE_DARLING_TRAITS];
    else if (archetype === 'nepotism_mill') traitsPool = [...NEPOTISM_MILL_TRAITS];
    else if (archetype === 'international_broker') traitsPool = [...INTERNATIONAL_BROKER_TRAITS];
    else if (archetype === 'legacy_defenders') traitsPool = [...LEGACY_DEFENDERS_TRAITS];
    else if (archetype === 'genre_kings') traitsPool = [...GENRE_KINGS_TRAITS];
    else if (archetype === 'influencer_syndicate') traitsPool = [...INFLUENCER_SYNDICATE_TRAITS];
    else traitsPool = [...BOUTIQUE_TRAITS];

    // Pick 2 random unique traits
    const traits: string[] = [];
    for (let j = 0; j < 2; j++) {
      if (traitsPool.length > 0) {
        const selected = pick(traitsPool);
        traits.push(selected);
        traitsPool = traitsPool.filter(t => t !== selected);
      }
    }

    const motivationProfile: MotivationProfile = {
      financial: archetype === 'shark' ? 90 : (archetype === 'powerhouse' ? 70 : 50),
      prestige: archetype === 'lit_agency' ? 80 : 40,
      legacy: archetype === 'powerhouse' ? 70 : 30,
      aggression: archetype === 'shark' ? 95 : (archetype === 'mega_corp' ? 80 : 40)
    };

    const motivationMap: Record<string, AgencyMotivation> = {
       'powerhouse': 'THE_CLIMBER',
       'boutique': 'THE_PROTECTOR',
       'shark': 'THE_SHARK',
       'comedy_specialist': 'VOLUME_RETAIL',
       'lit_agency': 'THE_PROTECTOR',
       'mega_corp': 'THE_PACKAGER',
       'nepotism_mill': 'THE_PROTECTOR',
       'international_broker': 'THE_CLIMBER',
       'legacy_defenders': 'THE_PROTECTOR',
       'genre_kings': 'THE_PACKAGER',
       'influencer_syndicate': 'VOLUME_RETAIL'
    };

    agencies.push({
      id: `agency-${crypto.randomUUID()}`,
      name: actualName,
      archetype,
      tier,
      culture,
      prestige: tier === 'powerhouse' ? Math.floor(randRange(80, 100)) : (tier === 'major' ? Math.floor(randRange(60, 85)) : Math.floor(randRange(30, 70))),
      leverage,
      traits,
      motivationProfile,
      currentMotivation: motivationMap[archetype] || 'VOLUME_RETAIL'
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
        leverage: agency.culture === 'shark' ? Math.floor(randRange(70, 100)) : Math.floor(randRange(30, 80)),
        motivationProfile: agency.motivationProfile ? { ...agency.motivationProfile, aggression: agency.motivationProfile.aggression + randRange(-10, 10) } : undefined
      });
    }
  }

  return agents;
}
