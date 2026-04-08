import { describe, it, expect, beforeEach } from 'vitest';
import { generateHeadlines } from '../../../engine/generators/headlines';
import { RandomGenerator } from '../../../engine/utils/rng';
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
      expect(headline.id.startsWith('NWS-')).toBe(true);

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
    const rivals: RivalStudio[] = [
      { id: 'rival-1', name: 'Global Pictures', cash: 100000000, projectCount: 5, motto: 'Bigger is Better', archetype: 'major', strength: 80, prestige: 80, recentActivity: 'Signing stars', motivationProfile: { financial: 0.8, prestige: 0.8, legacy: 0.5, aggression: 0.5 }, currentMotivation: 'prestige' as any, projects: {}, contracts: [], foundedWeek: 1 },
      { id: 'rival-2', name: 'Indie Art', cash: 1000000, projectCount: 2, motto: 'Art First', archetype: 'major', strength: 20, prestige: 60, recentActivity: 'Festivals', motivationProfile: { financial: 0.2, prestige: 0.9, legacy: 0.8, aggression: 0.3 }, currentMotivation: 'legacy' as any, projects: {}, contracts: [], foundedWeek: 1 }
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
    const projects = [{ 
      id: 'p1', 
      title: 'Test Movie', 
      format: 'film',
      genre: 'action' as any, 
      budgetTier: 'mid',
      budget: 1000000, 
      weeklyCost: 10000,
      targetAudience: 'General Audience',
      flavor: 'Test package',
      state: 'production' as const,
      weeksInPhase: 0,
      developmentWeeks: 4,
      productionWeeks: 8,
      revenue: 0,
      weeklyRevenue: 0,
      releaseWeek: null,
      buzz: 50, 
      momentum: 50,
      progress: 0,
      accumulatedCost: 0,
      activeCrisis: null,
      type: 'FILM',
      scriptHeat: 50,
      activeRoles: [],
      scriptEvents: []
    } as unknown as import('../../../engine/types').Project];
    const talent = [
      { 
        id: 't1', 
        name: 'James Cameron', 
        roles: ['director'], 
        prestige: 100, 
         salary: 100000, 
        buzz: 100, 
        marketability: 100, 
        skill: 100,
        draw: 100,
        fee: 100000,
        energy: 100,
      },
      { 
        id: 't2', 
        name: 'Tom Cruise', 
        roles: ['actor'], 
        prestige: 100, 
        salary: 100000, 
        buzz: 100, 
        marketability: 100, 
        skill: 100,
        draw: 100,
        fee: 100000,
        energy: 100,
      }
    ] as any;
    const contracts = [{ 
      id: 'c1', 
      projectId: 'p1', 
      talentId: 't1', 
      role: 'director' as any, 
      salary: 100000, 
      length: 1, 
      weekStarted: 1 
    }];

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
