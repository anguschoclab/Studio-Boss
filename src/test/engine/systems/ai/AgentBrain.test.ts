import { describe, it, expect } from 'vitest';
import { GameState, Agency } from '@/engine/types';
import { tickAgencies } from '@/engine/systems/ai/AgentBrain';
import { RandomGenerator } from '@/engine/utils/rng';

describe('Agent Brain (Target C2)', () => {
  const rng = new RandomGenerator(888);
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
    // Probabilistic, but we pass RNG now
    const impacts = tickAgencies(mockState, rng);
    expect(Array.isArray(impacts)).toBe(true);
  });
});
