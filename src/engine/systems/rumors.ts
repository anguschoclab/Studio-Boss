import { GameState, Rumor } from '@/engine/types';
import { StateImpact } from '../types/state.types';
import { pick, randRange, secureRandom, generateId } from '../utils';

/**
 * Advances the industry rumor system by one week.
 * Resolves due rumors into confirmed or debunked headlines, removes stale resolved rumors,
 * and has a small chance to generate new industry rumors based on current game state.
 * 
 * @param state - The current game state
 * @returns A StateImpact containing the updated rumors list and any new headlines generated.
 */
export function advanceRumors(state: GameState): StateImpact {
  const newHeadlines: import('../types/engine.types').Headline[] = [];
  let currentRumors = state.industry.rumors || [];
  
  // Resolve rumors that are due
  currentRumors = currentRumors.map(r => {
    if (!r.resolved && state.week >= (r.resolutionWeek || state.week)) {
      if (r.truthful) {
        newHeadlines.push({
          id: `confirm-${r.id}-${state.week}`,
          week: state.week,
          category: 'rumor',
          text: `CONFIRMED: ${r.text}`
        });
      } else {
        newHeadlines.push({
          id: `debunk-${r.id}-${state.week}`,
          week: state.week,
          category: 'rumor',
          text: `DEBUNKED: Previous rumors regarding ${r.text.toLowerCase()} turn out to be false.`
        });
      }
      return { ...r, resolved: true };
    }
    return r;
  });
  
  // Remove resolved rumors older than 4 weeks
  currentRumors = currentRumors.filter(r => !(r.resolved && state.week - r.week > 4));
  
  // Generate new rumors (5% chance per week)
  if (secureRandom() < 0.05 && currentRumors.filter(r => !r.resolved).length < 3) {
    const isTrue = secureRandom() > 0.5;
    const subjects = ['talent', 'rival', 'project'];
    const category = pick(subjects) as 'talent' | 'rival' | 'project';
    
    let text = 'Unnamed studio in talks for a massive merger.';
    
    if (category === 'talent' && Object.keys(state.entities.talents || {}).length > 0) {
      const talent = pick(Object.values(state.entities.talents));
      const rumors = [
        `${talent.name} reportedly demanding unprecedented back-end points on next project.`,
        `Sources say ${talent.name} is extremely difficult to work with on set.`,
        `${talent.name} is secretly looking to direct their next feature.`
      ];
      text = pick(rumors);
    } else if (category === 'rival' && Object.keys(state.entities.rivals || {}).length > 0) {
      const rival = pick(Object.values(state.entities.rivals));
      const rumors = [
        `${rival.name} is allegedly facing severe cash flow issues.`,
        `Word around town is ${rival.name} is preparing a monumental buyout offer.`,
        `Exec shakeups expected soon at ${rival.name}.`
      ];
      text = pick(rumors);
    } else if (category === 'project' && Object.keys(state.entities.projects || {}).length > 0) {
      const project = pick(Object.values(state.entities.projects));
      if (project.state === 'production') {
        text = `Production on "${project.title}" is rumored to be wildly over budget.`;
      } else {
        text = `Early test screenings for "${project.title}" are supposedly disastrous.`;
      }
    }
    
    const rumor: Rumor = {
      id: generateId('RUM'),
      text,
      week: state.week,
      category,
      truthful: isTrue,
      resolved: false,
      resolutionWeek: state.week + randRange(2, 6)
    };
    
    currentRumors.push(rumor);
    
    newHeadlines.push({
      id: `rumor-headline-${rumor.id}`,
      week: state.week,
      category: 'rumor',
      text: `RUMOR: ${text}`
    });
  }
  
  return {
    newRumors: currentRumors,
    newHeadlines
  };
}

