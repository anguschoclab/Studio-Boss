import { describe, it, expect } from 'vitest';
import { generateHeadlines } from '../../../engine/generators/headlines';
import { RivalStudio } from '../../../engine/types';

describe('generateHeadlines', () => {
  it('should generate between 1 and 3 headlines', () => {
    const week = 1;
    const rivals: RivalStudio[] = [];
    const headlines = generateHeadlines(week, rivals);

    expect(headlines.length).toBeGreaterThanOrEqual(1);
    expect(headlines.length).toBeLessThanOrEqual(3);
  });

  it('should return headlines with the correct structure', () => {
    const week = 5;
    const rivals: RivalStudio[] = [];
    const headlines = generateHeadlines(week, rivals);

    headlines.forEach(headline => {
      expect(headline).toHaveProperty('id');
      expect(typeof headline.id).toBe('string');
      expect(headline.id.startsWith('h-')).toBe(true);

      expect(headline).toHaveProperty('text');
      expect(typeof headline.text).toBe('string');

      expect(headline).toHaveProperty('week');
      expect(headline.week).toBe(week);

      expect(headline).toHaveProperty('category');
      expect(['rival', 'market', 'talent']).toContain(headline.category);
    });
  });

  it('should generate rival headlines if rivals are provided', () => {
    const week = 10;
    const rivals: RivalStudio[] = [
      { id: '1', name: 'Rival A', cash: 1000, projectCount: 0, motto: '', archetype: 'major', strength: 50, prestige: 50, recentActivity: '' },
      { id: '2', name: 'Rival B', cash: 2000, projectCount: 0, motto: '', archetype: 'major', strength: 50, prestige: 50, recentActivity: '' }
    ];

    // Run multiple times to ensure we hit the 35% chance for a rival headline
    let foundRivalHeadline = false;
    for (let i = 0; i < 20; i++) {
      const headlines = generateHeadlines(week, rivals);
      if (headlines.some(h => h.category === 'rival')) {
        foundRivalHeadline = true;
        break;
      }
    }

    expect(foundRivalHeadline).toBe(true);
  });

  it('should NOT generate rival headlines if NO rivals are provided', () => {
    const week = 10;
    const rivals: RivalStudio[] = [];

    // Run multiple times to ensure we don't accidentally generate a rival headline
    for (let i = 0; i < 20; i++) {
      const headlines = generateHeadlines(week, rivals);
      const hasRivalHeadline = headlines.some(h => h.category === 'rival');
      expect(hasRivalHeadline).toBe(false);
    }
  });
});
