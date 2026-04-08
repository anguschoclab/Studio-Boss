import { pick } from '../utils';
import { GameState, Rumor } from '@/engine/types';
import { StateImpact } from '../types/state.types';
import { RandomGenerator } from '../utils/rng';
import { BardResolver } from './bardResolver';

type RumorCategory = 'talent' | 'rival' | 'market' | 'project';

export function advanceRumors(state: GameState, rng: RandomGenerator): StateImpact {
  const newHeadlines: import('../types/engine.types').Headline[] = [];
  let currentRumors = state.industry.rumors || [];
  
  // Resolve rumors that are due
  currentRumors = currentRumors.map(r => {
    if (!r.resolved && state.week >= (r.resolutionWeek || state.week)) {
      if (r.truthful) {
        newHeadlines.push({
          id: rng.uuid('NWS'),
          week: state.week,
          category: 'rumor',
          text: `CONFIRMED: ${r.text}`
        });
      } else {
        newHeadlines.push({
          id: rng.uuid('NWS'),
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
  
  // Generate new rumors based on studio size/prestige
  // The PR Spin Doctor: Heavily scale rumors with studio size (more prestige = higher chance, higher cap)
  const baseRumorChance = 0.05 + (state.studio.prestige * 0.003);
  const maxActiveRumors = Math.max(3, Math.floor(state.studio.prestige / 20));

  if (rng.next() < baseRumorChance && currentRumors.filter(r => !r.resolved).length < maxActiveRumors) {
    const isTrue = rng.next() < 0.6;
    const subjects: RumorCategory[] = ['talent', 'rival', 'project'];
    const category = pick(subjects, rng);
    
    let text = '';
    
    if (category === 'talent' && Object.keys(state.entities.talents).length > 0) {
      const talent = pick(Object.values(state.entities.talents), rng);
      text = BardResolver.resolve({
        domain: 'Industry',
        subDomain: 'Rumor',
        intensity: rng.range(0, 100),
        tone: 'Tabloid',
        context: { actor: talent.name },
        rng
      });
    } else if (category === 'rival') {
      const rival = pick(Object.values(state.entities.rivals || {}), rng);
      text = BardResolver.resolve({
        domain: 'Industry',
        subDomain: 'Rumor',
        intensity: rng.range(0, 100),
        tone: 'Tabloid',
        context: { actor: rival.name },
        rng
      });
    } else if (category === 'project' && Object.keys(state.entities.projects).length > 0) {
      const project = pick(Object.values(state.entities.projects), rng);
      text = BardResolver.resolve({
        domain: 'Industry',
        subDomain: 'Rumor',
        intensity: rng.range(0, 100),
        tone: 'Trade',
        context: { project: project.title },
        rng
      });
    } else {
      text = 'Unnamed studio in talks for a massive merger.';
    }
    
    const rumor: Rumor = {
      id: rng.uuid('RMR'),
      text,
      week: state.week,
      category,
      truthful: isTrue,
      resolved: false,
      resolutionWeek: state.week + Math.floor(rng.range(2, 6))
    };
    
    currentRumors.push(rumor);
    
    newHeadlines.push({
      id: rng.uuid('NWS'),
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
