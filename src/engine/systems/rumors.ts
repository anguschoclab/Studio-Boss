import { GameState, Rumor } from '@/engine/types';
import { pick, randRange, secureRandom } from '../utils';

export function advanceRumors(state: GameState): GameState {
  let currentRumors = state.industry.rumors || [];
  const newHeadlines = [...state.industry.headlines];
  
  // Resolve rumors that are due
  currentRumors = currentRumors.map(r => {
    if (!r.resolved && state.week >= (r.resolutionWeek || state.week)) {
      if (r.truthful) {
        newHeadlines.unshift({
          id: crypto.randomUUID(),
          week: state.week,
          category: 'rumor' as const,
          text: `CONFIRMED: ${r.text}`
        });
      } else {
        newHeadlines.unshift({
          id: crypto.randomUUID(),
          week: state.week,
          category: 'rumor' as const,
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
    
    if (category === 'talent' && state.industry.talentPool.length > 0) {
      const talent = pick(state.industry.talentPool);
      const rumors = [
        `${talent.name} reportedly demanding unprecedented back-end points on next project.`,
        `Sources say ${talent.name} is extremely difficult to work with on set.`,
        `${talent.name} is secretly looking to direct their next feature.`
      ];
      text = pick(rumors);
    } else if (category === 'rival' && state.industry.rivals.length > 0) {
      const rival = pick(state.industry.rivals);
      const rumors = [
        `${rival.name} is allegedly facing severe cash flow issues.`,
        `Word around town is ${rival.name} is preparing a monumental buyout offer.`,
        `Exec shakeups expected soon at ${rival.name}.`
      ];
      text = pick(rumors);
    } else if (category === 'project' && state.studio.internal.projects.length > 0) {
      const project = pick(state.studio.internal.projects);
      if (project.status === 'production') {
        text = `Production on "${project.title}" is rumored to be wildly over budget.`;
      } else {
        text = `Early test screenings for "${project.title}" are supposedly disastrous.`;
      }
    }
    
    const rumor: Rumor = {
      id: crypto.randomUUID(),
      text,
      week: state.week,
      category,
      truthful: isTrue,
      resolved: false,
      resolutionWeek: state.week + randRange(2, 6)
    };
    
    currentRumors.push(rumor);
    
    newHeadlines.unshift({
      id: crypto.randomUUID(),
      week: state.week,
      category: 'rumor' as const,
      text: `RUMOR: ${text}`
    });
  }
  
  return {
    ...state,
    industry: {
      ...state.industry,
      rumors: currentRumors,
      headlines: newHeadlines.slice(0, 50)
    }
  };
}
