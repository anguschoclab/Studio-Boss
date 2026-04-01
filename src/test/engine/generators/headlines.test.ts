import { describe, it, expect } from 'vitest';
import { generateHeadlines } from '../../../engine/generators/headlines';
import { RivalStudio } from '../../../engine/types';

describe('generateHeadlines', () => {
  it('should generate between 1 and 3 headlines', () => {
    const week = 1;
    const rivals: RivalStudio[] = [];
    const headlines = generateHeadlines(week, rivals, [], [], []);

    expect(headlines.length).toBeGreaterThanOrEqual(1);
    expect(headlines.length).toBeLessThanOrEqual(3);
  });

  it('should return headlines with the correct structure', () => {
    const week = 5;
    const rivals: RivalStudio[] = [];
    const headlines = generateHeadlines(week, rivals, [], [], []);

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
      { id: '1', name: 'Rival A', cash: 1000, projectCount: 0, motto: '', archetype: 'major', strength: 50, prestige: 50, recentActivity: '', motivationProfile: { financial: 80, prestige: 40, legacy: 70, aggression: 50 }, currentMotivation: 'CASH_CRUNCH' as any, projects: {}, contracts: [] },
      { id: '2', name: 'Rival B', cash: 2000, projectCount: 0, motto: '', archetype: 'major', strength: 50, prestige: 50, recentActivity: '', motivationProfile: { financial: 80, prestige: 40, legacy: 70, aggression: 50 }, currentMotivation: 'CASH_CRUNCH' as any, projects: {}, contracts: [] }
    ];

    // Run multiple times to ensure we hit the 35% chance for a rival headline
    let foundRivalHeadline = false;
    for (let i = 0; i < 20; i++) {
      const headlines = generateHeadlines(week, rivals, [], [], []);
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
      const headlines = generateHeadlines(week, rivals, [], [], []);
      const hasRivalHeadline = headlines.some(h => h.category === 'rival');
      expect(hasRivalHeadline).toBe(false);
    }
  });

  it('should interpolate talent headlines with project and director names', () => {
    const rivals: RivalStudio[] = [];
    const projects = [{ 
      id: 'p1', 
      title: 'Test Movie', 
      genre: 'action' as any, 
      status: 'production' as any, 
      budget: 1000000, 
      buzz: 50, 
      quality: 50, 
      releaseWeek: 0, 
      revenue: 0, 
      costToDate: 0 
    }];
    const talent = [{ 
      id: 't1', 
      name: 'James Cameron', 
      roles: ['director'], 
      prestige: 100, 
      salary: 100000, 
      buzz: 100, 
      marketability: 100, 
      skill: 100 
    }];
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
      const headlines = generateHeadlines(1, rivals, projects as any, contracts as any, talent as any);
      const talentHeadline = headlines.find(h => h.category === 'talent');
      if (talentHeadline) {
        if (talentHeadline.text.includes('Test Movie') || talentHeadline.text.includes('James Cameron')) {
          foundInterpolatedHeadline = true;
          break;
        }
      }
    }
    expect(foundInterpolatedHeadline).toBe(true);
  });
});
