import { describe, it, expect } from 'vitest';
import { ScriptMetricsCalculator } from '@/engine/systems/production/ScriptMetricsCalculator';
import { createMockProject } from '@/test/utils/mockFactories';
import { ScriptedProject, ScriptEvent, ScriptMetrics } from '@/engine/types';

describe('ScriptMetricsCalculator', () => {
  describe('calculateMetrics', () => {
    it('calculates metrics correctly for a basic project', () => {
      const project = createMockProject({
        scriptHeat: 50,
        genre: 'Drama',
        activeRoles: ['role1', 'role2', 'role3', 'role4', 'role5'], // 5 roles
        scriptEvents: []
      }) as ScriptedProject;

      const metrics = ScriptMetricsCalculator.calculateMetrics(project, 10);

      expect(metrics.structure).toBe(80); // base 50 + 30 for 4-6 roles
      expect(metrics.dialogue).toBe(50); // base 50 + 0 bonus
      expect(metrics.originality).toBe(40); // base 40 + 0 bonus
      expect(metrics.emotionalImpact).toBe(50); // heat 50
      expect(metrics.commercialViability).toBe(50); // base 50 - 10 prestige + 10 good structure
      expect(metrics.trend).toBe('stable');
      expect(metrics.lastCalculatedWeek).toBe(10);
    });

    it('calculates trend correctly', () => {
      const project = createMockProject({
        scriptHeat: 50,
        genre: 'Comedy',
        activeRoles: ['r1', 'r2', 'r3', 'r4', 'r5'],
      }) as ScriptedProject;

      const prevMetrics: ScriptMetrics = {
        structure: 50, dialogue: 50, originality: 50, pacing: 50, emotionalImpact: 50, commercialViability: 50,
        score: 20, trend: 'stable', lastCalculatedWeek: 5
      };

      const metrics = ScriptMetricsCalculator.calculateMetrics(project, 10, prevMetrics);
      expect(metrics.trend).toBe('improving');

      prevMetrics.score = 100;
      const metricsDeclining = ScriptMetricsCalculator.calculateMetrics(project, 10, prevMetrics);
      expect(metricsDeclining.trend).toBe('declining');

      prevMetrics.score = metrics.score; // approx equal
      const metricsStable = ScriptMetricsCalculator.calculateMetrics(project, 10, prevMetrics);
      expect(metricsStable.trend).toBe('stable');
    });

    it('handles negative events and 0 roles properly (edge case)', () => {
      const project = createMockProject({
        scriptHeat: -10, // extreme
        genre: 'Action',
        activeRoles: [], // 0 roles
        scriptEvents: [
          { type: 'ROLE_MERGE', qualityImpact: -10, heatGain: -5 } as ScriptEvent,
          { type: 'ROLE_MERGE', qualityImpact: -10, heatGain: -5 } as ScriptEvent,
        ]
      }) as ScriptedProject;

      const metrics = ScriptMetricsCalculator.calculateMetrics(project, 10);

      // Structure: 50 base - 10 (0 roles bonus) - 10 (2 merges) = 30
      expect(metrics.structure).toBe(30);
      expect(metrics.emotionalImpact).toBe(-10); // Directly tied to heat
    });

    it('handles many roles and complex script events properly (edge case)', () => {
      const project = createMockProject({
        scriptHeat: 150,
        genre: 'Sci-Fi',
        weeksInPhase: 2,
        activeRoles: Array.from({ length: 15 }, (_, i) => `role${i}`), // 15 roles
        scriptEvents: [
          { type: 'ROLE_SPLIT', qualityImpact: 5, heatGain: 2 } as ScriptEvent,
          { type: 'ROLE_SPLIT', qualityImpact: 5, heatGain: 2 } as ScriptEvent,
          { type: 'DIALOGUE_POLISH', qualityImpact: 60, heatGain: 10 } as ScriptEvent,
          { type: 'DIALOGUE_POLISH', qualityImpact: 40, heatGain: 10 } as ScriptEvent,
          { type: 'PLOT_TWIST_ADDED', qualityImpact: 20, heatGain: 20 } as ScriptEvent,
          { type: 'PLOT_TWIST_ADDED', qualityImpact: 20, heatGain: 20 } as ScriptEvent,
          { type: 'PLOT_TWIST_ADDED', qualityImpact: 20, heatGain: 20 } as ScriptEvent,
          { type: 'PLOT_TWIST_ADDED', qualityImpact: 20, heatGain: 20 } as ScriptEvent,
          { type: 'PLOT_TWIST_ADDED', qualityImpact: 20, heatGain: 20 } as ScriptEvent,
        ]
      }) as ScriptedProject;

      const metrics = ScriptMetricsCalculator.calculateMetrics(project, 10);

      // Structure: 50 base - 20 (15 roles penalty) + 10 (2 splits) = 40
      expect(metrics.structure).toBe(40);
      // Dialogue: 50 base + 100 polish = 150 -> maxed to 100
      expect(metrics.dialogue).toBe(100);
      // Originality: 40 base + 5*12 twist + 10 sci-fi = 110 -> maxed to 100
      expect(metrics.originality).toBe(100);

      // Pacing: base = 150*0.7 = 105. total 100.
      expect(metrics.pacing).toBe(100);
      expect(metrics.commercialViability).toBeLessThanOrEqual(100);
      expect(metrics.commercialViability).toBeGreaterThanOrEqual(0);
    });

    it('calculates commercial viability correctly for various genres', () => {
      const genres = ['Family', 'Animation', 'Action', 'Comedy', 'Drama', 'Thriller', 'Crime', 'Unknown'];
      const baseExpectedViabilities = [];

      for (const genre of genres) {
        const project = createMockProject({
          scriptHeat: 50,
          genre,
          activeRoles: ['role1', 'role2', 'role3', 'role4', 'role5'],
        }) as ScriptedProject;

        const metrics = ScriptMetricsCalculator.calculateMetrics(project, 10);
        baseExpectedViabilities.push(metrics.commercialViability);
      }

      // Action index 2 (50+10+10=70), Drama index 4 (50-10+10=50)
      expect(baseExpectedViabilities[2]).toBeGreaterThan(baseExpectedViabilities[4]);
    });
  });
});
