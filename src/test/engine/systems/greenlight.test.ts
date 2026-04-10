import { describe, it, expect, beforeEach } from 'vitest';
import { evaluateGreenlight } from '@/engine/systems/greenlight';
import { Project, Talent } from '@/engine/types';
import { createMockProject } from "../../utils/mockFactories";
import { RandomGenerator } from '@/engine/utils/rng';

let rng: RandomGenerator;

const mockProject: Project = {
  id: 'p1',
  title: 'Test Project',
  type: 'FILM',
  format: 'film',
  genre: 'Comedy',
  budgetTier: 'mid',
  budget: 25_000_000,
  weeklyCost: 2_000_000,
  targetAudience: 'Broad',
  flavor: 'Standard drama',
  state: 'development',
  buzz: 50,
  weeksInPhase: 0,
  developmentWeeks: 8,
  productionWeeks: 12,
  revenue: 0,
  weeklyRevenue: 0,
  releaseWeek: null,
} as Project;

const mockTalent: Talent = {
  id: 't1',
  name: 'Actor 1',
  roles: ['actor'],
  prestige: 60,
  fee: 1_000_000,
  draw: 60,
  personality: 'Pro',
  accessLevel: 'outsider',
} as any;

const mockTalentAlist: Talent = {
  id: 't2',
  name: 'A-Lister',
  roles: ['actor'],
  prestige: 90,
  fee: 10_000_000,
  draw: 90,
  personality: 'Pro',
  accessLevel: 'outsider',
} as any;

const mockTalentEgo: Talent = {
  id: 't3',
  name: 'Ego Maniac',
  roles: ['actor'],
  prestige: 100,
  fee: 5_000_000,
  draw: 0,
  personality: 'Diva',
  accessLevel: 'outsider',
} as any;

describe('evaluateGreenlight', () => {
  beforeEach(() => {
    rng = new RandomGenerator(1234);
  });

  describe('Base Scoring Mechanics', () => {
    it('calculates a baseline score without major modifiers', () => {
      // 25M budget, 100M cash (cash > budget * 2, not > * 5 => 0 bonus/penalty)
      // 1 solid talent (draw 60) => +15
      // buzz 50 => 0 bonus/penalty
      // Base 50 + 15 = 65
      // No similar projects within last 52 weeks => +15 gap bonus
      // Total: 80
      const report = evaluateGreenlight(mockProject, 100_000_000, [mockTalent], rng, 10, []);
      expect(report.score).toBe(80);
      expect(report.recommendation).toBe('Easy Greenlight');
    });

    it('applies market saturation penalty for recent similar projects', () => {
      const recentProject: Project = { ...mockProject, id: 'p2', state: 'released', releaseWeek: 5 };
      const allProjects = [recentProject];

      const report = evaluateGreenlight(mockProject, 100_000_000, [mockTalent], rng, 10, allProjects);
      // recent = 1 => penalty 5
      // No gap bonus
      // Base 50 + 15 (talent) - 5 = 60
      expect(report.score).toBe(60);
      expect(report.negatives.some(n => n.toLowerCase().includes('saturated') || n.toLowerCase().includes('saturation'))).toBe(true);
    });

    it('applies heavy penalty for oversaturated genres (>= 5 similar)', () => {
      const similarProjects = Array.from({ length: 5 }).map((_, i) => ({
        ...mockProject,
        id: `p${i+2}`,
        state: 'released' as const,
        releaseWeek: 5,
      }));

      const report = evaluateGreenlight(mockProject, 100_000_000, [mockTalent], rng, 10, similarProjects as Project[]);
      // 5 projects => penalty 25 + 20 (oversaturated) = 45
      // penalty 25 + 20 = 45. Base 50 + 15 (talent) - 45 = 20
      expect(report.score).toBe(20);
      expect(report.negatives.some(n => n.toLowerCase().includes('market'))).toBe(true);
    });

    it('doubles penalty for oversaturated Superhero genre', () => {
      const superheroProject = createMockProject({ genre: 'Superhero', budgetTier: 'blockbuster' });
      // 5 recent ähnliche released projects
      const similar = Array(5).fill(0).map((_, i) => createMockProject({ 
        id: `prev-${i}`, 
        genre: 'Superhero', 
        state: 'released', 
        releaseWeek: 10 
      }));

      const report = evaluateGreenlight(superheroProject, 100000000, [], rng, 30, similar);
      
      // Base 50 + 15 - 210 < 0 => 0
      expect(report.score).toBe(0);
      expect(report.negatives.some(n => n.toLowerCase().includes('saturated') || n.toLowerCase().includes('saturation'))).toBe(true);
    });

    it('penalizes severe cashflow strain (cash < budget)', () => {
      const report = evaluateGreenlight(mockProject, 10_000_000, [mockTalent], rng, 10, []);
      // Base 50 + 15 (gap) + 15 (talent) - 40 (cash) = 40
      expect(report.score).toBe(40);
    });

    it('rewards comfortable cash reserves (cash > budget * 5)', () => {
      const report = evaluateGreenlight(mockProject, 150_000_000, [mockTalent], rng, 10, []);
      // Base 50 + 15 (gap) + 15 (talent) + 10 (cash) = 90
      expect(report.score).toBe(90);
    });

    it('penalizes unpackaged projects (no talent)', () => {
      const report = evaluateGreenlight(mockProject, 100_000_000, [], rng, 10, []);
      // Base 50 + 15 (gap) - 20 (no talent) = 45
      expect(report.score).toBe(45);
    });

    it('rewards A-list packages (avg draw > 75)', () => {
      const report = evaluateGreenlight(mockProject, 100_000_000, [mockTalentAlist], rng, 10, []);
      // Base 50 + 15 (gap) + 30 (A-list) = 95
      expect(report.score).toBe(95);
    });
  });

  describe('Recommendations Matrix', () => {
    it('returns Easy Greenlight for score >= 80', () => {
      const report = evaluateGreenlight(mockProject, 150_000_000, [mockTalentAlist], rng, 10, []);
      expect(report.score).toBeGreaterThanOrEqual(80);
      expect(report.recommendation).toBe('Easy Greenlight');
    });

    it('returns Viable with Conditions for 60 <= score < 80', () => {
      // Base 50 + 15 (gap) + 15 (talent) - 15 (exposure, 40M < 50M) = 65
      const report = evaluateGreenlight(mockProject, 40_000_000, [mockTalent], rng, 10, []);
      expect(report.score).toBeGreaterThanOrEqual(60);
      expect(report.score).toBeLessThan(80);
      expect(report.recommendation).toBe('Viable with Conditions');
    });
  });
});
