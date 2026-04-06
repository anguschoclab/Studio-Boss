import { describe, it, expect, vi } from 'vitest';
import { advanceRumors } from '../../../engine/systems/rumors';
import { Rumor } from '../../../engine/types';
import { RandomGenerator } from '../../../engine/utils/rng';
import { createMockGameState, createMockTalent } from '../../utils/mockFactories';

describe('advanceRumors', () => {
  const rng = new RandomGenerator(111);

  it('handles missing rumors array gracefully', () => {
    const stateWithoutRumors = createMockGameState();
    stateWithoutRumors.industry.rumors = undefined as any;

    const unluckyRng = new RandomGenerator(99); 
    vi.spyOn(unluckyRng, 'next').mockReturnValue(0.99); // 0.99 > 0.05

    const impact = advanceRumors(stateWithoutRumors, unluckyRng);
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

    const stateWithRumor = createMockGameState();
    stateWithRumor.week = 10;
    stateWithRumor.industry.rumors = [rumor];

    const impact = advanceRumors(stateWithRumor, rng);

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

    const stateWithRumor = createMockGameState();
    stateWithRumor.week = 10;
    stateWithRumor.industry.rumors = [rumor];

    const impact = advanceRumors(stateWithRumor, rng);

    expect(impact.newHeadlines).toHaveLength(1);
    expect(impact.newHeadlines![0].text).toBe('DEBUNKED: Previous rumors regarding test false rumor turn out to be false.');
  });

  it('generates new rumors when random conditions are met', () => {
    const talent = createMockTalent({ id: 't1', name: 'Star Actor' });
    const stateWithTalent = createMockGameState();
    stateWithTalent.week = 10;
    stateWithTalent.entities.talents = { [talent.id]: talent };

    // Use a seed that triggers a rumor
    const luckyRng = new RandomGenerator(8); 
    vi.spyOn(luckyRng, 'next').mockReturnValue(0.01); // 0.01 < 0.05

    const impact = advanceRumors(stateWithTalent, luckyRng);

    expect(impact.newRumors!.length).toBeGreaterThan(0);
    const newRumor = impact.newRumors!.find(r => r.week === 10);

    expect(newRumor).toBeDefined();
    expect(newRumor!.resolved).toBe(false);
    expect(impact.newHeadlines!.some(h => h.text.includes('RUMOR:'))).toBe(true);
  });
});
