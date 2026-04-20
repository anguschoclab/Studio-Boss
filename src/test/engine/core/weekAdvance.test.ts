import { describe, it, expect } from 'vitest';
import { advanceWeek } from '@/engine/core/weekAdvance';
import { RandomGenerator } from '@/engine/utils/rng';
import { createMockGameState } from '../../utils/mockFactories';

describe('Week Advance Pipeline (Target A4)', () => {
  const mockState = createMockGameState({
    week: 1,
    studio: {
      id: 'player-studio',
      name: 'Player Studio',
      archetype: 'major',
      prestige: 50,
      ownedPlatforms: [],
      internal: { projectHistory: [] },
      snapshotHistory: [],
      activeCampaigns: {},
    },
  });

  it('should process the week and return a summarized result', () => {
    const rng = new RandomGenerator(mockState.gameSeed);
    const { newState, summary } = advanceWeek(mockState, rng);
    
    expect(newState.week).toBe(2);
    expect(summary.fromWeek).toBe(1);
    expect(summary.toWeek).toBe(2);
    expect(newState).not.toBe(mockState);
  });
});


  describe('Edge Cases', () => {
    it('advances weeks safely with an empty pipeline', () => {
      const emptyState = createMockGameState({
        week: 1,
        studio: {
          id: 'empty-studio',
          name: 'Empty',
          prestige: 50,
          archetype: 'indie',
          ownedPlatforms: [],
          internal: { projectHistory: [] },
          snapshotHistory: [],
          activeCampaigns: {},
        },
      });

      const localRng = new RandomGenerator(123);
      const { newState, summary } = advanceWeek(emptyState, localRng);
      expect(newState.week).toBe(2);
      expect(summary.totalRevenue).toBeGreaterThanOrEqual(0); // Should be 0 + interest
      expect(summary.totalCosts).toBeGreaterThanOrEqual(0); // Should just be overhead
    });
  });
