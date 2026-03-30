import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { advanceRumors } from '../../../engine/systems/rumors';
import { GameState, Rumor, TalentProfile } from '../../../engine/types';
import * as utils from '../../../engine/utils';

describe('advanceRumors', () => {
  beforeEach(() => {
    // Reset any existing mocks
    vi.restoreAllMocks();
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('mock-uuid-1234');
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
      internal: { projects: [], contracts: [], financeHistory: [] }
    },
    market: { opportunities: [], buyers: [] },
    industry: {
      rivals: [],
      headlines: [],
      families: [],
      agencies: [],
      agents: [],
      talentPool: [],
      newsHistory: [],
      rumors: []
    },
    culture: { genrePopularity: {} },
    finance: { bankBalance: 1000, yearToDateRevenue: 0, yearToDateExpenses: 0 },
    history: []
  };

  it('handles missing rumors array gracefully', () => {
    const stateWithoutRumors = {
      ...baseState,
      industry: { ...baseState.industry, rumors: undefined }
    };

    // Force secureRandom to not generate new rumors
    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.99);

    const nextState = advanceRumors(stateWithoutRumors);
    expect(nextState.industry.rumors).toBeDefined();
    expect(nextState.industry.rumors).toEqual([]);
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
    };

    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.99);

    const nextState = advanceRumors(stateWithRumor);

    // The rumor is 5 weeks old, and resolved, so it gets cleaned up immediately
    // because week(10) - rumor.week(5) = 5 > 4.
    // However, the headline should still be generated.
    expect(nextState.industry.headlines).toHaveLength(1);
    expect(nextState.industry.headlines[0].text).toBe('CONFIRMED: Test truthful rumor');
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
    };

    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.99);

    const nextState = advanceRumors(stateWithRumor);

    // Gets cleaned up since 10 - 5 = 5 > 4
    expect(nextState.industry.headlines).toHaveLength(1);
    expect(nextState.industry.headlines[0].text).toBe('DEBUNKED: Previous rumors regarding test false rumor turn out to be false.');
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
      };

      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.99);

      const nextState = advanceRumors(stateWithRumor);

      expect(nextState.industry.rumors![0].resolved).toBe(true);
      expect(nextState.industry.headlines).toHaveLength(1);
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
    };

    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.99);

    const nextState = advanceRumors(stateWithRumors);

    // r1 should be removed (10 - 5 = 5 > 4 and resolved)
    // r2 should be kept (10 - 8 = 2 <= 4 and resolved)
    // r3 should be kept (not resolved)
    expect(nextState.industry.rumors).toHaveLength(2);
    expect(nextState.industry.rumors!.find(r => r.id === 'r1')).toBeUndefined();
    expect(nextState.industry.rumors!.find(r => r.id === 'r2')).toBeDefined();
    expect(nextState.industry.rumors!.find(r => r.id === 'r3')).toBeDefined();
  });

  it('generates new rumors when random conditions are met', () => {
    const talent: TalentProfile = {
      id: 't1',
      name: 'Star Actor',
      type: 'actor',
      tier: 'a',
      marketValue: 100,
      reputation: 50,
      perks: [],
      quirks: [],
      contractId: null
    };

    const stateWithoutRumors = {
      ...baseState,
      industry: { ...baseState.industry, talentPool: [talent] }
    };

    // Force rumor generation:
    // secureRandom() < 0.05 -> generate
    // secureRandom() > 0.5 -> truthful
    // Need multiple returns since secureRandom is called multiple times
    // Call 1: 0.01 (< 0.05, generate rumor)
    // Call 2: 0.6 (> 0.5, truthful)
    vi.spyOn(utils, 'secureRandom')
      .mockReturnValueOnce(0.01)
      .mockReturnValueOnce(0.6);

    // Force pick to return 'talent' and then the talent
    vi.spyOn(utils, 'pick')
      .mockReturnValueOnce('talent') // category
      .mockReturnValueOnce(talent) // talent
      .mockReturnValueOnce('Star Actor is secretly looking to direct their next feature.'); // specific text

    vi.spyOn(utils, 'randRange').mockReturnValue(4);

    const nextState = advanceRumors(stateWithoutRumors);

    expect(nextState.industry.rumors).toHaveLength(1);
    const newRumor = nextState.industry.rumors![0];

    expect(newRumor.category).toBe('talent');
    expect(newRumor.truthful).toBe(true);
    expect(newRumor.resolved).toBe(false);
    expect(newRumor.text).toBe('Star Actor is secretly looking to direct their next feature.');
    expect(newRumor.resolutionWeek).toBe(14); // 10 + 4

    expect(nextState.industry.headlines).toHaveLength(1);
    expect(nextState.industry.headlines[0].text).toContain('RUMOR: Star Actor is secretly looking to direct their next feature.');
  });
});
