import { Opportunity, BudgetTierKey, TvFormatKey } from '@/engine/types';
import { GENRES, TARGET_AUDIENCES } from '../data/genres';
import { pick, randRange, secureRandom } from '../utils';
 // Reuse some generation logic if needed, or build new one

const PROJECT_ADJECTIVES = [
  'Extortionate', 'PR-Cursed', 'Algorithmically-Mandated', 'Sovereign-Citizen-Funded', 'Cryptocurrency-Evading', 'TikTok-Ruined', 'VFX-Destitute', 'Focus-Group-Mutilated',
  'De-Aged', 'Self-Funded', 'Cryptocurrency-Backed', 'Anti-Woke', 'Over-Indulgent', 'Tone-Policied', 'Has-Been-Led', 'Reboot-of-a-Reboot', 'Nepotism-Heavy', 'AI-Generated', 'Unwatchably-Dark', 'PR-Nightmare', 'CGI-Saturated', 'Legally-Ambiguous', 'Tax-Avoidant',

  'Cursed', 'Bloated', 'Pretentious', 'Gritty', 'Unnecessary', 'Rebooted', 'Overbudget', 'Derivative', 'Visionary', 'Cinematic', 'Algorithm-Driven', 'IP-Mining', 'Vain', 'Lethal', 'Synergistic',
  'Dark', 'Neon', 'Silent', 'Golden', 'Lost', 'Forgotten', 'Broken', 'Hidden',
  'Wild', 'Cold', 'Last', 'First', 'Final', 'Secret', 'Midnight', 'Crimson',
  'Micro-Budget', 'Banned', 'Cult', 'Divisive', 'Misunderstood', 'Post-Modern', 'Meta', 'Self-Aware', 'Interactive', 'Hyper-Violent', 'Family-Friendly', 'Subversive', 'Existential', 'Viral', 'Edgy',
  'Chaotic', 'Shameless', 'Tone-Deaf', 'Syndicated', 'Pandering', 'Nostalgic', 'Crowdfunded', 'Incomprehensible'
, 'Vape-Scented', 'Anti-Woke', 'Girlboss', 'Crypto-Backed', 'AI-Generated', 'Tax-Evading', 'Oscar-Thirsty', 'Cancellable', 'Tone-Deaf', 'Virtue-Signaling', 'Nostalgia-Baiting', 'IP-Laundering', 'Uninsurable', 'Direct-To-Video', 'Has-Been',
  'Brand-Safe', 'Algorithmic', 'Over-Indexed', 'Under-Performing', 'Data-Mined', 'A24-Style', 'Tonal-Misfire', 'Focus-Grouped', 'Ghostwritten', 'Demographically-Targeted', 'Syndication-Bait', 'Deepfaked', 'Studio-Mandated', 'Crowd-Pleasing', 'Tax-Sheltered',
  'Tax-Sheltered', 'Algorithm-Approved', 'Nepo-Baby-Led', 'Focus-Group-Tested', 'Merch-Driven', 'TikTok-Optimized', 'VFX-Heavy', 'CGI-Bloated', 'Contractually-Obligated', 'Ghost-Directed', 'Uninsurable', 'PR-Disaster', 'Deepfake-Assisted', 'Billionaire-Funded', 'Union-Busting', 'Unwatchable', 'Boycotted', 'Desperate', 'Cringe-Inducing', 'Tone-Shifted', 'Recut', 'Over-Lit', 'Focus-Group-Ruined', 'Tax-Fraudulent', 'Lawsuit-Waiting', 'PR-Managed', 'Ghost-Produced', 'Audience-Alienating', 'Trend-Chasing', 'Nepotism-Fueled', 'Disgraced', 'Blacklisted', 'Apology-Driven', 'Litigation-Baiting', 'Hacktivist-Leaked', 'Deepfaked-Beyond-Recognition', 'Extorted', 'Cancel-Proof', 'VFX-Rushed', 'Cult-Adjacent', 'Apology-Format', 'Micro-Targeted', 'Gaslight-Heavy', 'Defamatory', 'Legally-Bound', 'Nepo-Baby-Directed', 'Sovereign-Citizen-Funded', 'Vape-Clouded'];

const PROJECT_NOUNS = [
  'Nepotism Vehicle', 'Tax-Evasion Scheme', 'Defamation Settlement', 'Crypto-Scam Spinoff', 'Audience Test Disaster',
  'Tax Write-off', 'Apology Video Extended Cut', 'Podcast Spin-off', 'Focus Group Disaster', 'Legacy Sequel', 'Cinematic Universe Attempt', 'Vanity Project', 'Merchandise Commercial', 'Brand Synergy Play', 'Legal Loophole', 'NFT Cash Grab', 'Direct-to-Streaming Dump', 'TikTok Trend Movie', 'Algorithm Bait', 'Studio Mandate',

  'Tentpole', 'Cinematic Universe', 'Vanity Project', 'Cash Grab', 'Reboot', 'Origin Story', 'Four-Quadrant Hit', 'Oscar Bait', 'Tax Write-off', 'Algorithm', 'Focus Group', 'Franchise', 'Merchandising Opportunity', 'Streaming Wars', 'Demographic',
  'Echo', 'Whisper', 'Shadow', 'Sun', 'Moon', 'Star', 'Dream', 'Nightmare',
  'City', 'Mountain', 'River', 'Forest', 'Ocean', 'Island', 'Tower', 'Castle',
  'Content', 'IP', 'Podcast Adaptation', 'Graphic Novel', 'Limited Run', 'Spin-off', 'Prequel', 'Sequel', 'Trilogy', 'Crossover', 'Event', 'Experience', 'Platform', 'Saga', 'Chronicle',
  'Multiverse', 'Money Pit', 'Brand Synergy', 'TikTok Trend', 'Nostalgia Bait', 'Legacy Sequel', 'Toy Commercial'
, 'Tik-Tok Dance', 'Apology Video', 'Podcast Grift', 'NFT Scam', 'Subreddit Myth', 'Cancel Culture Hit-Piece', 'Nepo-Baby Vehicle', 'Wellness Retreat', 'Juice Cleanse', 'Pyramid Scheme', 'True Crime Exploitation', 'Merch Drop', 'Brand Deal', 'Focus Group Failure', 'Contractual Obligation',
  'Content Farm', 'Viewer Retention Strategy', 'Metrics Dump', 'Engagement Trap', 'Synergy Play', 'Product Placement', 'Merch Extravaganza', 'Spin-Off Generator', 'Sub-Franchise', 'Legacy IP', 'Re-Imagining', 'Cash-Cow', 'Tax-Loophole', 'Market Correction', 'Demographic Shift',
  'Apology Tour', 'Crypto-Scam', 'Podcast Adaptation', 'Product Integration', 'Toy Commercial', 'Reshoot Disaster', 'IP Laundering Scheme', 'Vanity Vehicle', 'Focus Group Casualty', 'Tax Write-Off', 'Content Pivot', 'Demographic Play', 'Merch Extravaganza', 'Synergy Mandate', 'Legacy Cash-Grab', 'Apology Tour', 'Crypto Scam', 'Influencer Collab', 'Brand Integration', 'Toy Line', 'Damage Control', 'Legal Nightmare', 'Ransomware Attack', 'Viral Mistake', 'Review Bomb Target', 'Deficit Financed Disaster', 'Algorithm Glitch', 'Synergy Experiment', 'Tax Dodge', 'Focus Group Anomaly', 'Defamation Lawsuit', 'Extortion Scheme', 'PR Disaster', 'Damage Control Tour', 'Reddit Thread', 'Leak', 'Bailout', 'Bankruptcy Filing', 'Streaming-Service Tax Dodge', 'Hush-Money Payout', 'Damage-Control Press Tour', 'Crypto Collapse Story', 'CGI Monster Flop', 'Subreddit Conspiracy', 'Review-Bomb Casualty', 'Focus Group Hallucination', 'Algorithm-Generated Mess', 'Merch Dump'];

function generateFlavor(genre: string, type: string, budgetTier: BudgetTierKey, origin: string): string {
  const cynicalFlavors = [
  `A ${budgetTier}-tier ${type} that the lead actor agreed to solely to pay off their devastating crypto losses.`,
  `A ${genre} ${origin} that is technically just a front for an elaborate international money-laundering operation.`,
  `An aggressively ${genre} ${type} mandated by a tech CEO who thinks they are a visionary storyteller.`,
  `A frantic ${type} where every single line of dialogue was rewritten by a sentient marketing algorithm to maximize 'engagement'.`,
  `A ${budgetTier}-budget ${genre} ${origin} that the studio is releasing only because it's cheaper than burying it in a landfill.`,

  `A frantic ${genre} ${type} cobbled together entirely from unused B-roll and AI upscaling.`,
  `A deeply cynical ${budgetTier}-tier ${type} that feels less like a movie and more like a threat.`,
  `A ${genre} ${origin} that the studio is only releasing to maintain the rights to a 40-year-old action figure line.`,
  `An over-budget ${genre} ${type} starring a lead who very clearly didn't read the script.`,
  `A visually repulsive ${genre} ${type} where you can pinpoint the exact day the VFX budget ran out.`,
  `A 'modern update' of a classic ${genre} ${origin} that misses the point of the original so completely it's almost impressive.`,
  `A bloated ${budgetTier}-budget ${type} that serves primarily as a two-hour commercial for an energy drink.`,
  `An incomprehensible ${genre} ${type} that the director refuses to explain, calling it 'too elevated' for general audiences.`,
  `A ${budgetTier}-tier ${genre} ${origin} that was clearly written around the star's refusal to do any scenes outdoors.`,
  `A ${genre} ${type} that is 90% set-up for a cinematic universe that will literally never happen.`,

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

  ,
    `A frankly insulting ${genre} ${type} that attempts to capitalize on a recent national tragedy.`,
    `A frantic ${budgetTier}-tier ${type} that the lead actor signed onto purely to pay off gambling debts.`,
    `A ${genre} ${origin} that includes a 10-minute uninterrupted commercial for a failing tech startup.`,
    `A ${budgetTier}-budget ${genre} vehicle that was obviously written by the director's 14-year-old child.`,
    `An inexplicably expensive ${type} entirely shot on a soundstage to accommodate the lead's house arrest.`,
    `A grim ${genre} ${type} that the studio executives are legally barred from discussing in public.`,
    `A ${budgetTier}-budget ${genre} ${type} that is secretly just a massive, incredibly complex money laundering scheme.`,
    `A profoundly tone-deaf ${type} that manages to offend four distinct demographics within the first act.`,
    `A ${genre} ${origin} starring a completely untrained influencer who stares blankly at the teleprompter in every scene.`,
    `A heavily recut ${genre} ${type} where you can vividly feel the exact moment the studio panicked.`,
    `A ${budgetTier}-budget ${type} that exists solely to fulfill an obscure, 20-year-old contractual obligation.`,
    `An agonizing ${genre} ${type} where the characters constantly mention the title of the movie out loud.`,
    `A visually incoherent ${origin} where the entire CGI budget was allegedly embezzled.`,
    `A bizarre ${budgetTier}-tier ${genre} ${type} that heavily implies the main character is the CEO of the sponsoring brand.`,
    `An aggressive ${type} that the marketing department is trying to rebrand as a 'tax write-off' to lower expectations.`

    ,`A heavily litigated ${origin} that the studio hopes will cover the costs of last month's PR disaster.`,
    `A ${budgetTier}-tier ${type} starring a disgraced actor trying to re-enter the public's good graces.`,
    `A panicked ${genre} ${type} cobbled together from deepfakes after the lead fled the country.`,
    `An 'apology-driven' ${origin} meant to distract the internet from the director's resurfaced tweets.`,
    `A ${genre} ${type} that is currently the subject of a massive defamation lawsuit by a former child star.`,
    `A ${budgetTier}-tier ${type} leaked by a hacktivist group to expose the studio's terrible CGI budget.`,
    `A desperate ${type} fast-tracked to distract shareholders from a looming bankruptcy filing.`
  ,
  `A ${budgetTier}-budget ${type} that serves as a thinly veiled apology for the director's recent public meltdown.`,
  `An overstuffed ${genre} ${origin} that's legally required to feature the producer's untalented nephew in every scene.`,
  `A ${genre} ${type} that was entirely written by a sentient marketing algorithm, and it feels like it.`,
  `A desperate ${genre} ${type} fast-tracked to distract from the studio's looming SEC investigation.`,
  `A ${budgetTier}-tier ${origin} that the lead actor refuses to promote unless the studio funds their Mars colony.`,
  `An exhausting ${type} shot entirely in 'The Volume' because the star is afraid of actual sunlight.`,
  `A visually unappealing ${genre} ${type} where the CGI budget was spent entirely on de-aging the 70-year-old lead.`,
  `A ${budgetTier}-budget ${genre} ${type} that attempts to capitalize on a viral meme from five years ago.`,
  `A ${genre} ${origin} that is currently the subject of a massive defamation lawsuit by a rival studio.`,
  `A frankly insulting ${type} that tries to launch a 'Cinematic Universe' out of a public domain board game.`,
  `An incredibly dense ${genre} ${origin} that requires an active subscription to a failing streaming service to understand.`,
  `A ${budgetTier}-tier ${type} cobbled together from the unused B-roll of three different, cancelled ${genre} movies.`,
  `A ${genre} ${type} that the test audiences actively tried to destroy the screen during.`,
  `A ${budgetTier}-budget ${origin} that is secretly just an hour-long commercial for a controversial energy drink.`,
  `A deeply cynical ${genre} ${type} designed to appeal exclusively to a demographic that doesn't actually exist.`

  ,
  `A ${budgetTier}-budget ${type} that serves as a thinly veiled apology for the director's recent public meltdown.`,
  `An overstuffed ${genre} ${origin} that's legally required to feature the producer's untalented nephew in every scene.`,
  `A ${genre} ${type} that was entirely written by a sentient marketing algorithm, and it feels like it.`,
  `A desperate ${genre} ${type} fast-tracked to distract from the studio's looming SEC investigation.`,
  `A ${budgetTier}-tier ${origin} that the lead actor refuses to promote unless the studio funds their Mars colony.`,
  `An exhausting ${type} shot entirely in 'The Volume' because the star is afraid of actual sunlight.`,
  `A visually unappealing ${genre} ${type} where the CGI budget was spent entirely on de-aging the 70-year-old lead.`,
  `A ${budgetTier}-budget ${genre} ${type} that attempts to capitalize on a viral meme from five years ago.`,
  `A ${genre} ${origin} that is currently the subject of a massive defamation lawsuit by a rival studio.`,
  `A frankly insulting ${type} that tries to launch a 'Cinematic Universe' out of a public domain board game.`,
  `An incredibly dense ${genre} ${origin} that requires an active subscription to a failing streaming service to understand.`,
  `A ${budgetTier}-tier ${type} cobbled together from the unused B-roll of three different, cancelled ${genre} movies.`,
  `A ${genre} ${type} that the test audiences actively tried to destroy the screen during.`,
  `A ${budgetTier}-budget ${origin} that is secretly just an hour-long commercial for a controversial energy drink.`,
  `A deeply cynical ${genre} ${type} designed to appeal exclusively to a demographic that doesn't actually exist.`
];
  return pick(cynicalFlavors);
}

export function generateProjectTitle(): string {
  if (secureRandom() > 0.5) {
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
  const isFilm = secureRandom() > 0.4;
  const genre: string = pick([...GENRES]);
  const targetAudience: string = pick([...TARGET_AUDIENCES]);
  const budgetTier = pick(['low', 'mid', 'high', 'blockbuster'] as BudgetTierKey[]);

  const type = pick(['script', 'package', 'pitch', 'rights'] as const);
  const origin = pick(['open_spec', 'agency_package', 'writer_sample', 'heat_list', 'passion_project'] as const);

  const weeksUntilExpiry = Math.floor(randRange(4, 12));
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
    weeksUntilExpiry,
    attachedTalentIds: talentIds && talentIds.length > 0 && secureRandom() > 0.5 ? [pick(talentIds)] : undefined,
    bids: {},
    expirationWeek: weeksUntilExpiry,
  };

  if (!isFilm) {
    opt.tvFormat = pick(['sitcom', 'procedural', 'prestige_drama', 'limited_series', 'animated_comedy', 'animated_prestige', 'daytime_soap', 'late_night_talk', 'sketch_comedy', 'sci_fi_epic', 'teen_drama', 'fantasy_epic', 'anthology_series', 'telenovela', 'historical_drama', 'medical_procedural'] as TvFormatKey[]);
    opt.episodes = opt.tvFormat === 'limited_series' ? 8 : 10;
    opt.releaseModel = 'weekly';
  }

  return opt;
}
