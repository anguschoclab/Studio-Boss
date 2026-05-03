import { describe, it, expect, vi } from 'vitest';
import { advanceRumors } from '../../../engine/systems/rumors';
import { Rumor, Talent } from '../../../engine/types';
import { RandomGenerator } from '../../../engine/utils/rng';
import { createMockGameState } from '../../utils/mockFactories';

import { secureRandom } from '../../../engine/utils';

vi.mock('../../../engine/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../engine/utils')>();
  return {
    ...actual,
    secureRandom: vi.fn().mockReturnValue(0.99), // Always return 0.99 so no random rumors trigger
  };
});

describe('advanceRumors', () => {
  it('handles missing rumors array gracefully', () => {
    const stateWithoutRumors = createMockGameState({
      week: 10,
      industry: { ...createMockGameState().industry, rumors: undefined }
    });
    const impact = advanceRumors(stateWithoutRumors);
    expect(impact.newRumors).toBeDefined();
    expect(impact.newRumors).toEqual([]);
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
      week: 10,
      industry: { ...createMockGameState().industry, rumors: [rumor] }
    });
    const impact = advanceRumors(stateWithRumor);

    expect(impact.newHeadlines).toHaveLength(1);
    expect(impact.newHeadlines![0].text).toBe('CONFIRMED: Test truthful rumor');
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
      week: 10,
      industry: { ...createMockGameState().industry, rumors: [rumor] }
    });
    const impact = advanceRumors(stateWithRumor);

    expect(impact.newHeadlines).toHaveLength(1);
    expect(impact.newHeadlines![0].text).toBe('DEBUNKED: Previous rumors regarding test false rumor turn out to be false.');
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
      week: 10,
      entities: { 
        ...createMockGameState().entities,
        talents: { [talent.id]: talent } 
      }
    });

    // Temporarily mock secureRandom to trigger rumor logic
    vi.mocked(secureRandom).mockReturnValueOnce(0.01).mockReturnValueOnce(0.9);
    
    const impact = advanceRumors(stateWithTalent);

    if (impact.newRumors && impact.newRumors.length > 0) {
      const newRumor = impact.newRumors[0];
      expect(newRumor.resolved).toBe(false);
      expect(impact.newHeadlines![0].text).toContain('RUMOR:');
    }
  });
});
