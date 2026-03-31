import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { advanceRumors } from '../../../engine/systems/rumors';
import { GameState, Rumor, Talent, ContentFlag } from '../../../engine/types';
import * as utils from '../../../engine/utils';

describe('advanceRumors', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('12345678-1234-1234-1234-123456789012');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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

    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.99); // No new rumor (0.05 chance)

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

    const stateWithRumor = {
      ...baseState,
      industry: { ...baseState.industry, rumors: [rumor] }
    } as unknown as GameState;

    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.99);

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

    const stateWithRumor = {
      ...baseState,
      industry: { ...baseState.industry, rumors: [rumor] }
    } as unknown as GameState;

    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.99);

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

    const stateWithTalent = {
      ...baseState,
      industry: { ...baseState.industry, talentPool: { [talent.id]: talent } }
    } as unknown as GameState;

    // secureRandom() < 0.05 -> trigger new rumor
    // secureRandom() > 0.5 -> truthful
    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.01); 
    vi.spyOn(utils, 'pick').mockReturnValue('talent'); 
    vi.spyOn(utils, 'randRange').mockReturnValue(4);

    const impact = advanceRumors(stateWithTalent);

    expect(impact.newRumors).toHaveLength(1);
    const newRumor = impact.newRumors![0];

    expect(newRumor.category).toBe('talent');
    expect(newRumor.resolved).toBe(false);
    expect(impact.newHeadlines![0].text).toContain('RUMOR:');
  });
});
