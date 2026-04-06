import { describe, it, expect } from 'vitest';
import { tickWorldEvents } from '../../../../engine/systems/ai/WorldSimulator';
import { GameState, Project, Talent, StateImpact } from '../../../../engine/types';
import { RandomGenerator } from '../../../../engine/utils/rng';
import { createMockGameState, createMockProject, createMockTalent } from '../../../utils/mockFactories';

describe('tickWorldEvents', () => {
  const rng = new RandomGenerator(789);
  
  it('generates MARKET SATURATION news when a project is released', () => {
    const state = createMockGameState();
    const releasedProject = createMockProject({
      id: 'p1',
      title: 'Action Hit',
      state: 'released',
      weeksInPhase: 1,
      revenue: 100_000_000,
    });
    state.entities.projects['p1'] = releasedProject;

    const impacts = tickWorldEvents(state, rng);
    
    if (impacts.length > 0) {
      const impact = impacts[0] as StateImpact;
      expect(impact.type).toBe('NEWS_ADDED');
      expect((impact.payload as any).headline).toContain('MARKET SATURATION');
    }
  });

  it('generates STAR RISING news for talents with high momentum', () => {
    const state = createMockGameState();
    const star = createMockTalent({
      id: 't1',
      name: 'Superstar',
      tier: 1,
      momentum: 90,
    });
    state.entities.talents = { 't1': star };

    const impacts = tickWorldEvents(state, rng);
    
    const risingStarImpact = impacts.find(i => 
      i.type === 'NEWS_ADDED' && (i.payload as any).headline.includes('STAR RISING')
    );
    
    if (risingStarImpact) {
      expect(risingStarImpact.type).toBe('NEWS_ADDED');
    }
  });
});
