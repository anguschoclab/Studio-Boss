import { describe, it, expect, vi } from 'vitest';
import { advanceRumors } from '../../../engine/systems/rumors';
import { GameState, Rumor, Talent } from '../../../engine/types';
import { RandomGenerator } from '../../../engine/utils/rng';

describe('advanceRumors', () => {
  const rng = new RandomGenerator(111);

  const baseState: GameState = {
    week: 10,
    gameSeed: 1,
    tickCount: 0,
    projects: { active: [] },
    game: { currentWeek: 10 },
    finance: { cash: 1000, ledger: [] },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    studio: {
      name: 'Test Studio',
      archetype: 'major',
      prestige: 50,
      internal: { projects: {}, contracts: [] }
    },
    market: { opportunities: [], buyers: [] },
    industry: {
      rivals: [],
      families: [],
      agencies: [],
      agents: [],
      talentPool: {} as Record<string, Talent>,
      newsHistory: [],
      rumors: []
    },
    culture: { genrePopularity: {} },
    history: [],
    eventHistory: []
  } as unknown as GameState;

  it('handles missing rumors array gracefully', () => {
    const stateWithoutRumors = {
      ...baseState,
      industry: { ...baseState.industry, rumors: undefined }
    } as unknown as GameState;

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

    const stateWithRumor = {
      ...baseState,
      industry: { ...baseState.industry, rumors: [rumor] }
    } as unknown as GameState;

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

    const stateWithRumor = {
      ...baseState,
      industry: { ...baseState.industry, rumors: [rumor] }
    } as unknown as GameState;

    const impact = advanceRumors(stateWithRumor, rng);

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

    const stateWithTalent = {
      ...baseState,
      industry: { ...baseState.industry, talentPool: { [talent.id]: talent } }
    } as unknown as GameState;

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
