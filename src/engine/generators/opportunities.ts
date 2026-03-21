import { Opportunity, BudgetTierKey, TvFormatKey } from '../types';
import { GENRES, TARGET_AUDIENCES } from '../data/genres';
import { randRange, pick } from '../utils';
 // Reuse some generation logic if needed, or build new one

const PROJECT_ADJECTIVES = [
  'Dark', 'Neon', 'Silent', 'Golden', 'Lost', 'Forgotten', 'Broken', 'Hidden',
  'Wild', 'Cold', 'Last', 'First', 'Final', 'Secret', 'Midnight', 'Crimson'
];

const PROJECT_NOUNS = [
  'Echo', 'Whisper', 'Shadow', 'Sun', 'Moon', 'Star', 'Dream', 'Nightmare',
  'City', 'Mountain', 'River', 'Forest', 'Ocean', 'Island', 'Tower', 'Castle'
];

export function generateProjectTitle(): string {
  if (Math.random() > 0.5) {
    return `The ${pick(PROJECT_ADJECTIVES)} ${pick(PROJECT_NOUNS)}`;
  }
  return `${pick(PROJECT_ADJECTIVES)} ${pick(PROJECT_NOUNS)}`;
}

export function generateOpportunity(talentIds?: string[]): Opportunity {
  const isFilm = Math.random() > 0.4;
  const genre = pick(GENRES);
  const targetAudience = pick(TARGET_AUDIENCES);
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
    flavor: `A new ${genre} ${type} circulating the town.`,
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
