import { Opportunity, BudgetTierKey, TvFormatKey } from '@/engine/types';
import { GENRES, TARGET_AUDIENCES } from '../data/genres';
import { randRange, pick } from '../utils';
 // Reuse some generation logic if needed, or build new one

const PROJECT_ADJECTIVES = [
  'Cursed', 'Bloated', 'Pretentious', 'Gritty', 'Unnecessary', 'Rebooted', 'Overbudget', 'Derivative', 'Visionary', 'Cinematic', 'Algorithm-Driven', 'IP-Mining', 'Vain', 'Lethal', 'Synergistic',
  'Dark', 'Neon', 'Silent', 'Golden', 'Lost', 'Forgotten', 'Broken', 'Hidden',
  'Wild', 'Cold', 'Last', 'First', 'Final', 'Secret', 'Midnight', 'Crimson',
  'Micro-Budget', 'Banned', 'Cult', 'Divisive', 'Misunderstood', 'Post-Modern', 'Meta', 'Self-Aware', 'Interactive', 'Hyper-Violent', 'Family-Friendly', 'Subversive', 'Existential', 'Viral', 'Edgy',
  'Chaotic', 'Shameless', 'Tone-Deaf', 'Syndicated', 'Pandering', 'Nostalgic', 'Crowdfunded', 'Incomprehensible'
, 'Vape-Scented', 'Anti-Woke', 'Girlboss', 'Crypto-Backed', 'AI-Generated', 'Tax-Evading', 'Oscar-Thirsty', 'Cancellable', 'Tone-Deaf', 'Virtue-Signaling', 'Nostalgia-Baiting', 'IP-Laundering', 'Uninsurable', 'Direct-To-Video', 'Has-Been',
  'Brand-Safe', 'Algorithmic', 'Over-Indexed', 'Under-Performing', 'Data-Mined', 'A24-Style', 'Tonal-Misfire', 'Focus-Grouped', 'Ghostwritten', 'Demographically-Targeted', 'Syndication-Bait', 'Deepfaked', 'Studio-Mandated', 'Crowd-Pleasing', 'Tax-Sheltered',
  'Tax-Sheltered', 'Algorithm-Approved', 'Nepo-Baby-Led', 'Focus-Group-Tested', 'Merch-Driven', 'TikTok-Optimized', 'VFX-Heavy', 'CGI-Bloated', 'Contractually-Obligated', 'Ghost-Directed', 'Uninsurable', 'PR-Disaster', 'Deepfake-Assisted', 'Billionaire-Funded', 'Union-Busting'];

const PROJECT_NOUNS = [
  'Tentpole', 'Cinematic Universe', 'Vanity Project', 'Cash Grab', 'Reboot', 'Origin Story', 'Four-Quadrant Hit', 'Oscar Bait', 'Tax Write-off', 'Algorithm', 'Focus Group', 'Franchise', 'Merchandising Opportunity', 'Streaming Wars', 'Demographic',
  'Echo', 'Whisper', 'Shadow', 'Sun', 'Moon', 'Star', 'Dream', 'Nightmare',
  'City', 'Mountain', 'River', 'Forest', 'Ocean', 'Island', 'Tower', 'Castle',
  'Content', 'IP', 'Podcast Adaptation', 'Graphic Novel', 'Limited Run', 'Spin-off', 'Prequel', 'Sequel', 'Trilogy', 'Crossover', 'Event', 'Experience', 'Platform', 'Saga', 'Chronicle',
  'Multiverse', 'Money Pit', 'Brand Synergy', 'TikTok Trend', 'Nostalgia Bait', 'Legacy Sequel', 'Toy Commercial'
, 'Tik-Tok Dance', 'Apology Video', 'Podcast Grift', 'NFT Scam', 'Subreddit Myth', 'Cancel Culture Hit-Piece', 'Nepo-Baby Vehicle', 'Wellness Retreat', 'Juice Cleanse', 'Pyramid Scheme', 'True Crime Exploitation', 'Merch Drop', 'Brand Deal', 'Focus Group Failure', 'Contractual Obligation',
  'Content Farm', 'Viewer Retention Strategy', 'Metrics Dump', 'Engagement Trap', 'Synergy Play', 'Product Placement', 'Merch Extravaganza', 'Spin-Off Generator', 'Sub-Franchise', 'Legacy IP', 'Re-Imagining', 'Cash-Cow', 'Tax-Loophole', 'Market Correction', 'Demographic Shift',
  'Apology Tour', 'Crypto-Scam', 'Podcast Adaptation', 'Product Integration', 'Toy Commercial', 'Reshoot Disaster', 'IP Laundering Scheme', 'Vanity Vehicle', 'Focus Group Casualty', 'Tax Write-Off', 'Content Pivot', 'Demographic Play', 'Merch Extravaganza', 'Synergy Mandate', 'Legacy Cash-Grab'];


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
  ,
    `A painfully long ${type} funded entirely by a mysterious foreign prince seeking an Oscar.`,
    `An 'empowering' ${genre} ${origin} that accidentally reinforces every stereotype it claims to dismantle.`,
    `A frantic, unwatchable ${type} directed entirely over Zoom because the auteur refused to leave their private island.`,
    `A ${budgetTier}-budget ${genre} vehicle explicitly designed to relaunch a cancelled actor's career.`,
    `A ${genre} ${type} where the lead actor demanded to rewrite the script mid-shoot using ChatGPT.`,
    `A ${budgetTier}-tier ${genre} ${type} that feels like a two-hour commercial for a new energy drink.`,
    `A ${origin} that the studio is releasing purely to retain the rights to the IP before they expire.`,
    `A painfully bleak ${genre} ${type} that the marketing team is desperately trying to sell as a comedy.`,
    `A ${budgetTier}-budget ${genre} ${type} that is 100% green screen and zero percent acting.`,
    `A ${genre} ${origin} starring a nepotism baby who has never read a script before in their life.`,
    `An incomprehensible ${genre} ${type} that the director claims is a 'satire of late-stage capitalism'.`,
    `A ${budgetTier}-tier ${type} that legally cannot be released in three major international territories.`,
    `An incredibly expensive ${genre} ${type} that ends on a baffling cliffhanger for a sequel that won't happen.`,
    `A ${budgetTier}-budget ${type} built around a washed-up action star who refuses to run or jump.`,
    `A ${genre} ${type} that requires audiences to have watched six different spin-off shows to understand the plot.`,
    `A hollow ${genre} ${type} designed specifically to sell a new line of collectible vinyl figures.`,
    `An expensive ${budgetTier}-tier ${type} that serves entirely as a soft launch for a bizarre crypto-currency.`,
    `A ${genre} ${origin} heavily featuring a nepotism baby who couldn't memorize a single line.`,
    `A heavily sanitized ${genre} ${type} built backwards from foreign censorship requirements.`,
    `A ${budgetTier}-budget ${genre} vehicle that exists just to justify an expensive executive retreat.`,
    `An over-stuffed ${origin} that randomly switches genres every twenty minutes to maximize SEO keywords.`,
    `A deeply cynical ${genre} ${type} using deceased actors resurrected via uncanny valley CGI.`,
    `A 'spiritual sequel' ${type} that legally cannot reference the original ${genre} film it's ripping off.`,
    `A ${budgetTier}-budget ${genre} ${type} entirely dictated by a deranged tech billionaire's Twitter poll.`,
    `A ${genre} ${origin} that was literally generated by feeding a focus group's neural data into an AI.`,
    `A exhausting, grimdark ${genre} ${type} reboot that completely misunderstands the original's charm.`,
    `An unwatchable ${budgetTier}-tier ${type} that the studio is releasing exclusively to a failed streaming app.`,
    `A ${genre} ${type} that serves as an elaborate, feature-length apology tour for a cancelled director.`,
    `A ${genre} ${origin} where the real drama is the ongoing, highly-publicized lawsuit between the co-stars.`
  ,
    `A ${budgetTier}-budget ${type} that was greenlit solely because the lead actor threatened to quit the studio's main franchise.`,
    `An incomprehensible ${genre} ${type} where the director was fired and replaced by an AI three weeks into shooting.`,
    `A legally mandated ${origin} produced just so the studio doesn't lose the rights to the intellectual property.`,
    `A ${budgetTier}-tier ${genre} ${type} that serves as a feature-length advertisement for an obscure cryptocurrency.`,
    `An 'edgy' ${genre} ${type} that the test audiences absolutely despised, forcing $5M in emergency reshoots.`,
    `A bizarre ${type} funded entirely by a mysterious oligarch who wanted to see their pet dog in a movie.`,
    `A ${budgetTier}-budget ${genre} vehicle specifically tailored to rehabilitate the image of a recently cancelled A-lister.`,
    `A ${genre} ${origin} that has been in development hell for so long, the original target demographic has died of old age.`,
    `A bloated ${budgetTier}-tier ${type} that's secretly just a tax avoidance scheme disguised as a cinematic universe.`,
    `An aggressive ${genre} ${type} built backwards from a viral TikTok dance that is already deeply embarrassing.`,
    `A soulless ${genre} ${origin} where the real drama is the ongoing, highly-publicized lawsuit between the co-stars.`,
    `A ${budgetTier}-budget ${type} that legally cannot be released in three major international territories due to copyright infringement.`,
    `A deeply cynical ${genre} ${type} using deceased actors resurrected via terrifying 'uncanny valley' CGI.`,
    `An exhausting ${type} that requires audiences to have watched six different spin-off shows to understand the opening scene.`,
    `A ${budgetTier}-budget ${genre} ${type} entirely dictated by a deranged tech billionaire's Twitter poll.`
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
