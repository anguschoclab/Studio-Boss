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
  'Studios rely on legacy IP for {pct}% of their upcoming release slate'
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
  '${directorName}\'s passion project ${projectName} sent straight to ad-supported streaming tier.'
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
  '{rival} caught artificially inflating box office numbers for their ${budget}M {genre} release'
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
