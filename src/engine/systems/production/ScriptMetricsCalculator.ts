import { ScriptedProject, ScriptEvent, ScriptMetrics } from "@/engine/types/project.types";

/**
 * Calculates script quality metrics from scriptEvents and scriptHeat.
 * Uses real-world screenwriting principles for scoring.
 */
export const ScriptMetricsCalculator = {
  /**
   * Calculate all script metrics for a project.
   * Called during development phase evolution and on project creation.
   */
  calculateMetrics(
    project: ScriptedProject,
    currentWeek: number,
    previousMetrics?: ScriptMetrics
  ): ScriptMetrics {
    const events = project.scriptEvents || [];
    const heat = project.scriptHeat || 50;

    const structure = this.calculateStructureScore(project, events);
    const dialogue = this.calculateDialogueScore(events);
    const originality = this.calculateOriginalityScore(project, events);
    const pacing = this.calculatePacingScore(project, events, heat);
    const emotionalImpact = this.calculateEmotionalImpactScore(heat);
    const commercialViability = this.calculateCommercialViabilityScore(
      project,
      structure,
      originality,
      emotionalImpact
    );

    const score =
      (structure + dialogue + originality + pacing + emotionalImpact + commercialViability) / 6;

    const trend = this.calculateTrend(score, previousMetrics?.score);

    return {
      score: Math.round(score),
      structure: Math.round(structure),
      dialogue: Math.round(dialogue),
      originality: Math.round(originality),
      pacing: Math.round(pacing),
      emotionalImpact: Math.round(emotionalImpact),
      commercialViability: Math.round(commercialViability),
      trend,
      lastCalculatedWeek: currentWeek,
    };
  },

  /**
   * Structure score: Balanced archetypes = good structure.
   * Too many or too few roles indicates structural issues.
   */
  calculateStructureScore(project: ScriptedProject, events: ScriptEvent[]): number {
    const roleCount = project.activeRoles?.length || 0;
    let score = 50; // Base score (aligned with tests)

    if (roleCount >= 4 && roleCount <= 6) score += 30; // Perfect cast size
    if (roleCount > 10) score -= 20; // Over-crowded
    if (roleCount === 0) score -= 10; // No roles

    // Plot point events improve structure
    const plotPointBonus = events.filter((e) => e.type === "PLOT_POINT").length * 10;
    const mergePenalty = events.filter((e) => e.type === "ROLE_MERGE").length * 5;
    const splitBonus = events.filter((e) => e.type === "ROLE_SPLIT").length * 5;

    score += plotPointBonus + splitBonus - mergePenalty;

    return Math.max(0, Math.min(100, score));
  },

  /**
   * Dialogue score: Based on DIALOGUE_POLISH events.
   */
  calculateDialogueScore(events: ScriptEvent[]): number {
    const polishEvents = events.filter((e) => e.type === "DIALOGUE_POLISH");
    const base = 50;
    const bonus = polishEvents.reduce((sum, e) => sum + e.qualityImpact, 0);
    return Math.max(0, Math.min(100, base + bonus));
  },

  /**
   * Originality score: Based on plot twists and unique archetype combinations.
   */
  calculateOriginalityScore(project: ScriptedProject, events: ScriptEvent[]): number {
    let score = 40; // Base score (aligned with tests)

    // Plot twists increase originality
    const twists = events.filter((e) => e.type === "PLOT_TWIST_ADDED").length;
    score += twists * 12;

    // Genre specific bonus
    const genre = project.genre?.toLowerCase() || "";
    if (genre === "sci-fi" || genre === "fantasy") score += 10;

    return Math.max(0, Math.min(100, score));
  },

  /**
   * Pacing score: Higher scriptHeat = more kinetic pacing.
   * Event density also contributes.
   */
  calculatePacingScore(project: ScriptedProject, events: ScriptEvent[], heat: number): number {
    const eventDensity = events.length / Math.max(1, project.budgetTier === "blockbuster" ? 10 : 5);
    const score = heat * 0.7 + eventDensity * 30;
    return Math.max(0, Math.min(100, score));
  },

  /**
   * Emotional impact: Direct mapping from scriptHeat.
   * ScriptHeat represents audience emotional investment.
   */
  calculateEmotionalImpactScore(heat: number): number {
    return heat;
  },

  /**
   * Commercial viability: Balance of artistic merit and mass appeal.
   * Family-friendly and broad appeal genres score higher.
   */
  calculateCommercialViabilityScore(
    project: ScriptedProject,
    structure: number,
    originality: number,
    _emotionalImpact: number
  ): number {
    let score = 50; // Base score (aligned with tests)

    // Structure bonus: +10 if structure is very good
    if (structure >= 80) score += 10;
    if (structure < 40) score -= 10;

    // Originality impact
    if (originality > 80) score -= 10;
    if (originality < 30) score -= 10;

    // Genre bonuses
    const genre = project.genre?.toLowerCase() || "";
    if (genre === "action" || genre === "adventure" || genre === "animation") score += 10;
    if (genre === "documentary") score -= 15;
    if (genre === "drama") score -= 10; // Aligned with test comment "- 10 prestige/drama penalty"

    return Math.max(0, Math.min(100, score));
  },

  /**
   * Determine trend based on score change.
   */
  calculateTrend(
    currentScore: number,
    previousScore?: number
  ): "improving" | "stable" | "declining" {
    if (previousScore === undefined || previousScore === 0) return "stable";
    const change = currentScore - previousScore;
    if (change >= 5) return "improving";
    if (change <= -5) return "declining";
    return "stable";
  },
};
