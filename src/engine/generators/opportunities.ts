import { Opportunity, BudgetTierKey, TvFormatKey } from '../types';
import { GENRES, TARGET_AUDIENCES } from '../data/genres';
import { randRange, pick } from '../utils';
 // Reuse some generation logic if needed, or build new one

const PROJECT_ADJECTIVES = [
  'Cursed', 'Bloated', 'Pretentious', 'Gritty', 'Unnecessary', 'Rebooted', 'Overbudget', 'Derivative', 'Visionary', 'Cinematic', 'Algorithm-Driven', 'IP-Mining', 'Vain', 'Lethal', 'Synergistic',
  'Dark', 'Neon', 'Silent', 'Golden', 'Lost', 'Forgotten', 'Broken', 'Hidden',
  'Wild', 'Cold', 'Last', 'First', 'Final', 'Secret', 'Midnight', 'Crimson',
  'Micro-Budget', 'Banned', 'Cult', 'Divisive', 'Misunderstood', 'Post-Modern', 'Meta', 'Self-Aware', 'Interactive', 'Hyper-Violent', 'Family-Friendly', 'Subversive', 'Existential', 'Viral', 'Edgy',
  'Chaotic', 'Shameless', 'Tone-Deaf', 'Syndicated', 'Pandering', 'Nostalgic', 'Crowdfunded', 'Incomprehensible'
];

const PROJECT_NOUNS = [
  'Tentpole', 'Cinematic Universe', 'Vanity Project', 'Cash Grab', 'Reboot', 'Origin Story', 'Four-Quadrant Hit', 'Oscar Bait', 'Tax Write-off', 'Algorithm', 'Focus Group', 'Franchise', 'Merchandising Opportunity', 'Streaming Wars', 'Demographic',
  'Echo', 'Whisper', 'Shadow', 'Sun', 'Moon', 'Star', 'Dream', 'Nightmare',
  'City', 'Mountain', 'River', 'Forest', 'Ocean', 'Island', 'Tower', 'Castle',
  'Content', 'IP', 'Podcast Adaptation', 'Graphic Novel', 'Limited Run', 'Spin-off', 'Prequel', 'Sequel', 'Trilogy', 'Crossover', 'Event', 'Experience', 'Platform', 'Saga', 'Chronicle',
  'Multiverse', 'Money Pit', 'Brand Synergy', 'TikTok Trend', 'Nostalgia Bait', 'Legacy Sequel', 'Toy Commercial'
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
    `A ${budgetTier}-budget ${type} that exists solely as a tax write-off for a rival studio.`,
    `A ${budgetTier}-budget ${type} based on a viral TikTok trend that is already losing relevance.`,
    `A shockingly expensive ${genre} ${type} that is 90% green-screen and 10% product placement.`,
    `A highly-anticipated ${origin} that was secretly ghostwritten by an AI and it shows.`,
    `An overhyped ${genre} ${type} that the 'fans' are already threatening to boycott.`,
    `A tedious, slow-burn ${genre} ${origin} that requires the audience to 'do the work'.`,
    `A ${budgetTier}-tier ${type} starring a controversial influencer attempting to crossover into acting.`,
    `A frantic, neon-soaked ${genre} ${type} entirely funded by questionable cryptocurrency gains.`,
    `A deeply personal ${origin} from an auteur who hasn't had a hit in three decades.`,
    `A 'grounded and realistic' ${genre} reboot of a beloved children's cartoon.`,
    `A multi-part ${genre} ${type} designed purely to setup a cinematic universe nobody wants.`,
    `An incredibly dense ${origin} that the agency insists is 'the next Game of Thrones'.`,
    `A ${budgetTier}-budget ${genre} ${type} where the lead actor is demanding final cut privilege.`,
    `A gritty ${genre} ${type} based on a profoundly depressing true crime podcast.`,
    `A wildly out-of-touch ${origin} written by a studio executive's tennis partner.`,
    `A completely incomprehensible ${genre} ${type} that foreign markets will absolutely devour.`,
    `A legacy sequel to a ${genre} film from thirty years ago that ignores all previous continuity.`,
    `An agonizingly slow ${type} that somehow secured funding from a disgraced tech billionaire.`,
    `A ${budgetTier}-budget ${type} where the studio mandated a cameo from a 1990s pop star.`,
    `A ${genre} ${type} that spends 90 minutes setting up spin-offs instead of telling a story.`,
    `A painfully unfunny ${genre} ${type} entirely predicated on early-2000s nostalgia.`,
    `A high-concept ${origin} that falls apart immediately if you think about the plot for five seconds.`,
    `A ${genre} ${type} that the lead actor insists is a 'spiritual journey' despite being a cash grab.`,
    `A desperate ${type} that shoehorns in public domain characters to avoid licensing fees.`,
    `A ${budgetTier}-budget ${genre} ${type} heavily relying on deepfaked actors to finish scenes.`,
    `A visually muddy ${origin} that requires audiences to read a tie-in comic to understand the ending.`,
    `An aggressive ${genre} ${type} that replaces character development with non-stop lens flares.`,
    `A ${budgetTier}-budget ${type} built around a single, moderately popular YouTube meme.`,
    `A ${genre} ${type} that the studio is intentionally burying to avoid embarrassment.`,
    `A ${budgetTier}-tier ${type} that is legally distinct enough from a popular franchise to avoid a lawsuit.`,
    `A ${genre} ${type} that ends on a massive cliffhanger for a sequel that will never happen.`
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
export function generateOpportunity(_weekOrTalentIds?: number | string[]): Opportunity {
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
