import { GameState, Rumor, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * RumorProcessor handles the lifecycle of industry whispers.
 */
export class RumorProcessor {
  /**
   * Advances the state of existing rumors and potentially generates new ones.
   */
  static advanceRumors(state: GameState, week: number, rng: RandomGenerator): StateImpact {
    const newHeadlines: import('../../types/engine.types').Headline[] = [];
    const currentRumors = state.industry?.rumors || [];
    const updatedRumors: Rumor[] = [];
    
    // 1. Resolve rumors that are due
    for (const r of currentRumors) {
      if (!r.resolved && week >= (r.resolutionWeek || week)) {
        if (r.truthful) {
          newHeadlines.push({
            id: rng.uuid('HL'),
            week: week,
            category: 'rumor',
            text: `CONFIRMED: ${r.text}`,
            publication: 'Variety'
          });
        } else {
          newHeadlines.push({
            id: rng.uuid('HL'),
            week: week,
            category: 'rumor',
            text: `DEBUNKED: Previous rumors regarding ${r.text.toLowerCase()} turn out to be false.`,
            publication: 'The Hollywood Reporter'
          });
        }
        updatedRumors.push({ ...r, resolved: true });
      } else {
        // Keep unresolved rumors or recently resolved ones
        if (!r.resolved || (week - r.week <= 4)) {
            updatedRumors.push(r);
        }
      }
    }
    
    // 2. Generate new rumors (5% base chance)
    if (rng.next() < 0.05 && updatedRumors.filter(r => !r.resolved).length < 3) {
      const isTrue = rng.next() > 0.5;
      const subjects = ['talent', 'rival', 'project'];
      const category = subjects[Math.floor(rng.next() * subjects.length)] as 'talent' | 'rival' | 'project';
      
      let text = 'Unnamed studio in talks for a massive merger.';
      
      const talents = Object.values(state.entities.talents || {});
      const rivals = Object.values(state.entities.rivals || {});
      const projects = Object.values(state.entities.projects || {});

      if (category === 'talent' && talents.length > 0) {
        const talent = talents[Math.floor(rng.next() * talents.length)];
        const rumorTexts = [
          `${talent.name} reportedly demanding unprecedented back-end points on next project.`,
          `Sources say ${talent.name} is extremely difficult to work with on set.`,
          `${talent.name} is secretly looking to direct their next feature.`
        ];
        text = rumorTexts[Math.floor(rng.next() * rumorTexts.length)];
      } else if (category === 'rival' && rivals.length > 0) {
        const rival = rivals[Math.floor(rng.next() * rivals.length)];
        const rumorTexts = [
          `${rival.name} is allegedly facing severe cash flow issues.`,
          `Word around town is ${rival.name} is preparing a monumental buyout offer.`,
          `Exec shakeups expected soon at ${rival.name}.`
        ];
        text = rumorTexts[Math.floor(rng.next() * rumorTexts.length)];
      } else if (category === 'project' && projects.length > 0) {
        const project = projects[Math.floor(rng.next() * projects.length)];
        if (project.state === 'production') {
          text = `Production on "${project.title}" is rumored to be wildly over budget.`;
        } else {
          text = `Early test screenings for "${project.title}" are supposedly disastrous.`;
        }
      }
      
      const rumor: Rumor = {
        id: rng.uuid('RUM'),
        text,
        week: week,
        category,
        truthful: isTrue,
        resolved: false,
        resolutionWeek: week + Math.floor(rng.range(2, 6))
      };
      
      updatedRumors.push(rumor);
      
      newHeadlines.push({
        id: rng.uuid('HL'),
        week: week,
        category: 'rumor',
        text: `RUMOR: ${text}`,
        publication: 'Deadline'
      });
    }
    
    return {
      type: 'INDUSTRY_RUMORS_UPDATED',
      payload: {
        rumors: updatedRumors,
        headlines: newHeadlines
      }
    } as any; // Using any for brevity in returning modular impact
  }
}
