import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { advanceRumors } from '../../../engine/systems/rumors';
import { GameState, Rumor, TalentProfile } from '../../../engine/types';
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
    cash: 1000,
    studio: {
      name: 'Test Studio',
      archetype: 'major',
      prestige: 50,
      internal: { projects: {}, contracts: [], financeHistory: [] }
    },
    market: { opportunities: [], buyers: [] },
    industry: {
      rivals: [],
      headlines: [],
      families: [],
      agencies: [],
      agents: [],
      talentPool: {},
      newsHistory: [],
      rumors: []
    },
    culture: { genrePopularity: {} },
    finance: { bankBalance: 1000, yearToDateRevenue: 0, yearToDateCosts: 0 },
    history: []
  } as any;

  it('handles missing rumors array gracefully', () => {
    const stateWithoutRumors = {
      ...baseState,
      industry: { ...baseState.industry, rumors: undefined }
    } as any;

    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.99);

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
      industry: { ...baseState.industry, rumors: [rumor], headlines: [] }
    } as any;

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
      industry: { ...baseState.industry, rumors: [rumor], headlines: [] }
    } as any;

    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.99);

    const impact = advanceRumors(stateWithRumor);

    expect(impact.newHeadlines).toHaveLength(1);
    expect(impact.newHeadlines![0].text).toBe('DEBUNKED: Previous rumors regarding test false rumor turn out to be false.');
  });

  it('keeps resolved rumors that are not older than 4 weeks', () => {
      const rumor: Rumor = {
        id: 'r1',
        text: 'Test false rumor',
        week: 8,
        truthful: false,
        category: 'project',
        resolved: false,
        resolutionWeek: 10
      };

      const stateWithRumor = {
        ...baseState,
        industry: { ...baseState.industry, rumors: [rumor], headlines: [] }
      } as any;

      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.99);

      const impact = advanceRumors(stateWithRumor);

      expect(impact.newRumors![0].resolved).toBe(true);
      expect(impact.newHeadlines).toHaveLength(1);
  });

  it('cleans up resolved rumors older than 4 weeks', () => {
    const resolvedOldRumor: Rumor = {
      id: 'r1',
      text: 'Old rumor',
      week: 5,
      truthful: true,
      category: 'project',
      resolved: true,
      resolutionWeek: 5
    };

    const resolvedRecentRumor: Rumor = {
      id: 'r2',
      text: 'Recent rumor',
      week: 8,
      truthful: true,
      category: 'project',
      resolved: true,
      resolutionWeek: 8
    };

    const unresolvedOldRumor: Rumor = {
      id: 'r3',
      text: 'Unresolved old rumor',
      week: 2,
      truthful: true,
      category: 'project',
      resolved: false,
      resolutionWeek: 15
    };

    const stateWithRumors = {
      ...baseState,
      week: 10,
      industry: { ...baseState.industry, rumors: [resolvedOldRumor, resolvedRecentRumor, unresolvedOldRumor] }
    } as any;

    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.99);

    const impact = advanceRumors(stateWithRumors);

    expect(impact.newRumors).toHaveLength(2);
    expect(impact.newRumors!.find(r => r.id === 'r1')).toBeUndefined();
    expect(impact.newRumors!.find(r => r.id === 'r2')).toBeDefined();
    expect(impact.newRumors!.find(r => r.id === 'r3')).toBeDefined();
  });

  it('generates new rumors when random conditions are met', () => {
    const talent: TalentProfile = {
      id: 't1',
      name: 'Star Actor',
      roles: ['actor'],
      prestige: 50,
      fee: 1000000,
      draw: 50,
      temperament: 'Pro',
      accessLevel: 'outsider',
      age: 30,
      gender: 'male'
    };

    const stateWithoutRumors = {
      ...baseState,
      industry: { ...baseState.industry, talentPool: { [talent.id]: talent } }
    } as any;

    vi.spyOn(utils, 'secureRandom')
      .mockReturnValueOnce(0.01)
      .mockReturnValueOnce(0.6);

    vi.spyOn(utils, 'pick')
      .mockReturnValueOnce('talent') 
      .mockReturnValueOnce(talent);

    vi.spyOn(utils, 'randRange').mockReturnValue(4);

    const impact = advanceRumors(stateWithoutRumors);

    expect(impact.newRumors).toHaveLength(1);
    const newRumor = impact.newRumors![0];

    expect(newRumor.category).toBe('talent');
    expect(newRumor.truthful).toBe(true);
    expect(newRumor.resolved).toBe(false);
    expect(newRumor.resolutionWeek).toBe(14); 

    expect(impact.newHeadlines).toHaveLength(1);
    expect(impact.newHeadlines![0].text).toContain('RUMOR:');
  });
});
