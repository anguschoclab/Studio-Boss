import { Headline, RivalStudio, HeadlineCategory } from '../types';
import { pick } from '../utils';

const MARKET_HEADLINES = [
  'Box office up {pct}% this quarter as audiences return to theaters',
  'Streaming wars intensify as subscriber growth plateaus industry-wide',
  'Horror genre sees unprecedented demand from international markets',
  'Critics declare this season\'s slate the strongest in years',
  'Industry analysts predict a correction in blockbuster spending',
  'Award season heats up with several surprise frontrunners',
  'International markets now account for 70% of major releases\' gross',
  'Indie distributors report record acquisition deals at festivals',
  'Studio lot space at a premium as production volumes surge',
  'Audience surveys show appetite for original IP over sequels',
  'Streaming bubble bursts as platforms see {pct}% drop in ad revenue',
  'Algorithmic decision making leads to {pct}% increase in predictable plots',
  'Audiences reject AI-generated scripts, box office plummets by {pct}%',
  'Nostalgia fatigue sets in, reboot revenue down {pct}% year-over-year',
  'Indie studios pivot to TikTok, seeing {pct}% engagement bumps',
  'Merchandising overtakes ticket sales by {pct}% for major franchises',
  'Wall Street panics as legacy studio stock drops {pct}% after latest flop',
  'Theatrical window shrinks again, now down to {pct} days for mid-budget films',
  'Crypto crash wipes out {pct}% of independent film financing overnight',
  'Focus groups demand more CGI, budget averages up {pct}% this quarter',
  'Studio executives claim {pct}% of viral marketing is entirely accidental',
  'Test audiences confused by original IP, demand {pct}% more familiar tropes',
  'Streaming platforms quietly cancel {pct}% of their animated slate',
  'Subscription fatigue: Viewers cancel streaming services at {pct}% higher rate',
  'Algorithm recommends {pct}% more true crime documentaries to depressed populace',
  'Box office heavily polarized: Top {pct}% of films make 90% of revenue',
  'Influencer cameos increase marketing reach by {pct}%, but alienate critics',
  'Gen Z ignores traditional marketing, {pct}% of tracking data deemed useless',
  'International regulators threaten {pct}% tax on algorithmic content',
  'Studios rely on legacy IP for {pct}% of their upcoming release slate',

  'Tech giant acquires legacy studio solely for its vast library of reality TV IP',
  'Theater chains threaten boycott as studios announce day-and-date streaming releases',
  'Analysts predict the "superhero fatigue" bubble will finally burst this quarter',
  'AI-generated screenplay wins major festival award, industry writers threaten strike',
  'Box office heavily skewed towards sequels: {pct}% of top grossing films are not original IP',
  'Streaming service quietly removes hundreds of titles to avoid paying residual fees',
  'Gen Z entirely abandons traditional marketing, forcing studios to rely on TikTok dances',
  'Algorithm recommends aggressively niche sub-genres, causing a {pct}% spike in obscure indie films',
  'Studios panic as focus groups reject all films longer than 90 minutes',
  'Merchandising revenue outpaces box office by {pct}% for the latest cinematic universe entry',
  'International markets reject heavily localized comedy, leading to a {pct}% drop in overseas revenue',
  'Nostalgia bait proves highly effective: Reboot of 90s cartoon grosses more than original run',
  'Crypto crash decimates indie film financing, multiple projects halted indefinitely',
  'Wall Street rewards studio for aggressive cost-cutting and cancellation of completed films',
  'Audiences demand interactive content, studios struggle to pivot to "choose your own adventure"',
  'Subscription fatigue hits critical mass: Viewers actively cancel streaming services post-binge',
  'Studios increasingly rely on deepfake technology to resurrect deceased actors for cameos',
  'Algorithmic decision making leads to a slate of {pct}% identical romantic comedies',
  'Box office polarization worsens: Mid-budget films effectively extinct, analysts say',
  'Influencer cameos alienate critics but increase organic marketing reach by {pct}%',
  'Studios attempt to manufacture viral memes for their upcoming releases, with mixed results',
  'Focus groups demand more ambiguous endings, resulting in a {pct}% increase in cliffhangers',
  'Piracy of streaming exclusives jumps {pct}% as subscription costs hit all-time high',
  'Studios attempt to monetize fan fiction, facing a {pct}% increase in copyright lawsuits',
  'Viral hate-watching drives a {pct}% spike in viewership for critically panned series',
  'Virtual reality theatrical experiences fail to catch on, resulting in a {pct}% drop in investment',
  'Fast food tie-in toys leaked plot details for {pct}% of major summer blockbusters',
  'A24-style "elevated horror" sees a {pct}% return on investment despite confusing audiences',
  'Studios aggressively pivot to "cozy" programming following a {pct}% drop in news viewership',
  'Deepfake technology used to dub {pct}% of international releases, saving millions in localization',
  'The "Tomatoes" aggregate score proven to impact opening weekend box office by up to {pct}%',
  'Merchandising for adult-oriented animated series outpaces kids\' shows by {pct}% this quarter'
];

const TALENT_HEADLINES = [
  'A-list director reportedly shopping a passion project around town',
  'Rising star signs multi-picture deal, sending ripples through the industry',
  'Veteran screenwriter comes out of retirement for "one last script"',
  'Casting controversy sparks social media debate over upcoming tentpole',
  'Major talent agency announces restructuring amid industry shifts',
  'Acclaimed cinematographer signs exclusive deal with rival studio',
  'Legacy child demands a rewrite to emphasize their leading role',
  'Industry royalty family packages a prestige drama on their terms',
  'Audiences reject transparent nepotism casting in new blockbuster',
  'Dynasty heir throws a tantrum on set, causing production delays',
  '${projectName} testing poorly with audiences, sources say ${directorName} is locked out of the editing bay.',
  'Method actor refuses to break character on set of ${projectName}, terrorizes craft services.',
  '${directorName} demands name removed from ${projectName} after studio enforces PG-13 cut.',
  'Viral TikTok campaign accidentally saves ${projectName} from being a total tax write-off.',
  'A-list star of ${projectName} caught in PR nightmare after leaked crypto scam involvement.',
  '${directorName} blames "woke audiences" for the spectacular failure of ${projectName}.',
  'Production on ${projectName} halted after lead actor refuses to leave their luxury trailer.',
  'Sources claim ${directorName} used AI to write the third act of ${projectName}.',
  'Fans petition to digitally replace lead in ${projectName}, studio surprisingly open to the idea.',
  '${directorName} claims ${projectName} is a "four-hour masterpiece", studio demands a tight 90 minutes.',
  'Nepo-baby star of ${projectName} gives tone-deaf interview, PR team working overtime.',
  '${projectName} marketing team desperately trying to manufacture a viral meme.',
  'Crew of ${projectName} threatens strike over ${directorName}\'s grueling 18-hour shoot days.',
  '${directorName} walks away from ${projectName} citing "creative differences" and "a hostile algorithm".',
  'Lead actor of ${projectName} launches competing lifestyle brand mid-press tour.',
  'Studio accidentally leaks entire plot of ${projectName} in a branded fast-food tie-in.',
  '${directorName} insists ${projectName} requires an unprecedented $50M marketing budget.',
  'Focus group describes ${projectName} as "content", ${directorName} reportedly devastated.',
  'Star of ${projectName} caught using a body double for emotionally demanding scenes.',
  '${directorName}\'s passion project ${projectName} sent straight to ad-supported streaming tier.',

  'A-list star of ${projectName} caught in PR nightmare after leaked audio of on-set meltdown.',
  '${directorName} demands name removed from ${projectName} after studio completely recuts third act.',
  'Viral TikTok campaign accidentally saves ${projectName} from being a total tax write-off.',
  'Lead actor of ${projectName} launches competing lifestyle brand mid-press tour, infuriating studio.',
  'Studio accidentally leaks entire plot of ${projectName} in a branded fast-food tie-in toy.',
  '${directorName} insists ${projectName} requires an unprecedented $100M marketing budget for "awareness".',
  'Focus group describes ${projectName} as "content", ${directorName} reportedly devastated and seeking therapy.',
  'Star of ${projectName} caught using a body double for emotionally demanding, non-physical scenes.',
  '${directorName}\'s passion project ${projectName} sent straight to ad-supported streaming tier to die.',
  'Nepo-baby star of ${projectName} gives tone-deaf interview comparing acting to manual labor.',
  'Crew of ${projectName} threatens strike over ${directorName}\'s grueling, "visionary" 18-hour shoot days.',
  '${directorName} walks away from ${projectName} citing "creative differences" and "a hostile algorithm".',
  'Fans petition to digitally replace lead in ${projectName}, studio surprisingly open to the cost-saving idea.',
  '${directorName} claims ${projectName} is a "four-hour masterpiece", studio demands a tight 90 minutes.',
  'Sources claim ${directorName} used AI to write the emotional climax of ${projectName}.',
  'Method actor refuses to break character on set of ${projectName}, terrorizes craft services staff.',
  'Production on ${projectName} halted after lead actor refuses to leave their luxury trailer over a wardrobe dispute.',
  '${directorName} blames "woke audiences" for the spectacular failure of ${projectName} at the box office.',
  '${projectName} marketing team desperately trying to manufacture a viral meme using outdated slang.',
  'Veteran screenwriter brought in to "fix" ${projectName} demands triple their usual rate to deal with ${directorName}.',
  'Studio executives reportedly fell asleep during the premiere screening of ${projectName}.',
  '${directorName} insists the CGI backlash for ${projectName} is a coordinated smear campaign.',
  'Lead actor of ${projectName} launches an overpriced skincare line instead of promoting the movie.',
  'Studio accidentally uploaded the entire rough cut of ${projectName} to a public torrent site.',
  '${directorName} reportedly consulted an astrologer to determine the release date of ${projectName}.',
  'Focus group for ${projectName} spent 45 minutes complaining about the protagonist\'s haircut.',
  'Star of ${projectName} refuses to do press, citing "energetic misalignment".',
  '${directorName}\'s passion project ${projectName} is reportedly an elaborate tax write-off scheme.',
  'Nepo-baby star of ${projectName} gives tone-deaf interview defending their billionaire parents.',
  'Crew of ${projectName} threatens strike over lack of vegan craft service options.',
  '${directorName} claims ${projectName} was ruined by studio notes, promises a "Snyder Cut" in 5 years.',
  'Fans launch a GoFundMe to remake ${projectName} without the involvement of ${directorName}.',
  'Sources claim ${directorName} used ChatGPT to script the entire emotional climax of ${projectName}.',
  'Method actor demands crew address them by character name even during bathroom breaks on ${projectName}.',
  'Production on ${projectName} delayed after lead actress refuses to work with an "uncalibrated aura".',
  '${directorName} blames "woke critics" for the spectacular failure of ${projectName} at Cannes.',
  '${projectName} marketing team desperately trying to manufacture a TikTok dance trend.',
  'Veteran script doctor brought in to "fix" ${projectName} immediately quits and checks into rehab.'
];

const RIVAL_TEMPLATES = [
  '{rival} greenlights ambitious ${budget}M {genre} project',
  '{rival} announces surprise release date shift for upcoming tentpole',
  '{rival} poaches key executive from competitor in aggressive move',
  '{rival} reports quarterly earnings above analyst expectations',
  '{rival} expands international distribution network',
  '{rival} launches new genre label targeting underserved audiences',
  '{rival} announces ${budget}M {genre} cinematic universe, analysts skeptical',
  '{rival} attempts to launch a {genre} franchise, but focus groups hate it',
  '{rival} pivots entirely to {genre} content, citing algorithmic trends',
  '{rival} CEO promises their new ${budget}M {genre} film will save cinema',
  '{rival} writes off a completed ${budget}M {genre} project for tax purposes',
  '{rival} buys rights to a viral tweet, adapting it into a ${budget}M {genre} movie',
  '{rival} insists their upcoming {genre} slate is "not just content, it\'s cinema"',
  '{rival} aggressively poaches TikTok influencers for new {genre} initiative',
  '{rival} stock plummets after disastrous test screening of their ${budget}M {genre} tentpole',
  '{rival} reboots a classic {genre} franchise, fans immediately revolt online',
  '{rival} claims their ${budget}M {genre} film was "made for the fans, not critics"',
  '{rival} restructures executive board after ${budget}M {genre} flop',
  '{rival} desperately trying to artificially create a viral trend for their new {genre} release',
  '{rival} acquires struggling indie studio to harvest their {genre} IP',
  '{rival} announces they will use AI to generate all future {genre} scripts',
  '{rival} spends ${budget}M on Super Bowl ad for {genre} movie everyone forgot existed',
  '{rival} heavily leans into nostalgia bait for their upcoming {genre} sequel',
  '{rival} blames toxic fandom for the underperformance of their ${budget}M {genre} reboot',
  '{rival} greenlights a gritty, dark reboot of a beloved family {genre} property',
  '{rival} caught artificially inflating box office numbers for their ${budget}M {genre} release',

  '{rival} attempts to launch a {genre} franchise, but focus groups hate the protagonist',
  '{rival} pivots entirely to {genre} content, citing algorithmic trends and ignoring creative instinct',
  '{rival} CEO promises their new ${budget}M {genre} film will save cinema, analysts remain skeptical',
  '{rival} writes off a completed ${budget}M {genre} project for tax purposes, angering creators',
  '{rival} buys rights to a viral tweet, adapting it into a ${budget}M {genre} movie no one asked for',
  '{rival} insists their upcoming {genre} slate is "not just content, it\'s cinema"',
  '{rival} aggressively poaches TikTok influencers for new {genre} initiative, confusing core demographic',
  '{rival} stock plummets after disastrous test screening of their highly anticipated ${budget}M {genre} tentpole',
  '{rival} reboots a classic {genre} franchise, fans immediately revolt online and demand the original director',
  '{rival} claims their critically panned ${budget}M {genre} film was "made for the fans, not critics"',
  '{rival} restructures executive board after ${budget}M {genre} flop, citing "shifting market dynamics"',
  '{rival} desperately trying to artificially create a viral trend for their new {genre} release on TikTok',
  '{rival} acquires struggling indie studio solely to harvest their {genre} IP for future reboots',
  '{rival} announces they will use AI to generate all future {genre} scripts to cut production costs',
  '{rival} spends ${budget}M on Super Bowl ad for {genre} movie everyone forgot existed',
  '{rival} heavily leans into nostalgia bait for their upcoming {genre} sequel, bringing back entire original cast',
  '{rival} blames toxic fandom for the underperformance of their heavily marketed ${budget}M {genre} reboot',
  '{rival} greenlights a gritty, dark reboot of a beloved family friendly {genre} property, baffling parents',
  '{rival} caught artificially inflating box office numbers for their underperforming ${budget}M {genre} release',
  '{rival} announces ambitious ${budget}M {genre} cinematic universe, cancels it after first film bombs',
  '{rival} creates an entirely CGI actor to avoid paying residuals on their new ${budget}M {genre} project',
  '{rival} cancels a completed ${budget}M {genre} series, sparking outrage among cast and crew',
  '{rival} launches an exclusive streaming tier dedicated solely to behind-the-scenes {genre} featurettes',
  '{rival} attempts to rebrand their failing ${budget}M {genre} film as an "underrated cult classic"',
  '{rival} aggressively markets a ${budget}M {genre} release directly to Discord servers and subreddits',
  '{rival} CEO gets ratioed on Twitter defending the poor CGI in their latest {genre} blockbuster',
  '{rival} buys the rights to a popular TikTok meme, hoping to launch a {genre} franchise',
  '{rival} quietly buries their critically panned ${budget}M {genre} film on a Tuesday afternoon',
  '{rival} forces a cinematic universe crossover between a {genre} film and a fast-food mascot',
  '{rival} replaces striking writers with generative AI for their upcoming ${budget}M {genre} slate',
  '{rival} blames the "algorithm" for their ${budget}M {genre} flop missing its target demographic entirely'
];

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{([^}]+)\}/g, (match, key) => {
    return vars[key] !== undefined ? String(vars[key]) : match;
  });
}

let counter = 0;

export function generateHeadlines(week: number, rivals: RivalStudio[]): Headline[] {
  const count = 1 + Math.floor(Math.random() * 3);
  const headlines: Headline[] = [];
  const genrePool = ['sci-fi', 'drama', 'action', 'thriller', 'comedy', 'horror', 'fantasy'];

  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    let text: string;
    let category: HeadlineCategory;

    if (roll < 0.35 && rivals.length > 0) {
      const rival = pick(rivals);
      text = fill(pick(RIVAL_TEMPLATES), {
        rival: rival.name,
        budget: String(Math.floor(20 + Math.random() * 180)),
        genre: pick(genrePool),
      });
      category = 'rival';
    } else if (roll < 0.7) {
      text = fill(pick(MARKET_HEADLINES), {
        pct: String(Math.floor(5 + Math.random() * 20)),
      });
      category = 'market';
    } else {
      text = pick(TALENT_HEADLINES);
      category = 'talent';
    }

    headlines.push({ id: `h-${++counter}-${week}`, text, week, category });
  }

  return headlines;
}
