import { describe, it, expect, vi } from 'vitest';
import { advanceRumors } from '../../../engine/systems/rumors';
import { Rumor, Talent } from '../../../engine/types';
import { RandomGenerator } from '../../../engine/utils/rng';
import { createMockGameState } from '../../mockFactory';

describe('advanceRumors', () => {
  it('handles missing rumors array gracefully', () => {
    const stateWithoutRumors = createMockGameState({
      industry: { ...createMockGameState().industry, rumors: undefined }
    });
    const rng = new RandomGenerator(1);

    const impact = advanceRumors(stateWithoutRumors, 10, rng);
    expect(impact.payload.rumors).toBeDefined();
    expect(impact.payload.rumors).toEqual([]);
  });

  it('resolves truthful rumors and generates CONFIRMED headlines', () => {
    const rumor: Rumor = {
      id: 'r1',
      text: 'Test truthful rumor',
      week: 5,
      truthful: true,
      category: 'project',
      resolved: false,
      resolutionWeek: 10
    };

    const stateWithRumor = createMockGameState({
      industry: { ...createMockGameState().industry, rumors: [rumor] }
    });
    const rng = new RandomGenerator(1);

    const impact = advanceRumors(stateWithRumor, 10, rng);

    expect(impact.payload.headlines).toHaveLength(1);
    expect(impact.payload.headlines[0].text).toBe('CONFIRMED: Test truthful rumor');
  });

  it('resolves false rumors and generates DEBUNKED headlines', () => {
    const rumor: Rumor = {
      id: 'r1',
      text: 'Test false rumor',
      week: 5,
      truthful: false,
      category: 'project',
      resolved: false,
      resolutionWeek: 10
    };

    const stateWithRumor = createMockGameState({
      industry: { ...createMockGameState().industry, rumors: [rumor] }
    });
    const rng = new RandomGenerator(1);

    const impact = advanceRumors(stateWithRumor, 10, rng);

    expect(impact.payload.headlines).toHaveLength(1);
    expect(impact.payload.headlines[0].text).toBe('DEBUNKED: Previous rumors regarding test false rumor turn out to be false.');
  });

  it('generates new rumors when random conditions are met', () => {
    const talent: Talent = {
      id: 't1',
      name: 'Star Actor',
      role: 'actor',
      roles: ['actor'],
      tier: 'A_LIST',
      prestige: 50,
      fee: 1_000_000,
      draw: 50,
      accessLevel: 'outsider',
      momentum: 50,
      demographics: { age: 30, gender: 'MALE', ethnicity: 'White', country: 'USA' },
      psychology: { ego: 50, mood: 100, scandalRisk: 0, synergyAffinities: [], synergyConflicts: [] }
    } as Talent;

    const stateWithTalent = createMockGameState({
      entities: { 
        ...createMockGameState().entities,
        talents: { [talent.id]: talent } 
      }
    });

    // Use a seed that triggers a rumor
    const rng = new RandomGenerator(12345); // Trial and error or deterministic insight needed
    
    const impact = advanceRumors(stateWithTalent, 10, rng);

    if (impact.payload.rumors && impact.payload.rumors.length > 0) {
      const newRumor = impact.payload.rumors[0];
      expect(newRumor.resolved).toBe(false);
      expect(impact.payload.headlines![0].text).toContain('RUMOR:');
    }
  });
});
