import { ScriptedProject, ScriptEvent, ScriptMetrics } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Calculates script quality metrics from scriptEvents and scriptHeat.
 * Uses real-world screenwriting principles for scoring.
 */
export class ScriptMetricsCalculator {
  /**
   * Calculate all script metrics for a project.
   * Called during development phase evolution and on project creation.
   */
  static calculateMetrics(
    project: ScriptedProject,
    currentWeek: number,
    previousMetrics?: ScriptMetrics
  ): ScriptMetrics {
    const events = project.scriptEvents || [];
    const heat = project.scriptHeat || 50;
    
    // Structure: Based on archetype balance and role management
    const structure = this.calculateStructureScore(project, events);
    
    // Dialogue: Based on dialogue polish events
    const dialogue = this.calculateDialogueScore(events);
    
    // Originality: Based on plot twist events and unique archetypes
    const originality = this.calculateOriginalityScore(project, events);
    
    // Pacing: Based on scriptHeat (higher = more kinetic) and event density
    const pacing = this.calculatePacingScore(project, events, heat);
    
    // Emotional Impact: Directly tied to scriptHeat
    const emotionalImpact = this.calculateEmotionalImpactScore(heat);
    
    // Commercial Viability: Balance of quality and mass appeal
    const commercialViability = this.calculateCommercialViabilityScore(
      project, structure, originality, emotionalImpact
    );
    
    // Overall Score: Weighted average (structure and dialogue most important)
    const overallScore = Math.round(
      (structure * 0.25) +
      (dialogue * 0.25) +
      (originality * 0.15) +
      (pacing * 0.15) +
      (emotionalImpact * 0.1) +
      (commercialViability * 0.1)
    );
    
    // Trend: Compare with previous metrics
    const trend = this.calculateTrend(overallScore, previousMetrics?.overallScore);
    
    return {
      structure,
      dialogue,
      originality,
      pacing,
      emotionalImpact,
      commercialViability,
      overallScore,
      trend,
      lastCalculatedWeek: currentWeek
    };
  }
  
  /**
   * Structure score: Balanced archetypes = good structure.
   * Too many or too few roles indicates structural issues.
   */
  private static calculateStructureScore(
    project: ScriptedProject,
    events: ScriptEvent[]
  ): number {
    const roleCount = project.activeRoles.length;
    // Ideal: 4-6 roles for feature film structure
    let score = 50;
    
    if (roleCount >= 4 && roleCount <= 6) score += 30;
    else if (roleCount === 3 || roleCount === 7) score += 15;
    else score -= 10;
    
    // Role merge events hurt structure
    const merges = events.filter(e => e.type === 'ROLE_MERGE').length;
    score -= merges * 5;
    
    // Role split events help structure (expansion)
    const splits = events.filter(e => e.type === 'ROLE_SPLIT').length;
    score += splits * 5;
    
    return Math.min(100, Math.max(0, score));
  }
  
  /**
   * Dialogue score: Based on DIALOGUE_POLISH events.
   */
  private static calculateDialogueScore(events: ScriptEvent[]): number {
    const polishEvents = events.filter(e => e.type === 'DIALOGUE_POLISH');
    const base = 50;
    const bonus = polishEvents.reduce((sum, e) => sum + e.qualityImpact, 0);
    return Math.min(100, Math.max(0, base + bonus));
  }
  
  /**
   * Originality score: Based on plot twists and unique archetype combinations.
   */
  private static calculateOriginalityScore(
    project: ScriptedProject,
    events: ScriptEvent[]
  ): number {
    const twists = events.filter(e => e.type === 'PLOT_TWIST_ADDED').length;
    const base = 40;
    const bonus = twists * 12; // Each twist adds significant originality
    
    // Genre bonus: some genres are inherently more original
    const genre = project.genre?.toLowerCase();
    if (genre && ['sci-fi', 'fantasy', 'horror'].includes(genre)) {
      return Math.min(100, base + bonus + 10);
    }
    
    return Math.min(100, Math.max(0, base + bonus));
  }
  
  /**
   * Pacing score: Higher scriptHeat = more kinetic pacing.
   * Event density also contributes.
   */
  private static calculatePacingScore(
    project: ScriptedProject,
    events: ScriptEvent[],
    heat: number
  ): number {
    const eventDensity = events.length / Math.max(project.weeksInPhase || 1, 1);
    const base = heat * 0.6; // Heat contributes 60% to pacing
    const densityBonus = eventDensity * 20;
    return Math.min(100, Math.max(0, base + densityBonus));
  }
  
  /**
   * Emotional impact: Direct mapping from scriptHeat.
   * ScriptHeat represents audience emotional investment.
   */
  private static calculateEmotionalImpactScore(heat: number): number {
    return heat;
  }
  
  /**
   * Commercial viability: Balance of artistic merit and mass appeal.
   * Family-friendly and broad appeal genres score higher.
   */
  private static calculateCommercialViabilityScore(
    project: ScriptedProject,
    structure: number,
    originality: number,
    emotionalImpact: number
  ): number {
    const genre = project.genre?.toLowerCase();
    let base = 50;
    
    // Broad appeal genres
    if (genre && ['family', 'animation', 'action', 'comedy'].includes(genre)) {
      base += 20;
    }
    
    // Prestige genres have lower commercial viability
    if (genre && ['drama', 'thriller', 'crime'].includes(genre)) {
      base -= 10;
    }
    
    // Too original can hurt commercial appeal
    if (originality > 80) base -= 15;
    // Too little originality also hurts
    if (originality < 40) base -= 10;
    
    // Good structure helps commercial viability
    if (structure > 70) base += 10;
    
    // Emotional impact drives word-of-mouth
    base += (emotionalImpact - 50) * 0.2;
    
    return Math.min(100, Math.max(0, base));
  }
  
  /**
   * Determine trend based on score change.
   */
  private static calculateTrend(
    currentScore: number,
    previousScore?: number
  ): 'improving' | 'stable' | 'declining' {
    if (previousScore === undefined) return 'stable';
    
    const change = currentScore - previousScore;
    if (change > 3) return 'improving';
    if (change < -3) return 'declining';
    return 'stable';
  }
}
