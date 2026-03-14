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
];

const TALENT_HEADLINES = [
  'A-list director reportedly shopping a passion project around town',
  'Rising star signs multi-picture deal, sending ripples through the industry',
  'Veteran screenwriter comes out of retirement for "one last script"',
  'Casting controversy sparks social media debate over upcoming tentpole',
  'Major talent agency announces restructuring amid industry shifts',
  'Acclaimed cinematographer signs exclusive deal with rival studio',
];

const RIVAL_TEMPLATES = [
  '{rival} greenlights ambitious ${budget}M {genre} project',
  '{rival} announces surprise release date shift for upcoming tentpole',
  '{rival} poaches key executive from competitor in aggressive move',
  '{rival} reports quarterly earnings above analyst expectations',
  '{rival} expands international distribution network',
  '{rival} launches new genre label targeting underserved audiences',
];

function fill(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.split(`{${key}}`).join(val);
  }
  return result;
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
