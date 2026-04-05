import { pick } from '../../utils';
import { Project, ScriptEvent, CharacterArchetype, StateImpact } from '@/engine/types/index';
import { RandomGenerator } from '../../utils/rng';

/**
 * Studio Boss - Script Drafting System
 * Manages dynamic script evolution during the development phase.
 */

export function tickScriptDevelopment(
  project: Project,
  rng: RandomGenerator
): { project: Project; impact?: StateImpact } {
  // Only evolve during development phase
  if (project.state !== 'development') return { project };

  // Only evolve scripted projects
  if (!('scriptHeat' in project)) return { project };

  const p = { ...project } as import('@/engine/types').ScriptedProject;
  const roll = rng.next();
  
  // 1. Script Heat Drift
  const heatDrift = rng.rangeInt(-3, 5); // Slight upward bias
  p.scriptHeat = Math.max(0, Math.min(100, p.scriptHeat + heatDrift));

  // 2. Evolution Events (Low Probability)
  if (roll < 0.15) {
    const evolutionRoll = rng.next();

    // ROLE MERGE (Low Heat or Budget Constraint)
    if (evolutionRoll < 0.4 && p.activeRoles.length > 3) {
      if (p.scriptHeat < 40) {
        const r1 = p.activeRoles[p.activeRoles.length - 1];
        const r2 = p.activeRoles[p.activeRoles.length - 2];
        p.activeRoles = p.activeRoles.slice(0, -2);
        p.activeRoles.push(r1); // Merge r2 into r1

        const event: import('@/engine/types').ScriptEvent = {
          week: p.weeksInPhase,
          type: 'ROLE_MERGE',
          description: `The writer suggested merging "${r1}" and "${r2}" into a single composite character to tighten the plot.`,
          qualityImpact: -5,
          heatGain: -2
        };
        p.scriptEvents.push(event);
        p.buzz = Math.max(0, p.buzz - 5);
      }
    } 
    // ROLE SPLIT (High Heat)
    else if (evolutionRoll > 0.8 && p.activeRoles.length < 6) {
      if (p.scriptHeat > 70) {
        const archetype: CharacterArchetype = pick(['sidekick', 'love_interest', 'loose_cannon', 'femme_fatale'], rng);
        p.activeRoles.push(archetype);

        const event: import('@/engine/types').ScriptEvent = {
          week: p.weeksInPhase,
          type: 'ROLE_SPLIT',
          description: `Industry interest in the script has led to the expansion of a minor role into a full-fledged ${archetype}.`,
          qualityImpact: 10,
          heatGain: 5
        };
        p.scriptEvents.push(event);
        p.buzz += 10;
      }
    }
    // PLOT TWIST / DIALOGUE POLISH
    else {
      const type = evolutionRoll > 0.5 ? 'PLOT_TWIST_ADDED' : 'DIALOGUE_POLISH';
      const impact = type === 'PLOT_TWIST_ADDED' ? 12 : 5;
      
      const event: import('@/engine/types').ScriptEvent = {
        week: p.weeksInPhase,
        type: type,
        description: type === 'PLOT_TWIST_ADDED' ? `A major third-act twist has redefined the script's commercial potential.` : `The latest draft features significantly improved dialogue and pacing.`,
        qualityImpact: impact,
        heatGain: type === 'PLOT_TWIST_ADDED' ? 8 : 3
      };
      p.scriptEvents.push(event);
      p.buzz += impact;
    }
  }

  return { project: p as import('@/engine/types').Project };
}
