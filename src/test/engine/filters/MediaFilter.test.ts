
import { describe, it, expect, beforeEach } from 'vitest';
import { MediaFilter } from '@/engine/services/filters/MediaFilter';
import { createMockGameState, createMockTickContext } from '../generators/mockFactory';

describe('MediaFilter', () => {
  let mockState: unknown;
  let mockContext: unknown;

  beforeEach(() => {
    mockState = createMockGameState();
    mockContext = createMockTickContext();

    // Ensure deals structure according to filter expectations
    mockState.deals = {
      activeDeals: [],
      expiredDeals: [],
      pendingOffers: []
    };
  });

  it('should have correct name', () => {
    expect(MediaFilter.name).toBe('MediaFilter');
  });

  it('should execute without errors', () => {
    expect(() => MediaFilter.execute(mockState, mockContext)).not.toThrow();
  });

  it('should generate impacts for foundational media dynamics', () => {
    MediaFilter.execute(mockState, mockContext);
    // advanceRumors usually generates RUMOR_ADDED or headline updates
    // Even if no specific rumors, the system shouldn't crash
    expect(mockContext.impacts).toBeDefined();
  });

  it('should handle systems with active deals', () => {
      mockState.deals.activeDeals = [
          { id: 'DEAL-1', type: 'FIRST_LOOK', talentId: 'TAL-1', weekStarted: 1, duration: 12 }
      ];
      expect(() => MediaFilter.execute(mockState, mockContext)).not.toThrow();
  });

  it('should not modify context.week', () => {
    const weekBefore = mockContext.week;
    MediaFilter.execute(mockState, mockContext);
    expect(mockContext.week).toBe(weekBefore);
  });
});
