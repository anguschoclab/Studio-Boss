import { describe, it, expect } from 'vitest';
import { ScriptMetricsCalculator } from '@/engine/systems/production/ScriptMetricsCalculator';
import { ScriptedProject } from '@/engine/types';

describe('ScriptMetricsCalculator', () => {
  it('calculates structure score based on role count', () => {
    const project: Partial<ScriptedProject> = {
      activeRoles: ['protagonist', 'antagonist', 'mentor', 'love_interest', 'sidekick'] as any,
      scriptEvents: [],
      weeksInPhase: 10
    };
    
    const metrics = ScriptMetricsCalculator.calculateMetrics(
      project as ScriptedProject, 1, undefined
    );
    
    expect(metrics.structure).toBeGreaterThan(70); // 5 roles = good structure
  });
  
  it('penalizes too many or too few roles', () => {
    const project: Partial<ScriptedProject> = {
      activeRoles: ['protagonist'] as any, // Only 1 role
      scriptEvents: [],
      weeksInPhase: 10
    };
    
    const metrics = ScriptMetricsCalculator.calculateMetrics(
      project as ScriptedProject, 1, undefined
    );
    
    expect(metrics.structure).toBeLessThan(50);
  });
  
  it('calculates dialogue score based on polish events', () => {
    const project: Partial<ScriptedProject> = {
      activeRoles: ['protagonist', 'antagonist'] as any,
      scriptEvents: [
        { week: 1, type: 'DIALOGUE_POLISH', description: 'Polish', qualityImpact: 10, heatGain: 3 }
      ],
      weeksInPhase: 10
    };
    
    const metrics = ScriptMetricsCalculator.calculateMetrics(
      project as ScriptedProject, 1, undefined
    );
    
    expect(metrics.dialogue).toBe(60); // 50 base + 10 from polish event
  });
  
  it('calculates originality score based on plot twists', () => {
    const project: Partial<ScriptedProject> = {
      activeRoles: ['protagonist', 'antagonist'] as any,
      scriptEvents: [
        { week: 1, type: 'PLOT_TWIST_ADDED', description: 'Twist', qualityImpact: 12, heatGain: 8 }
      ],
      weeksInPhase: 10,
      genre: 'Sci-Fi'
    };
    
    const metrics = ScriptMetricsCalculator.calculateMetrics(
      project as ScriptedProject, 1, undefined
    );
    
    expect(metrics.originality).toBeGreaterThan(60); // 40 base + 12 from twist + 10 genre bonus
  });
  
  it('calculates emotional impact from scriptHeat', () => {
    const project: Partial<ScriptedProject> = {
      activeRoles: ['protagonist', 'antagonist'] as any,
      scriptEvents: [],
      scriptHeat: 75,
      weeksInPhase: 10
    };
    
    const metrics = ScriptMetricsCalculator.calculateMetrics(
      project as ScriptedProject, 1, undefined
    );
    
    expect(metrics.emotionalImpact).toBe(75); // Direct mapping from scriptHeat
  });
  
  it('calculates trend as improving when score increases', () => {
    const project: Partial<ScriptedProject> = {
      activeRoles: ['protagonist', 'antagonist', 'mentor', 'love_interest', 'sidekick'] as any,
      scriptEvents: [
        { week: 1, type: 'DIALOGUE_POLISH', description: 'Polish', qualityImpact: 10, heatGain: 3 }
      ],
      scriptHeat: 70,
      weeksInPhase: 10,
      genre: 'Action'
    };
    
    const previous = {
      overallScore: 50,
      structure: 50,
      dialogue: 50,
      originality: 40,
      pacing: 50,
      emotionalImpact: 50,
      commercialViability: 50,
      trend: 'stable' as const,
      lastCalculatedWeek: 0
    };
    
    const metrics = ScriptMetricsCalculator.calculateMetrics(
      project as ScriptedProject, 1, previous
    );
    
    expect(metrics.trend).toBe('improving');
  });
  
  it('calculates trend as declining when score decreases', () => {
    const project: Partial<ScriptedProject> = {
      activeRoles: ['protagonist'] as any, // Bad structure
      scriptEvents: [],
      scriptHeat: 40,
      weeksInPhase: 10
    };
    
    const previous = {
      overallScore: 60,
      structure: 60,
      dialogue: 60,
      originality: 50,
      pacing: 60,
      emotionalImpact: 60,
      commercialViability: 60,
      trend: 'stable' as const,
      lastCalculatedWeek: 0
    };
    
    const metrics = ScriptMetricsCalculator.calculateMetrics(
      project as ScriptedProject, 1, previous
    );
    
    expect(metrics.trend).toBe('declining');
  });
  
  it('calculates overall score as weighted average', () => {
    const project: Partial<ScriptedProject> = {
      activeRoles: ['protagonist', 'antagonist', 'mentor', 'love_interest'] as any,
      scriptEvents: [
        { week: 1, type: 'DIALOGUE_POLISH', description: 'Polish', qualityImpact: 10, heatGain: 3 }
      ],
      scriptHeat: 70,
      weeksInPhase: 10,
      genre: 'Action'
    };
    
    const metrics = ScriptMetricsCalculator.calculateMetrics(
      project as ScriptedProject, 1, undefined
    );
    
    expect(metrics.overallScore).toBeGreaterThan(0);
    expect(metrics.overallScore).toBeLessThanOrEqual(100);
  });
  
  it('handles projects with no script events', () => {
    const project: Partial<ScriptedProject> = {
      activeRoles: ['protagonist', 'antagonist', 'mentor', 'love_interest'] as any,
      scriptEvents: [],
      scriptHeat: 50,
      weeksInPhase: 10,
      genre: 'Drama'
    };
    
    const metrics = ScriptMetricsCalculator.calculateMetrics(
      project as ScriptedProject, 1, undefined
    );
    
    expect(metrics).toBeDefined();
    expect(metrics.dialogue).toBe(50); // Base score with no events
  });
});
