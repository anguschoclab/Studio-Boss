import { describe, it, expect } from 'vitest';
import { evaluateGreenlight } from '@/engine/systems/greenlight';
import { Project, TalentProfile } from '@/engine/types';

const mockProject: Project = {
  id: 'p1',
  title: 'Test Project',
  format: 'film',
  genre: 'Drama',
  budgetTier: 'mid',
  budget: 25_000_000,
  weeklyCost: 2_000_000,
  targetAudience: 'Broad',
  flavor: 'Standard drama',
  status: 'development',
  buzz: 50,
  weeksInPhase: 0,
  developmentWeeks: 8,
  productionWeeks: 12,
  revenue: 0,
  weeklyRevenue: 0,
  releaseWeek: null,
};

const mockTalent: TalentProfile = {
  id: 't1',
  name: 'Actor 1',
  roles: ['actor'],
  prestige: 60,
  fee: 1_000_000,
  draw: 60,
  temperament: 'Pro',
  accessLevel: 'outsider',
};

const mockTalentAlist: TalentProfile = {
  id: 't2',
  name: 'A-Lister',
  roles: ['actor'],
  prestige: 90,
  fee: 10_000_000,
  draw: 90,
  temperament: 'Pro',
  accessLevel: 'outsider',
};

const mockTalentEgo: TalentProfile = {
  id: 't3',
  name: 'Ego Maniac',
  roles: ['actor'],
  prestige: 100,
  fee: 5_000_000,
  draw: 0,
  temperament: 'Diva',
  accessLevel: 'outsider',
  ego: 100,
};

describe('evaluateGreenlight', () => {
  describe('Base Scoring Mechanics', () => {
    it('calculates a baseline score without major modifiers', () => {
      // 25M budget, 100M cash (cash > budget * 2, not > * 5 => 0 bonus/penalty)
      // 1 solid talent (draw 60) => +15
      // buzz 50 => 0 bonus/penalty
      // Base 50 + 15 = 65
      // No similar projects => +15 gap bonus
      // Total: 80
      const report = evaluateGreenlight(mockProject, 100_000_000, [mockTalent], 10, []);
      expect(report.score).toBe(80);
      expect(report.recommendation).toBe('Easy Greenlight');
    });

    it('applies market saturation penalty for recent similar projects', () => {
      const recentProject: Project = { ...mockProject, id: 'p2', status: 'released', releaseWeek: 5 };
      const allProjects = [recentProject];

      const report = evaluateGreenlight(mockProject, 100_000_000, [mockTalent], 10, allProjects);
      // recent = 1 => penalty 5
      // No gap bonus
      // Base 50 + 15 (talent) - 5 = 60
      expect(report.score).toBe(60);
      expect(report.negatives.some(n => n.includes('Market saturation'))).toBe(true);
    });

    it('applies heavy penalty for oversaturated genres (>= 5 similar)', () => {
      const similarProjects = Array.from({ length: 5 }).map((_, i) => ({
        ...mockProject,
        id: `p${i+2}`,
        status: 'released' as const,
        releaseWeek: 5,
      }));

      const report = evaluateGreenlight(mockProject, 100_000_000, [mockTalent], 10, similarProjects);
      // 5 projects => penalty 25 + 20 (oversaturated) = 45
      // Base 50 + 15 (talent) - 45 = 20
      expect(report.score).toBe(20);
      expect(report.recommendation).toBe('Do Not Greenlight Yet');
    });

    it('doubles penalty for oversaturated Superhero genre', () => {
      const superheroProject = { ...mockProject, genre: 'Superhero' };
      const similarProjects = Array.from({ length: 5 }).map((_, i) => ({
        ...superheroProject,
        id: `p${i+2}`,
        status: 'released' as const,
        releaseWeek: 5,
      }));

      const report = evaluateGreenlight(superheroProject, 100_000_000, [mockTalent], 10, similarProjects);
      // 5 projects => penalty 25 + 20 = 45. Superhero => 45 * 2 = 90
      // Base 50 + 15 (talent) - 90 = -25 => clamped to 0
      expect(report.score).toBe(0);
      expect(report.negatives.some(n => n.includes('-90 points'))).toBe(true);
    });

    it('applies calendar gap bonus if no similar projects in 52 weeks', () => {
      const oldProject: Project = { ...mockProject, id: 'p2', status: 'released', releaseWeek: 1 };
      const allProjects = [oldProject];
      // Current week 100 => old project is 99 weeks old (> 52)
      const report = evaluateGreenlight(mockProject, 100_000_000, [mockTalent], 100, allProjects);
      expect(report.positives.some(p => p.includes('Market gap'))).toBe(true);
    });

    it('penalizes severe cashflow strain (cash < budget)', () => {
      const report = evaluateGreenlight(mockProject, 10_000_000, [mockTalent], 10, []);
      // Base 50 + 15 (gap) + 15 (talent) - 40 (cash) = 40
      expect(report.score).toBe(40);
      expect(report.negatives.some(n => n.includes('Severe cashflow strain'))).toBe(true);
    });

    it('penalizes high financial exposure (cash < budget * 2)', () => {
      const report = evaluateGreenlight(mockProject, 40_000_000, [mockTalent], 10, []);
      // Base 50 + 15 (gap) + 15 (talent) - 15 (exposure) = 65
      expect(report.score).toBe(65);
      expect(report.negatives.some(n => n.includes('High financial exposure'))).toBe(true);
    });

    it('rewards comfortable cash reserves (cash > budget * 5)', () => {
      const report = evaluateGreenlight(mockProject, 150_000_000, [mockTalent], 10, []);
      // Base 50 + 15 (gap) + 15 (talent) + 10 (cash) = 90
      expect(report.score).toBe(90);
      expect(report.positives.some(p => p.includes('Comfortable cash reserves'))).toBe(true);
    });

    it('penalizes unpackaged projects (no talent)', () => {
      const report = evaluateGreenlight(mockProject, 100_000_000, [], 10, []);
      // Base 50 + 15 (gap) - 20 (no talent) = 45
      expect(report.score).toBe(45);
      expect(report.negatives.some(n => n.includes('Unpackaged'))).toBe(true);
    });

    it('rewards A-list packages (avg draw > 75)', () => {
      const report = evaluateGreenlight(mockProject, 100_000_000, [mockTalentAlist], 10, []);
      // Base 50 + 15 (gap) + 30 (A-list) = 95
      expect(report.score).toBe(95);
      expect(report.positives.some(p => p.includes('A-list package'))).toBe(true);
    });

    it('rewards high prestige elements (total prestige > 150)', () => {
      const report = evaluateGreenlight(mockProject, 100_000_000, [mockTalentAlist, mockTalentAlist], 10, []);
      // Avg draw 90 => +30. Total prestige 180 => +10. Gap => +15. Base 50 => 105 -> clamped to 100
      expect(report.score).toBe(100);
      expect(report.positives.some(p => p.includes('Strong prestige elements'))).toBe(true);
    });

    it('penalizes poor talent packages (avg draw <= 50)', () => {
      const poorTalent: TalentProfile = { ...mockTalent, draw: 30 };
      const report = evaluateGreenlight(mockProject, 100_000_000, [poorTalent], 10, []);
      // Base 50 + 15 (gap) - 5 (poor talent) = 60
      expect(report.score).toBe(60);
      expect(report.negatives.some(n => n.includes('lacks strong box office/ratings draw'))).toBe(true);
    });

    it('rewards exceptional buzz (> 80)', () => {
      const buzzyProject = { ...mockProject, buzz: 90 };
      const report = evaluateGreenlight(buzzyProject, 100_000_000, [mockTalent], 10, []);
      // Base 50 + 15 (gap) + 15 (talent) + 20 (buzz) = 100
      expect(report.score).toBe(100);
      expect(report.positives.some(p => p.includes('Exceptional pre-production buzz'))).toBe(true);
    });

    it('penalizes very low buzz (< 30)', () => {
      const deadProject = { ...mockProject, buzz: 10 };
      const report = evaluateGreenlight(deadProject, 100_000_000, [mockTalent], 10, []);
      // Base 50 + 15 (gap) + 15 (talent) - 15 (low buzz) = 65
      expect(report.score).toBe(65);
      expect(report.negatives.some(n => n.includes('Very low market awareness/buzz'))).toBe(true);
    });
  });

  describe('Recommendations Matrix and Edge Cases', () => {
    it('returns Easy Greenlight for score >= 80', () => {
      const report = evaluateGreenlight(mockProject, 150_000_000, [mockTalentAlist], 10, []);
      expect(report.score).toBeGreaterThanOrEqual(80);
      expect(report.recommendation).toBe('Easy Greenlight');
    });

    it('returns Viable with Conditions for 60 <= score < 80', () => {
      // Base 50 + 15 (gap) + 15 (talent) - 15 (exposure, 40M < 50M) = 65
      const report = evaluateGreenlight(mockProject, 40_000_000, [mockTalent], 10, []);
      expect(report.score).toBeGreaterThanOrEqual(60);
      expect(report.score).toBeLessThan(80);
      expect(report.recommendation).toBe('Viable with Conditions');
    });

    it('returns Speculative Bet for 40 <= score < 60 on mid budget', () => {
      // Base 50 + 15 (gap) - 20 (no talent) - 15 (exposure, 40M < 50M) = 30
      // wait, need to hit 40-59.
      // Base 50 + 15 (gap) - 20 (no talent) = 45 (100M cash so no cash penalty)
      const report = evaluateGreenlight(mockProject, 100_000_000, [], 10, []);
      expect(report.score).toBeGreaterThanOrEqual(40);
      expect(report.score).toBeLessThan(60);
      expect(report.recommendation).toBe('Speculative Bet');
    });

    it('returns Dangerous Vanity Play for 40 <= score < 60 on blockbuster/high budget', () => {
      const blockbusterProject: Project = { ...mockProject, budgetTier: 'blockbuster', budget: 300_000_000 };
      // Base 50 + 15 (gap) - 20 (no talent) = 45 (using 2B cash so no cash penalty)
      const report = evaluateGreenlight(blockbusterProject, 2_000_000_000, [], 10, []);
      expect(report.score).toBeGreaterThanOrEqual(40);
      expect(report.score).toBeLessThan(60);
      expect(report.recommendation).toBe('Dangerous Vanity Play');
    });

    it('returns Do Not Greenlight Yet for score < 40 on mid budget', () => {
      // Base 50 + 15 (gap) - 20 (no talent) - 40 (severe cash: 10M < 25M) = 5
      const report = evaluateGreenlight(mockProject, 10_000_000, [], 10, []);
      expect(report.score).toBeLessThan(40);
      expect(report.recommendation).toBe('Do Not Greenlight Yet');
    });

    it('returns Dangerous Vanity Play for score < 40 on blockbuster/high budget', () => {
      const blockbusterProject: Project = { ...mockProject, budgetTier: 'blockbuster', budget: 300_000_000 };
      // Base 50 + 15 (gap) - 20 (no talent) - 40 (severe cash: 10M < 300M) = 5
      const report = evaluateGreenlight(blockbusterProject, 10_000_000, [], 10, []);
      expect(report.score).toBeLessThan(40);
      expect(report.recommendation).toBe('Dangerous Vanity Play');
    });
  });

  describe('Extreme Edge Cases (Guild Auditor)', () => {
    it('handles negative budget securely without throwing', () => {
      const negativeBudgetProject: Project = { ...mockProject, budget: -10_000_000 };
      // Cash 10M > -50M (budget * 5). Evaluates to comfortable reserves +10.
      const report = evaluateGreenlight(negativeBudgetProject, 10_000_000, [mockTalent], 10, []);
      expect(report.score).toBeGreaterThan(0);
      expect(report.positives.some(p => p.includes('Comfortable cash reserves'))).toBe(true);
    });

    it('handles talent with 0 draw but 100 ego/prestige safely', () => {
      // Ego talent: avg draw = 0 => poor package (-5). Total prestige = 100 => no bonus.
      // Base 50 + 15 (gap) - 5 (draw) = 60
      const report = evaluateGreenlight(mockProject, 100_000_000, [mockTalentEgo], 10, []);
      expect(report.score).toBe(60);
      expect(report.negatives.some(n => n.includes('lacks strong box office/ratings draw'))).toBe(true);
    });

    it('handles an empty pipeline safely (allProjects = [])', () => {
      expect(() => evaluateGreenlight(mockProject, 100_000_000, [mockTalent], 10, [])).not.toThrow();
    });

    it('bounds extreme negative scores to 0', () => {
      const similarProjects = Array.from({ length: 15 }).map((_, i) => ({
        ...mockProject,
        id: `p${i+2}`,
        genre: 'Superhero',
        status: 'released' as const,
        releaseWeek: 5,
      }));
      // 15 superhero projects => penalty (15 * 5 + 20) * 2 = 190.
      // Score = 50 - 190 - 40 (no cash) - 20 (no talent) - 15 (low buzz) = -215 => clamped 0
      const awfulProject = { ...mockProject, genre: 'Superhero', buzz: 10 };
      const report = evaluateGreenlight(awfulProject, 0, [], 10, similarProjects);
      expect(report.score).toBe(0);
    });

    it('bounds extreme positive scores to 100', () => {
      // Score = 50 + 15 (gap) + 10 (cash > 5x) + 30 (A-list draw) + 10 (prestige > 150) + 20 (buzz > 80) = 135 => clamped 100
      const goldenProject = { ...mockProject, buzz: 95 };
      const report = evaluateGreenlight(goldenProject, 500_000_000, [mockTalentAlist, mockTalentAlist], 10, []);
      expect(report.score).toBe(100);
    });
  });
});
