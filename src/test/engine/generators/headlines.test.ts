import { describe, it, expect, beforeEach } from 'vitest';
import { generateHeadlines } from '../../../engine/generators/headlines';
import { RandomGenerator } from '../../../engine/utils/rng';
import { 
  createMockRival, 
  createMockProject, 
  createMockTalent, 
  createMockContract 
} from '../../utils/mockFactories';
import { RivalStudio } from '../../../engine/types';

describe('generateHeadlines', () => {
  let rng: RandomGenerator;

  beforeEach(() => {
    rng = new RandomGenerator(12345); // Fixed seed for determinism
  });

  it('should generate between 1 and 3 headlines', () => {
    const week = 1;
    const rivals: RivalStudio[] = [];
    const headlines = generateHeadlines(rng, week, rivals, [], [], []);

    expect(headlines.length).toBeGreaterThanOrEqual(1);
    expect(headlines.length).toBeLessThanOrEqual(3);
  });

  it('should return headlines with the correct structure', () => {
    const week = 5;
    const rivals: RivalStudio[] = [];
    const headlines = generateHeadlines(rng, week, rivals, [], [], []);

    headlines.forEach(headline => {
      expect(headline).toHaveProperty('id');
      expect(typeof headline.id).toBe('string');
      expect(headline.id!.toLowerCase().startsWith('nws-')).toBe(true);

      expect(headline).toHaveProperty('text');
      expect(typeof headline.text).toBe('string');

      expect(headline).toHaveProperty('week');
      expect(headline.week).toBe(week);

      expect(headline).toHaveProperty('category');
      expect(['rival', 'market', 'talent', 'scandal', 'box_office', 'streaming', 'dispute']).toContain(headline.category);
    });
  });

  it('should generate rival headlines if rivals are provided', () => {
    const week = 10;
    const rivals = [
      createMockRival({ id: 'rival-1', name: 'Global Pictures' }),
      createMockRival({ id: 'rival-2', name: 'Indie Art' })
    ];

    // Run multiple times to ensure we hit the 35% chance for a rival headline
    let foundRivalHeadline = false;
    for (let i = 0; i < 20; i++) {
      const headlines = generateHeadlines(rng, week, rivals, [], [], []);
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
      const headlines = generateHeadlines(rng, week, rivals, [], [], []);
      const hasRivalHeadline = headlines.some(h => h.category === 'rival');
      expect(hasRivalHeadline).toBe(false);
    }
  });

  it('should interpolate talent headlines with project and director names', () => {
    const rivals: RivalStudio[] = [];
    const projects = [
      createMockProject({ id: 'p1', title: 'Test Movie', genre: 'action' as any })
    ];
    const talent = [
      createMockTalent({ id: 't1', name: 'James Cameron', roles: ['director'], draw: 100 }),
      createMockTalent({ id: 't2', name: 'Tom Cruise', roles: ['actor'], draw: 100 })
    ];
    const contracts = [
      createMockContract({ 
        id: 'c1', 
        projectId: 'p1', 
        talentId: 't1', 
        role: 'director' as any 
      })
    ];

    let foundInterpolatedHeadline = false;
    for (let i = 0; i < 50; i++) {
      const headlines = generateHeadlines(rng, 1, rivals, projects as any, contracts as any, talent as any);
      const talentHeadline = headlines.find(h => h.category === 'talent');
      if (talentHeadline) {
        if (talentHeadline.text.includes('James Cameron') || talentHeadline.text.includes('Tom Cruise')) {
          foundInterpolatedHeadline = true;
          break;
        }
      }
    }
    expect(foundInterpolatedHeadline).toBe(true);
  });
});
