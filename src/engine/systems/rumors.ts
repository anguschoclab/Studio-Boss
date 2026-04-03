import { pick } from '../utils';
import { GameState, Rumor } from '@/engine/types';
import { StateImpact } from '../types/state.types';
import { RandomGenerator } from '../utils/rng';

export function advanceRumors(state: GameState, rng: RandomGenerator): StateImpact {
  const newHeadlines: import('../types/engine.types').Headline[] = [];
  let currentRumors = state.industry.rumors || [];
  
  // Resolve rumors that are due
  currentRumors = currentRumors.map(r => {
    if (!r.resolved && state.week >= (r.resolutionWeek || state.week)) {
      if (r.truthful) {
        newHeadlines.push({
          id: (rng && rng.uuid ? rng.uuid.bind(rng) : (prefix) => `${prefix}-${Math.random()}`)(`confirm-${r.id}-${state.week}`),
          week: state.week,
          category: 'rumor',
          text: `CONFIRMED: ${r.text}`
        });
      } else {
        newHeadlines.push({
          id: (rng && rng.uuid ? rng.uuid.bind(rng) : (prefix) => `${prefix}-${Math.random()}`)(`debunk-${r.id}-${state.week}`),
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
  if ((rng && rng.next ? rng.next() : Math.random()) < 0.05 && currentRumors.filter(r => !r.resolved).length < 3) {
    const isTrue = (rng && rng.next ? rng.next() : Math.random()) > 0.5;
    const subjects = ['talent', 'rival', 'project'];
    const category = (rng && rng.pick ? rng.pick.bind(rng) : pick)(subjects) as 'talent' | 'rival' | 'project';
    
    let text = 'Unnamed studio in talks for a massive merger.';
    
    if (category === 'talent' && Object.keys(state.industry.talentPool).length > 0) {
      const talent = (rng && rng.pick ? rng.pick.bind(rng) : pick)(Object.values(state.industry.talentPool));
      const rumors = [
        `${talent.name} reportedly demanding unprecedented back-end points on next project.`,
        `Sources say ${talent.name} is extremely difficult to work with on set.`,
        `${talent.name} is secretly looking to direct their next feature.`
      ];
      text = (rng && rng.pick ? rng.pick.bind(rng) : pick)(rumors);
    } else if (category === 'rival' && state.industry.rivals.length > 0) {
      const rival = (rng && rng.pick ? rng.pick.bind(rng) : pick)(state.industry.rivals);
      const rumors = [
        `${rival.name} is allegedly facing severe cash flow issues.`,
        `Word around town is ${rival.name} is preparing a monumental buyout offer.`,
        `Exec shakeups expected soon at ${rival.name}.`
      ];
      text = (rng && rng.pick ? rng.pick.bind(rng) : pick)(rumors);
    } else if (category === 'project' && Object.keys(state.studio.internal.projects).length > 0) {
      const project = (rng && rng.pick ? rng.pick.bind(rng) : pick)(Object.values(state.studio.internal.projects));
      if (project.state === 'production') {
        text = `Production on "${project.title}" is rumored to be wildly over budget.`;
      } else {
        text = `Early test screenings for "${project.title}" are supposedly disastrous.`;
      }
    }
    
    const rumor: Rumor = {
      id: (rng && rng.uuid ? rng.uuid.bind(rng) : (prefix) => `${prefix}-${Math.random()}`)('rumor'),
      text,
      week: state.week,
      category,
      truthful: isTrue,
      resolved: false,
      resolutionWeek: state.week + Math.floor(rng.range(2, 6))
    };
    
    currentRumors.push(rumor);
    
    newHeadlines.push({
      id: (rng && rng.uuid ? rng.uuid.bind(rng) : (prefix) => `${prefix}-${Math.random()}`)(`rumor-headline-${rumor.id}`),
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
