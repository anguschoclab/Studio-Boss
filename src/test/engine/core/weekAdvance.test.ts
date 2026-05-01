import { describe, it, expect } from 'vitest';
import { GameState } from '@/engine/types';
import { advanceWeek } from '@/engine/core/weekAdvance';
import { createMockGameState } from '../generators/mockFactory';

describe('Week Advance Pipeline (Target A4)', () => {
  const mockState = createMockGameState({
    week: 1,
    studioName: 'Player Studio'
  });

  it('should process the week and return a summarized result', () => {
    const { newState, summary } = advanceWeek(mockState);
    
    expect(newState.week).toBe(2);
    expect(summary.fromWeek).toBe(1);
    expect(summary.toWeek).toBe(2);
    expect(newState).not.toBe(mockState);
    
    // Ensure entities partition exists in new state
    expect(newState.entities).toBeDefined();
    expect(newState.entities.rivals).toBeDefined();
  });

  it('handles extreme edge case: advancing weeks with an empty pipeline', () => {
    const emptyState = createMockGameState({
      week: 1,
      studio: {
        ...createMockGameState().studio,
        internal: {
          ...createMockGameState().studio.internal,
          projects: {} // Empty pipeline
        }
      },
      entities: {
        projects: {},
        talents: {},
        contracts: {},
        rivals: {}
      }
    });

    const { newState, summary } = advanceWeek(emptyState);

    expect(newState.week).toBe(2);
    expect(summary.fromWeek).toBe(1);
    expect(summary.toWeek).toBe(2);
    expect(newState.studio.internal.projects).toEqual({});
  });
});
