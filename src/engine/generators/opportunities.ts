import { Opportunity, BudgetTierKey, TvFormatKey } from '../types';
import { GENRES, TARGET_AUDIENCES } from '../data/genres';
import { randRange, pick } from '../utils';
 // Reuse some generation logic if needed, or build new one

const PROJECT_ADJECTIVES = [
  'Cursed', 'Bloated', 'Pretentious', 'Gritty', 'Unnecessary', 'Rebooted', 'Overbudget', 'Derivative', 'Visionary', 'Cinematic', 'Algorithm-Driven', 'IP-Mining', 'Vain', 'Lethal', 'Synergistic',
  'Dark', 'Neon', 'Silent', 'Golden', 'Lost', 'Forgotten', 'Broken', 'Hidden',
  'Wild', 'Cold', 'Last', 'First', 'Final', 'Secret', 'Midnight', 'Crimson'
];

const PROJECT_NOUNS = [
  'Tentpole', 'Cinematic Universe', 'Vanity Project', 'Cash Grab', 'Reboot', 'Origin Story', 'Four-Quadrant Hit', 'Oscar Bait', 'Tax Write-off', 'Algorithm', 'Focus Group', 'Franchise', 'Merchandising Opportunity', 'Streaming Wars', 'Demographic',
  'Echo', 'Whisper', 'Shadow', 'Sun', 'Moon', 'Star', 'Dream', 'Nightmare',
  'City', 'Mountain', 'River', 'Forest', 'Ocean', 'Island', 'Tower', 'Castle'
];


function generateFlavor(genre: string, type: string, budgetTier: BudgetTierKey, origin: string): string {
  const cynicalFlavors = [
    `A ${budgetTier}-budget ${genre} ${type} that screams 'we made this for an algorithm'.`,
    `An overly pretentious ${genre} ${type} from an indie darling who won't stop talking about A24.`,
    `A bloated ${budgetTier}-budget ${type} that's just a thinly veiled merchandising vehicle.`,
    `A gritty, ${genre} reboot of an IP that absolutely no one asked for.`,
    `A juicy ${origin} that's been passed around town because the third act is an absolute mess.`,
    `A 'visionary' ${genre} ${type} that requires a staggering amount of VFX and a prayer.`,
    `A ${budgetTier}-tier ${genre} project that the trades are calling 'the next big disaster'.`,
    `A soulless, four-quadrant ${genre} ${type} designed entirely by a focus group.`,
    `An ego-driven ${origin} from an A-lister trying to prove they can act in a ${genre} film.`,
    `A ${budgetTier}-budget ${type} that's already bleeding money and it hasn't even been greenlit.`,
    `A ${genre} ${type} with an incomprehensible script but 'huge international appeal'.`,
    `A ${budgetTier}-budget ${genre} ${type} that was clearly written by ChatGPT.`,
    `An exhausting ${origin} that insists it's not a ${genre} film, but 'an elevated ${genre} film'.`,
    `A cynical ${genre} ${type} cashing in on a trend that died six months ago.`,
    `A ${budgetTier}-budget ${type} that exists solely as a tax write-off for a rival studio.`
  ];
  return pick(cynicalFlavors);
}

export function generateProjectTitle(): string {
  if (Math.random() > 0.5) {
    return `The ${pick(PROJECT_ADJECTIVES)} ${pick(PROJECT_NOUNS)}`;
  }
  return `${pick(PROJECT_ADJECTIVES)} ${pick(PROJECT_NOUNS)}`;
}

export function generateOpportunity(talentIds?: string[]): Opportunity;
export function generateOpportunity(_weekOrTalentIds?: number | string[], _prestige?: number): Opportunity {
  // Support both old signature (week, prestige) and new (talentIds)
  let talentIds: string[] | undefined;
  if (Array.isArray(_weekOrTalentIds)) {
    talentIds = _weekOrTalentIds;
  }
  const isFilm = Math.random() > 0.4;
  const genre: string = pick([...GENRES]);
  const targetAudience: string = pick([...TARGET_AUDIENCES]);
  const budgetTier = pick(['low', 'mid', 'high', 'blockbuster'] as BudgetTierKey[]);

  const type = pick(['script', 'package', 'pitch', 'rights'] as const);
  const origin = pick(['open_spec', 'agency_package', 'writer_sample', 'heat_list', 'passion_project'] as const);

  const opt: Opportunity = {
    id: `opp-${crypto.randomUUID()}`,
    type,
    title: generateProjectTitle(),
    format: isFilm ? 'film' : 'tv',
    genre,
    budgetTier,
    targetAudience,
    flavor: generateFlavor(genre, type, budgetTier, origin),
    origin,
    costToAcquire: Math.floor(randRange(10, 500)) * 1000,
    weeksUntilExpiry: Math.floor(randRange(4, 12)),
    attachedTalentIds: talentIds && talentIds.length > 0 && Math.random() > 0.5 ? [pick(talentIds)] : undefined,
  };

  if (!isFilm) {
    opt.tvFormat = pick(['sitcom', 'procedural', 'prestige_drama', 'limited_series', 'animated_comedy', 'animated_prestige', 'daytime_soap', 'late_night_talk', 'sketch_comedy', 'sci_fi_epic', 'teen_drama', 'fantasy_epic', 'anthology_series', 'telenovela', 'historical_drama', 'medical_procedural'] as TvFormatKey[]);
    opt.episodes = opt.tvFormat === 'limited_series' ? 8 : 10;
    opt.releaseModel = 'weekly';
  }

  return opt;
}
