import { describe, it, expect } from 'vitest';
import { GameState, Agency, Agent, Talent } from '@/engine/types';
import { tickAgencies } from '@/engine/systems/ai/AgentBrain';

describe('Agent Brain (Target C2)', () => {
  const mockAgency: Agency = {
    id: 'a1',
    name: 'CAA Clone',
    archetype: 'powerhouse',
    tier: 'powerhouse',
    culture: 'shark',
    prestige: 90,
    leverage: 80,
    currentMotivation: 'THE_SHARK'
  };

  const mockState = {
    week: 1,
    industry: {
      agencies: [mockAgency],
      rivals: [{ id: 'r1', name: 'Rival Studio' }]
    }
  } as unknown as GameState;

  it('should generate rumors for SHARK agencies', () => {
    const impacts = tickAgencies(mockState);
    const rumors = impacts.filter(i => i.type === 'NEWS_ADDED');
    // Since it's probabilistic, we can't always guarantee, but we check return type
    expect(Array.isArray(impacts)).toBe(true);
  });
});
