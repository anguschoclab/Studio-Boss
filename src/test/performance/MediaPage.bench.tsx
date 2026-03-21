import { describe, bench } from 'vitest';
import { Headline, HeadlineCategory } from '../../engine/types';

const generateHeadlines = (count: number): Headline[] => {
  const categories: HeadlineCategory[] = ['talent', 'rival', 'awards', 'market', 'general'];
  const headlines: Headline[] = [];
  for (let i = 0; i < count; i++) {
    headlines.push({
      id: `hl-${i}`,
      text: `Headline ${i}`,
      category: categories[i % categories.length],
      week: 1,
    });
  }
  return headlines;
};

const headlines1000 = generateHeadlines(1000);

describe('MediaPage Grouping Performance', () => {
  bench('Baseline (Multiple filters)', () => {
    headlines1000.filter(h => h.category === 'talent' || h.category === 'rival');
    headlines1000.filter(h => h.category === 'awards' || h.category === 'market');
    headlines1000.filter(h => h.category === 'general' || h.category === 'market');
    headlines1000.filter(h => h.category === 'market' || h.category === 'rival');
    headlines1000.filter(h => h.category === 'talent' || h.category === 'general');
  });

  bench('Optimized (Single pass reduce)', () => {
    const grouped = headlines1000.reduce(
      (acc, h) => {
        const c = h.category;
        if (c === 'talent') {
          acc.deadline.push(h);
          acc.insider.push(h);
        } else if (c === 'rival') {
          acc.deadline.push(h);
          acc.market.push(h);
        } else if (c === 'awards') {
          acc.variety.push(h);
        } else if (c === 'market') {
          acc.variety.push(h);
          acc.boxOffice.push(h);
          acc.market.push(h);
        } else if (c === 'general') {
          acc.boxOffice.push(h);
          acc.insider.push(h);
        }
        return acc;
      },
      {
        deadline: [] as Headline[],
        variety: [] as Headline[],
        boxOffice: [] as Headline[],
        market: [] as Headline[],
        insider: [] as Headline[],
      }
    );
    void grouped;
  });
});
